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
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PromotionStatusResponse } from './promotion-orders.type';

// Generic namespace/events (/promotions) for reuse across promotion types.
// Rooms scoped by (businessId, redeemCode) prevent cross-promotion leaks.
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/promotions',
  transports: ['websocket', 'polling'],
})
@Injectable()
export class PromotionOrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
    server: Server;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  private static roomKey(businessId: string, redeemCode: string): string {
    return `promotion:${redeemCode}:${businessId}`;
  }

  handleConnection(client: Socket) {
    this.logger.info('[PROMOTION_GATEWAY]: Client connected', {
      socketId: client.id,
      remoteAddress: client.handshake.address,
    });
  }

  handleDisconnect(client: Socket) {
    // Socket.IO already removes a disconnected socket from every room it
    // joined - no manual room-membership bookkeeping needed here.
    this.logger.info('[PROMOTION_GATEWAY]: Client disconnected', {
      socketId: client.id,
    });
  }

  /**
   * Frontend joins when widget visible (one per businessId+redeemCode). Gets live updates instead of discovering on click.
   */
  @SubscribeMessage('join-promotion')
  handleJoin(
    @MessageBody() data: { businessId: string; redeemCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { businessId, redeemCode } = data || {};

    if (!businessId || !redeemCode) {
      client.emit('error', { message: 'businessId and redeemCode are required' });
      return;
    }

    client.join(PromotionOrdersGateway.roomKey(businessId, redeemCode));
  }

  /**
   * Frontend calls: socket.emit('leave-promotion', { businessId, redeemCode: 'LION_COIN' })
   */
  @SubscribeMessage('leave-promotion')
  handleLeave(
    @MessageBody() data: { businessId: string; redeemCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { businessId, redeemCode } = data || {};
    if (!businessId || !redeemCode) return;

    client.leave(PromotionOrdersGateway.roomKey(businessId, redeemCode));
  }

  /**
   * Called after any state change (reserve, release, redeem, expiry).
   * Broadcast-only, no holder-specific data.
   * Can't race reservation logic - lost events just mean stale drawer until next apply attempt.
   */
  emitStatusChange(
    status: PromotionStatusResponse,
    redeemCode = 'LION_COIN',
  ): void {
    const { businessId } = status;
    try {
      this.server.to(PromotionOrdersGateway.roomKey(businessId, redeemCode)).emit('promotion-updated', {
        ...status,
        redeemCode,
        updatedAt: new Date(),
      });
    } catch (err) {
      this.logger.error('[PROMOTION_GATEWAY]: Failed to emit status change', {
        businessId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
