import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { SessionBookingsService } from './session-bookings.service';

@WebSocketGateway({
  cors: {
    origin: process.env.TRAVEL_WEBSITE_URL || 'https://kesem.metgo.app',
    credentials: true,
  },
  namespace: '/session-bookings',
})
@Injectable()
export class SessionBookingsGateway
implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
    server: Server;

  private availabilityRooms = new Map<string, Set<string>>(); // wrapperId -> Set of socketIds

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    @Inject(forwardRef(() => SessionBookingsService))
    private readonly sessionBookingsService: SessionBookingsService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.info('[SESSION_BOOKINGS_GATEWAY]: Client connected', {
      socketId: client.id,
      remoteAddress: client.handshake.address,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.info('[SESSION_BOOKINGS_GATEWAY]: Client disconnected', {
      socketId: client.id,
    });

    // Remove client from all availability rooms
    this.availabilityRooms.forEach(socketIds => {
      socketIds.delete(client.id);
    });
  }

  /**
   * Handle client joining availability room for a specific wrapper.
   * Sends initial availability data immediately.
   *
   * Frontend calls: socket.emit('join-availability', { wrapperId: '...' })
   */
  @SubscribeMessage('join-availability')
  async handleJoinAvailability(
    @MessageBody() data: { wrapperId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { wrapperId } = data;

    if (!wrapperId) {
      this.logger.warn(
        '[SESSION_BOOKINGS_GATEWAY]: Missing wrapperId in join-availability',
      );
      client.emit('error', { message: 'wrapperId is required' });
      return;
    }

    try {
      // Join socket.io room
      client.join(`availability:${wrapperId}`);

      // Track room membership
      if (!this.availabilityRooms.has(wrapperId)) {
        this.availabilityRooms.set(wrapperId, new Set());
      }
      this.availabilityRooms.get(wrapperId).add(client.id);

      // Send initial availability data to client
      const availabilityData
        = await this.sessionBookingsService.getAvailability(wrapperId);

      client.emit('availability-updated', {
        wrapperId,
        sessions: availabilityData.data.sessions || availabilityData.sessions,
        updatedAt: new Date(),
        isInitial: true,
      });

      this.logger.info(
        '[SESSION_BOOKINGS_GATEWAY]: Client joined availability room',
        {
          socketId: client.id,
          wrapperId,
          roomSize: this.availabilityRooms.get(wrapperId).size,
        },
      );
    } catch (err) {
      this.logger.error(
        '[SESSION_BOOKINGS_GATEWAY]: Failed to join availability room',
        {
          socketId: client.id,
          wrapperId,
          error: err instanceof Error ? err.message : String(err),
        },
      );
      client.emit('error', { message: 'Failed to join availability room' });
    }
  }

  /**
   * Handle client leaving availability room.
   *
   * Frontend calls: socket.emit('leave-availability', { wrapperId: '...' })
   */
  @SubscribeMessage('leave-availability')
  handleLeaveAvailability(
    @MessageBody() data: { wrapperId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { wrapperId } = data;

    if (!wrapperId) {
      return;
    }

    client.leave(`availability:${wrapperId}`);
    this.availabilityRooms.get(wrapperId)?.delete(client.id);

    this.logger.info(
      '[SESSION_BOOKINGS_GATEWAY]: Client left availability room',
      {
        socketId: client.id,
        wrapperId,
        roomSize: this.availabilityRooms.get(wrapperId)?.size || 0,
      },
    );
  }

  /**
   * Emit availability update to all clients in a wrapper's room.
   *
   * Called from: SessionBookingsService after hold creation, expiration, confirmation
   */
  async emitAvailabilityUpdate(wrapperId: string): Promise<void> {
    try {
      const availabilityData
        = await this.sessionBookingsService.getAvailability(wrapperId);
      const roomSize = this.availabilityRooms.get(wrapperId)?.size || 0;

      this.server.to(`availability:${wrapperId}`).emit('availability-updated', {
        wrapperId,
        sessions: availabilityData.data.sessions || availabilityData.sessions,
        updatedAt: new Date(),
        isInitial: false,
      });

      this.logger.info(
        '[SESSION_BOOKINGS_GATEWAY]: Availability update emitted',
        {
          wrapperId,
          roomSize,
          timestamp: new Date(),
        },
      );
    } catch (err) {
      this.logger.error(
        '[SESSION_BOOKINGS_GATEWAY]: Failed to emit availability update',
        {
          wrapperId,
          error: err instanceof Error ? err.message : String(err),
        },
      );
    }
  }

  /**
   * Get active room count (for monitoring).
   */
  getActiveRooms(): number {
    return this.availabilityRooms.size;
  }

  /**
   * Get total connected clients across all rooms.
   */
  getTotalConnectedClients(): number {
    let total = 0;
    this.availabilityRooms.forEach(socketIds => {
      total += socketIds.size;
    });
    return total;
  }
}
