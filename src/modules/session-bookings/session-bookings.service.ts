import {
  BadRequestException,
  ConflictException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  encryptInviteToken,
  decryptInviteToken,
  InvitePayload,
} from 'src/common/utils/invite-token.util';
import { ConfirmSessionHoldDto } from './dto/confirm-session-hold.dto';
import { SessionBooking } from './schema/session-booking.schema';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { ConfigService } from 'src/services/config/config.service';
import { QRCodeService } from 'src/services/qr-code/qr-code.service';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { DynamicEmailTemplate } from 'src/common/mailchimp/templateId';
import { getCommonEmailFields } from 'src/common/utils/email/common-fields';
import { DocUploadService } from '../doc-upload/doc-upload.service';

// ── Constants ─────────────────────────────────────────────────────────────────
const HOLD_TTL_MINUTES = 7;
const INVITE_TTL_DAYS = 7; // Maximum token validity in days (fallback when no event date)

@Injectable()
export class SessionBookingsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    @InjectModel(SessionBooking.name)
    private readonly sessionBookingModel: Model<SessionBooking>,

    @InjectConnection()
    private readonly connection: Connection,

    private readonly mailchimpService: MailChimpService,
    private readonly configService: ConfigService,
    private readonly qrCodeService: QRCodeService,
    private readonly externalApiService: ExternalApiServices,
    private readonly docUploadService: DocUploadService,
  ) { }

  // ── Helper Methods ───────────────────────────────────────────────────────────

  /**
   * Resolve identifierId from customer's order or fall back to global config.
   * Used to ensure bookings are tagged with the correct business/external API context.
   */
  private async resolveIdentifierId(customerEmail: string): Promise<string> {
    try {
      // Try to find customer's order to get their externalApiId
      const order = await this.connection.collection('orders').findOne(
        { email: customerEmail, isDeleted: { $ne: true } },
        { projection: { externalApiId: 1 }, sort: { createdAt: -1 } },
      );

      if (order?.externalApiId) {
        const externalApi = await this.externalApiService.getById(String(order.externalApiId));
        if (externalApi?.identifierId) {
          return externalApi.identifierId;
        }
      }
    } catch (err) {
      this.logger.warn('[SESSION_BOOKINGS]: Failed to resolve identifierId from order', {
        error: err instanceof Error ? err.message : String(err),
        email: customerEmail,
      });
    }

    // Fall back to global config
    return this.configService.externalApiIdentifier.IDENTIFIER_ID;
  }

  // ── Invite token ─────────────────────────────────────────────────────────────

  /**
   * Generate an encrypted invite token to embed in the booking email URL.
   *
   * Called by: OrdersService after a successful ticket payment.
   *
   * The token is AES-256-GCM encrypted — it contains name/email/phone/wrapperId
   * but looks like random gibberish in the browser bar. No DB entry needed.
   *
   * URL shape:  https://book.lumen.app/b/<encryptedToken>
   *
   * @example
   * const { token, bookingLink } = this.sessionBookingsService.generateInviteToken({
   *   name: 'Dana Cohen',
   *   email: 'dana@example.com',
   *   phone: '050-123-4567',
   *   wrapperId: '6a434e6bab835dff0ef1fe46',
   *   eventCode: 'SUMMER-2026',
   * });
   */
  generateInviteToken(params: {
    name: string;
    email: string;
    phone?: string;
    wrapperId: string;
    code?: string;
    /**
     * The last session/event date. When provided, token expiry is capped to
     * 1 day before this date so the link never outlives the event.
     * Still capped at INVITE_TTL_DAYS (7) from now as an upper bound.
     * Example: event on July 22, purchased July 10 → token expires July 21 (11 days)
     * Example: event on July 14, purchased July 10 → token expires July 13 (3 days)
     */
    eventLastDate?: Date;
  }): { token: string; bookingLink: string; ttlDays: number } {
    const nowSec = Math.floor(Date.now() / 1000);
    const maxTtlSec = INVITE_TTL_DAYS * 24 * 60 * 60;

    let ttlSec = maxTtlSec;

    if (params.eventLastDate) {
      // Expire 1 day before the last event date so the link is always valid during booking
      const eventLastMs = new Date(params.eventLastDate).setHours(0, 0, 0, 0);
      const oneDayMs = 24 * 60 * 60 * 1000;
      const expiryFromEventMs = eventLastMs - oneDayMs;
      const expiryFromEventSec = Math.floor(expiryFromEventMs / 1000);
      const ttlFromEvent = expiryFromEventSec - nowSec;

      // Use whichever is shorter: 7 days from now OR 1 day before the event
      // But always give at least 1 hour so the email is immediately usable
      const ONE_HOUR_SEC = 60 * 60;
      ttlSec = Math.max(ONE_HOUR_SEC, Math.min(maxTtlSec, ttlFromEvent));
    }

    const exp = nowSec + ttlSec;
    const ttlDays = Math.ceil(ttlSec / (24 * 60 * 60));

    const payload: InvitePayload = {
      name: params.name,
      email: params.email,
      phone: params.phone,
      wrapperId: params.wrapperId,
      code: params.code,
      exp,
    };

    const token = encryptInviteToken(payload);
    const bookingLink = `${process.env.FE_BASE_URL}/b/${token}`;

    this.logger.info('[INVITE]: Generated encrypted invite token', {
      wrapperId: params.wrapperId,
      email: params.email,
      code: params.code,
      ttlDays,
      eventLastDate: params.eventLastDate ?? 'not provided',
    });

    return { token, bookingLink, ttlDays };
  }

  /**
   * Resolve an encrypted token → return customer PII + wrapper context.
   *
   * Called by: GET /session-bookings/resolve/:token (no auth required)
   *
   * The FE calls this on page load, receives the decrypted PII in the
   * JSON response body (over HTTPS), and pre-fills the booking form.
   * The URL stays encrypted — the form is filled from the API response.
   *
   * @returns Decrypted payload + isConsumed flag for single-use lock view
   */
  async resolveInviteToken(token: string): Promise<{
    wrapperId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    eventCode?: string;
    scope?: string[];
    inviteCode?: string;
    isConsumed: boolean;
    existingBooking?: {
      bookingId: string;
      sessionId: string;
      sessionName: string;
      slotDate: string;
      slotTime: string;
      room?: string;
      bookingReference?: string;
    };
    existingBookings?: Array<{
      bookingId: string;
      sessionId: string;
      sessionName: string;
      slotDate: string;
      slotTime: string;
      room?: string;
      bookingReference?: string;
      status: string;
    }>;
  }> {
    // Decrypt and validate the token
    let payload: InvitePayload;
    try {
      payload = decryptInviteToken(token);
    } catch (err: any) {
      if (err.message?.includes('expired')) {
        throw new GoneException('This invite link has expired. Please contact support.');
      }
      throw new BadRequestException('Invalid invite link. Please check the link in your email.');
    }

    // Single-use lock check (LUMEN spec §4.2):
    // Preview links (with code) allow multiple bookings for testing
    // Real booking links block after first CONFIRMED booking
    let isConsumed = false;
    let existingBooking = null;
    let existingBookings: Array<{
      bookingId: string;
      sessionId: string;
      sessionName: string;
      slotDate: string;
      slotTime: string;
      room?: string;
      bookingReference?: string;
      status: string;
    }> = [];

    if (!payload.code) {
      // Only enforce single-use lock for real booking links (no code)
      const existingConfirmed = await this.sessionBookingModel
        .findOne({
          'purchaserInfo.email': payload.email,
          wrapperId: payload.wrapperId,
          status: 'CONFIRMED',
          isDeleted: { $ne: true },
        })
        .lean();

      if (existingConfirmed) {
        isConsumed = true;
        existingBooking = {
          bookingId: String(existingConfirmed._id),
          sessionId: existingConfirmed.sessionId,
          sessionName: existingConfirmed.sessionName,
          slotDate: existingConfirmed.slotDate,
          slotTime: existingConfirmed.slotTime,
          room: existingConfirmed.room,
          bookingReference: existingConfirmed.bookingReference,
        };
      }
    } else {
      const confirmedBookings = await this.sessionBookingModel
        .find({
          wrapperId: payload.wrapperId,
          'purchaserInfo.email': payload.email,
          inviteCode: payload.code,
          status: { $in: ['ACTIVE', 'CONFIRMED', 'ATTENDED'] },
          isDeleted: { $ne: true },
        })
        .sort({ confirmedAt: 1, createdAt: 1 })
        .lean();

      existingBookings = confirmedBookings.map((booking: any) => ({
        bookingId: String(booking._id),
        sessionId: booking.sessionId,
        sessionName: booking.sessionName,
        slotDate: booking.slotDate,
        slotTime: booking.slotTime,
        room: booking.room,
        bookingReference: booking.bookingReference,
        status: booking.status,
      }));

      if (existingBookings.length > 0) {
        [existingBooking] = existingBookings;
      }
    }

    const response: any = {
      wrapperId: payload.wrapperId,
      customerName: payload.name,
      customerEmail: payload.email,
      customerPhone: payload.phone,
      isConsumed,
    };

    if (payload.code) {
      response.inviteCode = payload.code;
    }

    if (existingBooking) {
      response.existingBooking = existingBooking;
    }

    if (existingBookings.length > 0) {
      response.existingBookings = existingBookings;
    }

    return response;
  }

  // ── Session display ──────────────────────────────────────────────────────────

  /**
   * Get session wrapper with active sessions and availability data.
   * No auth required — wrapper must be isActive.
   * If code is provided, returns existingBookings for invite code context.
   */
  async getSessionByWrapperId(wrapperId: string, dto?: any): Promise<any> {
    try {
      this.logger.info('[SESSION_BOOKINGS]: GET session', { wrapperId, code: dto?.code });

      const query: any = { isDeleted: { $ne: true } };
      try {
        query._id = new ObjectId(wrapperId);
      } catch {
        throw new NotFoundException('Invalid session wrapper ID format');
      }

      const wrapper = await this.connection
        .collection('sessionwrappers')
        .findOne(query as any);

      if (!wrapper) {
        throw new NotFoundException('Session wrapper not found');
      }

      if (!wrapper.isActive) {
        throw new NotFoundException('Session wrapper is currently inactive');
      }

      const activeSessions = (wrapper.sessions || []).filter(
        (e: any) => e.isActive === true,
      );

      // Get primary image from wrapper
      const primaryImage = (wrapper.images || []).find(
        (img: any) => img.isPrimary === true,
      );
      const imageUrl = primaryImage?.image || (wrapper.images?.[0]?.image || null);

      if (!activeSessions.length) {
        return {
          success: true,
          message: 'No active sessions available',
          data: { wrapperId, events: [] },
        };
      }

      // ── Calculate available capacity for each slot ──────────────────────────
      const sessionsWithAvailability = await Promise.all(
        activeSessions.map(async (session: any) => {
          const datesWithAvailability = await Promise.all(
            (session.dates || []).map(async (dateObj: any) => {
              const slotsWithAvailability = await Promise.all(
                (dateObj.slots || []).map(async (slot: any) => {
                  // Build base query for counting bookings
                  const baseQuery = {
                    wrapperId,
                    sessionId: session._id.toString(),
                    slotDate: dateObj.date,
                    slotTime: slot.time,
                    isDeleted: { $ne: true },
                  };

                  // If invite code is provided, exclude user's own bookings from availability count
                  // This allows them to see their own booking as "available" for changes
                  // We exclude both CONFIRMED and ACTIVE bookings with this invite code
                  const excludeUserQuery = dto?.code
                    ? { inviteCode: { $ne: dto.code } }
                    : {};

                  const [confirmed, held, attended] = await Promise.all([
                    this.connection
                      .collection('sessionbookings')
                      .countDocuments({
                        ...baseQuery,
                        ...excludeUserQuery,
                        status: 'CONFIRMED',
                      }),
                    this.connection
                      .collection('sessionbookings')
                      .countDocuments({
                        ...baseQuery,
                        ...excludeUserQuery,
                        status: 'ACTIVE',
                      }),
                    this.connection
                      .collection('sessionbookings')
                      .countDocuments({
                        ...baseQuery,
                        ...excludeUserQuery,
                        status: 'ATTENDED',
                      }),
                  ]);

                  const registered = confirmed + attended;
                  const capacity = slot.capacity || 0;
                  const available = Math.max(0, capacity - registered - held);

                  return {
                    ...slot,
                    capacity,
                    registered,
                    held,
                    attended,
                    available,
                  };
                }),
              );

              return {
                ...dateObj,
                slots: slotsWithAvailability,
              };
            }),
          );

          return {
            ...session,
            dates: datesWithAvailability,
          };
        }),
      );

      // If invite code is provided, fetch existing bookings for pre-selection
      let existingBookings: any[] = [];
      let existingBooking: any = null;
      if (dto?.code) {
        const confirmedBookings = await this.connection
          .collection('sessionbookings')
          .find({
            wrapperId,
            inviteCode: dto.code,
            status: { $in: ['ACTIVE', 'CONFIRMED', 'ATTENDED'] },
            isDeleted: { $ne: true },
          })
          .sort({ confirmedAt: 1, createdAt: 1 })
          .toArray();

        existingBookings = confirmedBookings.map((booking: any) => ({
          bookingId: String(booking._id),
          sessionId: booking.sessionId,
          sessionName: booking.sessionName,
          slotDate: booking.slotDate,
          slotTime: booking.slotTime,
          room: booking.room,
          bookingReference: booking.bookingReference,
          status: booking.status,
        }));

        if (existingBookings.length > 0) {
          [existingBooking] = existingBookings;
        }
      }

      return {
        success: true,
        message: 'Session details retrieved',
        data: {
          wrapperId,
          brand: wrapper.brand,
          headline: wrapper.headline,
          subhead: wrapper.subhead,
          blocks: wrapper.blocks || [],
          image: imageUrl,
          theme: wrapper.themeId,
          events: sessionsWithAvailability,
          ...(existingBooking && { existingBooking }),
          ...(existingBookings.length > 0 && { existingBookings }),
        },
      };
    } catch (err) {
      this.logger.error('[SESSION_BOOKINGS]: GET session failed', {
        err: err instanceof Error ? err.message : String(err),
        wrapperId,
      });
      exceptionHandling(err);
    }
  }

  // ── Hold creation ────────────────────────────────────────────────────────────

  /**
   * Create multiple session holds atomically (SAFE for concurrent bookings).
   * Uses MongoDB transaction to prevent race conditions:
   * - Atomically checks availability for ALL sessions
   * - Creates ALL holds or NONE (no partial bookings)
   * - Calculates TTL based on session count: 7 + (3 × extraSessions)
   */
  async createBatchSessionHolds(
    token: string,
    wrapperId: string,
    sessions: Array<{ sessionId: string; sessionName: string; slotDate: string; slotTime: string; room?: string }>,
  ): Promise<any> {
    // ── PRE-VALIDATION (BEFORE transaction) ──────────────────────────────────
    // Decrypt token early to check for existing bookings before transaction
    let payload: InvitePayload;
    try {
      payload = decryptInviteToken(token);
    } catch (err: any) {
      if (err.message?.includes('expired')) {
        throw new GoneException('Your invite link has expired. Please contact support.');
      }
      throw new BadRequestException('Invalid or malformed invite token');
    }

    if (!payload.name || !payload.email) {
      throw new BadRequestException('Token must contain name and email');
    }

    // ── Single-use validation: Check for existing CONFIRMED booking ──────────
    // Only enforce for real links (no code parameter)
    // Check per SESSION, not per wrapper - allows multiple sessions in checkbox mode
    if (!payload.code) {
      const existingConfirmed = await this.sessionBookingModel.findOne({
        'purchaserInfo.email': payload.email,
        wrapperId,
        sessionId: sessions[0].sessionId,
        status: 'CONFIRMED',
        isDeleted: { $ne: true },
      }).lean();

      if (existingConfirmed) {
        throw new ConflictException(
          `You already have a confirmed booking for this session (Ref: ${existingConfirmed.bookingReference}). `
          + 'Please contact support if you need to modify your booking.',
        );
      }
    }

    // ── Now start the transaction for atomic hold creation ──────────────────
    const mongoSession = await this.connection.startSession();
    mongoSession.startTransaction();

    try {
      // ── 0. Fetch wrapper to get actual slot capacities ─────────────────────
      let wrapper: any;
      try {
        wrapper = await this.connection
          .collection('sessionwrappers')
          .findOne({ _id: new ObjectId(wrapperId), isDeleted: { $ne: true } });
      } catch {
        await mongoSession.abortTransaction();
        throw new NotFoundException('Session wrapper not found');
      }

      if (!wrapper) {
        await mongoSession.abortTransaction();
        throw new NotFoundException('Session wrapper not found');
      }

      const purchaserInfo = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
      };

      // ── 1. Release this purchaser's own stale ACTIVE holds for this wrapper ──
      // Without this, a retry/double-click/back-navigation leaves a dangling hold
      // that gets counted against the purchaser's own next attempt in
      // calculateSpotsLeft(), causing a false "No spots available" 409.
      await this.sessionBookingModel.updateMany(
        {
          wrapperId,
          'purchaserInfo.email': purchaserInfo.email,
          status: 'ACTIVE',
          isDeleted: { $ne: true },
        },
        { $set: { status: 'CANCELLED', updatedAt: new Date() } },
        { session: mongoSession },
      );

      // ── 2. Atomically check availability for ALL sessions ────────────────────
      const holdExpiresAt = new Date();
      const ttlMinutes = HOLD_TTL_MINUTES + (3 * (sessions.length - 1)); // 7 + (3 × extraSessions)
      holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + ttlMinutes);

      // ── 2a. Validate block selection limits if blocks exist ─────────────────
      const blocks = wrapper.blocks || [];
      if (blocks.length > 0) {
        const activeBlocks = blocks.filter((block: any) => block.isActive);

        const violation = activeBlocks.find((block: any) => {
          const blockSessionIds = new Set((block.sessionIds || []).map((id: any) => id.toString()));
          const selectedInBlock = sessions.filter(s => blockSessionIds.has(s.sessionId));
          return selectedInBlock.length > block.bookingLimit;
        });

        if (violation) {
          const blockSessionIds = new Set((violation.sessionIds || []).map((id: any) => id.toString()));
          const selectedInBlock = sessions.filter(s => blockSessionIds.has(s.sessionId));
          await mongoSession.abortTransaction();
          throw new BadRequestException(
            `You can only select up to ${violation.bookingLimit} session(s) from "${violation.name}". You selected ${selectedInBlock.length}.`,
          );
        }
      }

      // Validate all sessions first
      sessions.forEach(sessionData => {
        const sessionInWrapper = (wrapper.sessions || []).find(
          (s: any) => s._id.toString() === sessionData.sessionId,
        );

        if (!sessionInWrapper) {
          throw new BadRequestException(
            `Session "${sessionData.sessionId}" not found in wrapper`,
          );
        }

        const dateObj = (sessionInWrapper.dates || []).find(
          (d: any) => d.date === sessionData.slotDate,
        );
        const slot = (dateObj?.slots || []).find(
          (s: any) => s.time === sessionData.slotTime,
        );

        if (!slot) {
          throw new BadRequestException(
            `Slot ${sessionData.slotTime} on ${sessionData.slotDate} not found`,
          );
        }
      });

      // Check availability for all sessions in parallel
      const spotsChecks = await Promise.all(
        sessions.map(async sessionData => {
          const sessionInWrapper = (wrapper.sessions || []).find(
            (s: any) => s._id.toString() === sessionData.sessionId,
          );
          const dateObj = (sessionInWrapper.dates || []).find(
            (d: any) => d.date === sessionData.slotDate,
          );
          const slot = (dateObj.slots || []).find(
            (s: any) => s.time === sessionData.slotTime,
          );

          const spotsLeft = await this.calculateSpotsLeft(
            sessionData.slotDate,
            sessionData.slotTime,
            slot.capacity,
            wrapperId,
            sessionData.sessionId,
            undefined,
            purchaserInfo.email,
          );

          return { sessionData, spotsLeft };
        }),
      );

      // Verify all have availability
      spotsChecks.forEach(({ sessionData, spotsLeft }) => {
        if (spotsLeft <= 0) {
          throw new ConflictException(
            `No spots available for ${sessionData.sessionId} on ${sessionData.slotDate} at ${sessionData.slotTime}`,
          );
        }
      });

      // Create all holds in parallel using native MongoDB insert
      const docsToInsert = sessions.map(sessionData => ({
        wrapperId,
        sessionId: sessionData.sessionId,
        sessionName: sessionData.sessionName,
        slotDate: sessionData.slotDate,
        slotTime: sessionData.slotTime,
        room: sessionData.room,
        purchaserInfo,
        inviteCode: payload.code || null,
        holdExpiresAt,
        status: 'ACTIVE',
        createdAt: new Date(),
        isDeleted: false,
      }));

      const insertResult = await this.connection
        .collection('sessionbookings')
        .insertMany(docsToInsert, { session: mongoSession });

      const allHolds = docsToInsert.map((doc, idx) => ({
        _id: insertResult.insertedIds[idx],
        ...doc,
      }));

      // ── 3. Commit transaction ──────────────────────────────────────────────
      await mongoSession.commitTransaction();

      this.logger.info('[SESSION_BOOKINGS]: Batch holds created (ATOMIC)', {
        sessionCount: sessions.length,
        ttlMinutes,
        email: payload.email,
        holdIds: allHolds.map((h: any) => h._id),
      });

      return {
        success: true,
        message: `${sessions.length} session holds created successfully`,
        data: {
          holdIds: allHolds.map((h: any) => h._id),
          expiresAt: holdExpiresAt,
          expiresIn: `${ttlMinutes} minutes`,
          sessionCount: sessions.length,
          ttlMinutes,
        },
      };
    } catch (err) {
      await mongoSession.abortTransaction();
      this.logger.error('[SESSION_BOOKINGS]: Batch hold creation failed (ROLLED BACK)', {
        err: err instanceof Error ? err.message : String(err),
        sessionCount: sessions.length,
      });
      exceptionHandling(err);
    } finally {
      await mongoSession.endSession();
    }
  }

  // ── Confirmation ────────────────────────────────────────────────────────────

  /**
   * Confirm a session hold → convert to CONFIRMED booking.
   *
   * Called by: POST /session-bookings/confirm
   *
   * Steps:
   * 1. Decrypt token to verify customer identity
   * 2. Find the hold by holdId
   * 3. Verify hold hasn't expired
   * 4. Check spotsLeft one more time (safety)
   * 5. Create CONFIRMED booking from hold
   * 6. Set consumedAt (single-use lock)
   * 7. Generate check-in QR token
   * 8. Send confirmation email (Email #3)
   */
  async confirmSessionHold(dto: ConfirmSessionHoldDto): Promise<any> {
    const mongoSession = await this.connection.startSession();
    mongoSession.startTransaction();

    try {
      const {
        holdIds, token, comments, identifierId: dtoIdentifierId,
      } = dto;

      // ── 1. Decrypt token ───────────────────────────────────────────────────
      let payload: InvitePayload;
      try {
        payload = decryptInviteToken(token);
      } catch (err: any) {
        await mongoSession.abortTransaction();
        if (err.message?.includes('expired')) {
          throw new GoneException('Your invite link has expired. Please contact support.');
        }
        throw new BadRequestException('Invalid invite token');
      }

      // ── 2. Fetch all holds ─────────────────────────────────────────────────
      const holdObjectIds = holdIds.map(id => {
        try {
          return new ObjectId(id);
        } catch {
          throw new BadRequestException(`Invalid hold ID format: ${id}`);
        }
      });

      const holds = await this.sessionBookingModel.find({
        _id: { $in: holdObjectIds },
        status: 'ACTIVE',
        isDeleted: { $ne: true },
      }).session(mongoSession);

      if (holds.length !== holdIds.length) {
        await mongoSession.abortTransaction();
        throw new NotFoundException('One or more holds not found or already expired');
      }

      // ── 3. Verify all holds haven't expired + email matches ────────────────
      const now = new Date();
      try {
        holds.forEach(hold => {
          if (now > hold.holdExpiresAt) {
            throw new GoneException('One or more holds have expired. Please create new holds.');
          }
          if (hold.purchaserInfo.email !== payload.email) {
            throw new BadRequestException('Token email does not match hold customer');
          }
        });
      } catch (validationErr) {
        await mongoSession.abortTransaction();
        throw validationErr;
      }

      // ── 4. Verify availability for all holds ───────────────────────────────
      const wrapperForCapacity = await this.connection
        .collection('sessionwrappers')
        .findOne({
          _id: new ObjectId(holds[0].wrapperId),
          isDeleted: { $ne: true },
        } as any);

      if (!wrapperForCapacity) {
        await mongoSession.abortTransaction();
        throw new NotFoundException('Session wrapper not found');
      }

      // ── 4a. Validate block selection limits if blocks exist ─────────────────
      const blocks = wrapperForCapacity.blocks || [];
      if (blocks.length > 0) {
        try {
          const activeBlocks = blocks.filter((block: any) => block.isActive);

          const violation = activeBlocks.find((block: any) => {
            const blockSessionIds = new Set(block.sessionIds || []);
            const selectedInBlock = holds.filter(h => blockSessionIds.has(h.sessionId));
            return selectedInBlock.length > block.bookingLimit;
          });

          if (violation) {
            const blockSessionIds = new Set(violation.sessionIds || []);
            const selectedInBlock = holds.filter(h => blockSessionIds.has(h.sessionId));
            await mongoSession.abortTransaction();
            throw new BadRequestException(
              `You can only select up to ${violation.bookingLimit} session(s) from "${violation.name}". You selected ${selectedInBlock.length}.`,
            );
          }
        } catch (blockErr) {
          await mongoSession.abortTransaction();
          throw blockErr;
        }
      }

      try {
        await Promise.all(holds.map(async hold => {
          const sessionData = (wrapperForCapacity.sessions || []).find(
            (s: any) => s._id.toString() === hold.sessionId,
          );

          if (!sessionData) {
            throw new NotFoundException(`Session "${hold.sessionId}" not found in wrapper`);
          }

          const dateObj = (sessionData.dates || []).find(
            (d: any) => d.date === hold.slotDate,
          );

          if (!dateObj) {
            throw new NotFoundException(`Slot date ${hold.slotDate} not found in session`);
          }

          const slot = (dateObj.slots || []).find(
            (s: any) => s.time === hold.slotTime,
          );

          if (!slot) {
            throw new NotFoundException(`Slot ${hold.slotTime} not found on ${hold.slotDate}`);
          }

          const spotsLeft = await this.calculateSpotsLeft(
            hold.slotDate,
            hold.slotTime,
            slot.capacity,
            hold.wrapperId,
            hold.sessionId,
            holdObjectIds,
          );
          if (spotsLeft <= 0) {
            throw new ConflictException(
              `No spots available for ${hold.sessionId}. Please select another time.`,
            );
          }
        }));
      } catch (availabilityErr) {
        await mongoSession.abortTransaction();
        throw availabilityErr;
      }

      // ── 5. Resolve identifierId for booking context ────────────────────────
      // Prefer explicitly provided identifierId from DTO, fall back to auto-resolve
      const identifierId = dtoIdentifierId || await this.resolveIdentifierId(payload.email);

      // ── 6. Confirm all holds atomically ────────────────────────────────────
      const confirmedAt = new Date();

      let confirmedBookings: any;
      try {
        confirmedBookings = holds.map(hold => {
          const checkInPayload: InvitePayload = {
            name: hold.purchaserInfo.name,
            email: hold.purchaserInfo.email,
            phone: hold.purchaserInfo.phone,
            wrapperId: hold.wrapperId,
            code: payload.code,
            exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          };
          const qrToken = encryptInviteToken(checkInPayload);
          const bookingReference = `LUMEN-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()}`;

          return {
            bookingId: String(hold._id),
            bookingReference,
            sessionId: hold.sessionId,
            slotDate: hold.slotDate,
            slotTime: hold.slotTime,
            room: hold.room,
            qrToken,
          };
        });

        // Update all bookings in parallel
        await Promise.all(holds.map((hold, index) => this.sessionBookingModel.updateOne(
          { _id: hold._id },
          {
            $set: {
              status: 'CONFIRMED',
              confirmedAt,
              consumedAt: confirmedAt,
              qrToken: confirmedBookings[index].qrToken,
              bookingReference: confirmedBookings[index].bookingReference,
              identifierId,
              inviteCode: payload.code || hold.inviteCode || null,
              ...(comments && { comments }),
              updatedAt: confirmedAt,
            },
          },
          { session: mongoSession },
        )));
      } catch (confirmErr) {
        await mongoSession.abortTransaction();
        throw confirmErr;
      }

      await mongoSession.commitTransaction();

      // ── 7. Cancel previous bookings for this invite code (after successful confirmation)
      // This must happen AFTER transaction commit to prevent orphaned records if confirmation fails
      if (payload.code) {
        try {
          const cancelResult = await this.sessionBookingModel.updateMany(
            {
              wrapperId: holds[0].wrapperId,
              'purchaserInfo.email': payload.email,
              inviteCode: payload.code,
              status: { $in: ['ACTIVE', 'CONFIRMED'] },
              _id: { $nin: holdObjectIds },
              isDeleted: { $ne: true },
            },
            {
              $set: {
                status: 'CANCELLED',
                updatedAt: confirmedAt,
              },
            },
          );
          this.logger.info('[SESSION_BOOKINGS]: Previous bookings cancelled for invite code', {
            cancelledCount: cancelResult.modifiedCount,
            inviteCode: payload.code,
            email: payload.email,
          });
        } catch (cancelErr) {
          // Log but don't fail - new bookings are already confirmed
          this.logger.error('[SESSION_BOOKINGS]: Failed to cancel previous bookings for invite code', {
            error: cancelErr instanceof Error ? cancelErr.message : String(cancelErr),
            inviteCode: payload.code,
            email: payload.email,
            newBookingIds: holdObjectIds,
          });
        }
      }

      this.logger.info('[SESSION_BOOKINGS]: Bookings confirmed', {
        count: confirmedBookings.length,
        email: payload.email,
        confirmedAt,
      });

      // ── 7. Send Email #3: SessionBookingConfirmationFinal ──────────────────
      try {
        // Look up externalApi from the order linked to this customer's email
        // This ensures the correct logo/branding matches the site they purchased from
        const order = await this.connection
          .collection('orders')
          .findOne(
            { email: holds[0].purchaserInfo.email },
            { projection: { externalApiId: 1 }, sort: { createdAt: -1 } },
          );

        let externalApi: any = null;
        if (order?.externalApiId) {
          externalApi = await this.externalApiService.getById(
            String(order.externalApiId),
          );
        }

        // Fall back to global site identifierId if order lookup fails
        if (!externalApi) {
          externalApi = await this.externalApiService.findByIdentifierId(identifierId);
        }

        if (!externalApi) {
          this.logger.warn('[SESSION_BOOKINGS]: ExternalApi not found, skipping email');
        } else {
          const { emailFields } = await getCommonEmailFields(
            externalApi,
            this.docUploadService,
          );

          const { FE } = this.configService.baseUrl;

          // Format dates in Hebrew locale
          const formatDate = (dateStr: string) => {
            try {
              return new Date(dateStr).toLocaleDateString('he-IL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            } catch {
              return dateStr;
            }
          };

          // Send ONE combined email with all sessions and bulk details
          const sessionsWithBlocks = confirmedBookings.map(async (booking: any) => {
            const sessionData = (wrapperForCapacity.sessions || []).find(
              (s: any) => s._id.toString() === booking.sessionId,
            );
            const sessionGreeting = sessionData?.greeting || '';

            // Find which block this session belongs to (if any)
            let blockInfo = null;
            if (blocks.length > 0) {
              const block = blocks.find((b: any) => b.isActive && (b.sessionIds || []).includes(booking.sessionId));
              if (block) {
                blockInfo = {
                  name: block.name,
                  description: block.description,
                  bookingLimit: block.bookingLimit,
                };
              }
            }

            // Generate QR code for this session
            const checkInUrl = `${FE}verify-session/${holds[0].wrapperId}/${booking.bookingId}`;
            let checkInQrUrl = '';
            try {
              checkInQrUrl = await this.qrCodeService.generateQRCode(
                checkInUrl,
                `checkin-${booking.bookingReference}`,
              );
            } catch (qrErr) {
              this.logger.warn('[SESSION_BOOKINGS]: QR code generation failed', {
                error: qrErr instanceof Error ? qrErr.message : String(qrErr),
              });
            }

            return {
              sessionId: booking.sessionId,
              sessionName: sessionData?.name || '',
              sessionGreeting,
              slotDate: formatDate(booking.slotDate),
              slotTime: booking.slotTime,
              room: booking.room || 'לא צוין',
              bookingReference: booking.bookingReference,
              qrCodeUrl: checkInQrUrl || checkInUrl,
              checkInUrl,
              blockInfo,
            };
          });

          // Generate HTML for sessions grouped by blocks
          let sessionsHtml = '';

          const sessionsData = await Promise.all(sessionsWithBlocks);

          // Group sessions by block for display
          const sessionsByBlock: any = {};
          if (blocks.length > 0) {
            blocks.forEach((block: any) => {
              if (block.isActive) {
                sessionsByBlock[block.name] = {
                  description: block.description,
                  bookingLimit: block.bookingLimit,
                  sessions: sessionsData.filter((s: any) => s.blockInfo?.name === block.name),
                };
              }
            });
            // Add sessions not in any block
            const ungroupedSessions = sessionsData.filter((s: any) => !s.blockInfo);
            if (ungroupedSessions.length > 0) {
              sessionsByBlock.general = {
                description: '',
                bookingLimit: sessionsData.length,
                sessions: ungroupedSessions,
              };
            }
          } else {
            // No blocks - put all in general
            sessionsByBlock.general = {
              description: '',
              bookingLimit: sessionsData.length,
              sessions: sessionsData,
            };
          }

          // Generate sessions HTML grouped by blocks
          Object.keys(sessionsByBlock).forEach(blockName => {
            const block = sessionsByBlock[blockName];

            sessionsHtml += '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 8px; margin: 20px 0;">';
            sessionsHtml += '<tr><td style="padding: 15px;">';

            // Block header
            if (blockName !== 'general') {
              sessionsHtml += `<p style="margin: 0 0 5px 0; font-weight: bold; color: #313131; text-align: right; font-size: 16px;">📦 ${blockName}</p>`;
              if (block.description) {
                sessionsHtml += `<p style="margin: 0 0 10px 0; color: #666; text-align: right; font-size: 13px;">${block.description}</p>`;
              }
              sessionsHtml += `<p style="margin: 0 0 15px 0; color: #1976d2; text-align: right; font-size: 12px;">נבחרו ${block.sessions.length} מתוך ${block.bookingLimit} מפגשים</p>`;
            } else {
              sessionsHtml += '<p style="margin: 0 0 15px 0; font-weight: bold; color: #313131; text-align: right; font-size: 16px;">📋 מפגשים כלליים</p>';
            }

            // Sessions in block
            block.sessions.forEach((session: any) => {
              sessionsHtml += '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 6px; margin: 10px 0; border: 1px solid #e0e0e0;">';
              sessionsHtml += '<tr><td style="padding: 12px;">';

              sessionsHtml += '<table width="100%" cellpadding="0" cellspacing="0" border="0">';
              sessionsHtml += '<tr>';
              sessionsHtml += '<td style="padding: 0; width: 70%; vertical-align: top;">';

              sessionsHtml += `<p style="margin: 0 0 8px 0; font-weight: bold; color: #313131; text-align: right; font-size: 14px;">${session.sessionName}</p>`;
              if (session.sessionGreeting) {
                sessionsHtml += `<p style="margin: 0 0 8px 0; color: #666; text-align: right; font-size: 12px; font-style: italic;">${session.sessionGreeting}</p>`;
              }
              sessionsHtml += '<table width="100%" cellpadding="0" cellspacing="0" border="0">';
              sessionsHtml += `<tr><td style="padding: 4px 0; text-align: right; color: #666; font-size: 12px;"><strong>תאריך:</strong> ${session.slotDate}</td></tr>`;
              sessionsHtml += `<tr><td style="padding: 4px 0; text-align: right; color: #666; font-size: 12px;"><strong>שעה:</strong> ${session.slotTime}</td></tr>`;
              sessionsHtml += `<tr><td style="padding: 4px 0; text-align: right; color: #666; font-size: 12px;"><strong>חדר/מטפל:</strong> ${session.room}</td></tr>`;
              sessionsHtml += `<tr><td style="padding: 4px 0; text-align: right; color: #666; font-size: 12px;"><strong>מספר הזמנה:</strong> ${session.bookingReference}</td></tr>`;
              sessionsHtml += '</table>';

              sessionsHtml += '</td>';
              sessionsHtml += '<td style="padding: 0; width: 30%; vertical-align: middle; text-align: center;">';
              sessionsHtml += `<img src="${session.qrCodeUrl}" alt="QR Code" width="100" height="100" class="qr-code" style="width: 100px; height: 100px; border: 2px solid #4caf50; border-radius: 8px;">`;
              sessionsHtml += '<p style="margin: 5px 0 0 0; color: #666; text-align: center; font-size: 10px;">סרוק להגעה</p>';
              sessionsHtml += '</td>';
              sessionsHtml += '</tr>';
              sessionsHtml += '</table>';

              sessionsHtml += '</td></tr>';
              sessionsHtml += '</table>';
            });

            sessionsHtml += '</td></tr>';
            sessionsHtml += '</table>';
          });

          const mergeVars = {
            ...emailFields,
            CUSTOMER_NAME: payload.name,
            CUSTOMER_EMAIL: payload.email,
            SESSIONS_HTML: sessionsHtml,
            TOTAL_SESSIONS: confirmedBookings.length,
            BUTTON_LINK: externalApi?.websiteUrl,
            BUSINESSADDRESS: '',
            SUPPORT_EMAIL: externalApi?.email || 'support@metgo.app',
            SUPPORT_PHONE: externalApi?.whatsappNumber || '',
            MANAGEMENT_LINK: externalApi?.websiteUrl || '',
          };

          await this.mailchimpService.sendTransactionalEmail({
            to: payload.email,
            templatedId: DynamicEmailTemplate.SessionBookingConfirmationFinal,
            from_email: externalApi?.email,
            from_name: externalApi?.name,
            subject: 'ההזמנה שלך אושרה! ✅',
            mergeVars,
          });

          this.logger.info('[SESSION_BOOKINGS]: Combined confirmation email sent', {
            email: payload.email,
            totalSessions: confirmedBookings.length,
          });
        }
      } catch (emailErr) {
        // Non-blocking: log error but don't fail the confirmation
        this.logger.error('[SESSION_BOOKINGS]: Failed to send confirmation email', {
          error: emailErr instanceof Error ? emailErr.message : String(emailErr),
          email: payload.email,
        });
      }

      return {
        success: true,
        message: `${confirmedBookings.length} booking(s) confirmed successfully`,
        data: {
          wrapperId: holds[0].wrapperId,
          bookings: confirmedBookings,
          confirmedAt,
          purchaserEmail: payload.email,
        },
      };
    } catch (err) {
      await mongoSession.abortTransaction();
      this.logger.error('[SESSION_BOOKINGS]: Confirmation failed', {
        err: err instanceof Error ? err.message : String(err),
      });
      exceptionHandling(err);
    } finally {
      await mongoSession.endSession();
    }
  }

  /**
   * Check-in endpoint: decrypt QR token → return booking details + mark ATTENDED.
   *
   * Called by: GET /session-bookings/checkin/:token (no auth required)
   *
   * Single-use: First scan returns booking details, marks customer as ATTENDED.
   * Subsequent scans return error (already checked in).
   *
   * Prevents:
   * - QR code sharing/reuse
   * - Duplicate check-ins
   * - Fraud
   */
  async getCheckInDetails(token: string): Promise<any> {
    try {
      // Find booking by qrToken
      const booking = await this.sessionBookingModel.findOne({
        qrToken: token,
        status: { $in: ['CONFIRMED', 'ATTENDED'] }, // Allow both states
        isDeleted: { $ne: true },
      });

      if (!booking) {
        throw new NotFoundException('No confirmed booking found for this check-in token');
      }

      // Check if already attended (single-use lock)
      if (booking.status === 'ATTENDED') {
        throw new ConflictException(
          'This QR code has already been scanned. Customer already checked in.',
        );
      }

      // Mark as ATTENDED (single-use: first and only valid scan)
      const now = new Date();
      const updated = await this.sessionBookingModel.findByIdAndUpdate(
        booking._id,
        {
          status: 'ATTENDED',
          attendedAt: now,
          updatedAt: now,
        },
        { new: true },
      );

      this.logger.info('[SESSION_BOOKINGS]: Customer checked in', {
        bookingId: booking._id,
        customerEmail: booking.purchaserInfo.email,
        attendedAt: now,
      });

      // Return booking details for room rep
      return {
        success: true,
        message: 'Customer checked in successfully',
        data: {
          bookingId: String(updated._id),
          bookingReference: updated.bookingReference,
          customerName: updated.purchaserInfo.name,
          customerEmail: updated.purchaserInfo.email,
          customerPhone: updated.purchaserInfo.phone,
          sessionId: updated.sessionId,
          slotDate: updated.slotDate,
          slotTime: updated.slotTime,
          room: updated.room,
          confirmedAt: updated.confirmedAt,
          attendedAt: updated.attendedAt,
          status: updated.status,
          isSingleUse: true, // Indicate this QR is now consumed
        },
      };
    } catch (err) {
      this.logger.error('[SESSION_BOOKINGS]: Check-in failed', {
        err: err instanceof Error ? err.message : String(err),
      });
      exceptionHandling(err);
    }
  }

  // ── Availability ─────────────────────────────────────────────────────────────

  /**
   * Get real-time availability for a session wrapper.
   * Called by: Frontend polling (every 5 seconds)
   * Returns: Spot counts for all sessions in the wrapper
   */
  async getAvailability(wrapperId: string): Promise<any> {
    try {
      const wrapper = await this.connection
        .collection('sessionwrappers')
        .findOne({
          _id: new ObjectId(wrapperId),
          isDeleted: { $ne: true },
        } as any);

      if (!wrapper) {
        throw new NotFoundException('Session wrapper not found');
      }

      // Get all sessions with availability
      const sessions = await Promise.all(
        (wrapper.sessions || []).map(async (session: any) => {
          const sessionAvailability: any = {
            name: session.name,
            dates: [],
          };

          sessionAvailability.dates = await Promise.all(
            (session.dates || []).map(async (dateObj: any) => {
              const dateAvailability: any = {
                date: dateObj.date,
                slots: [],
              };

              dateAvailability.slots = await Promise.all(
                (dateObj.slots || []).map(async (slot: any) => {
                  const spotsLeft = await this.calculateSpotsLeft(
                    dateObj.date,
                    slot.time,
                    slot.capacity,
                    wrapperId,
                    session.name,
                  );

                  return {
                    time: slot.time,
                    capacity: slot.capacity,
                    confirmed: slot.capacity - spotsLeft,
                    spotsLeft,
                    isFull: spotsLeft === 0,
                  };
                }),
              );

              return dateAvailability;
            }),
          );

          return sessionAvailability;
        }),
      );

      return {
        success: true,
        wrapperId,
        lastUpdatedAt: new Date(),
        sessions,
        note: 'Polling interval: 5 seconds. Update UI based on spotsLeft for each slot.',
      };
    } catch (err) {
      this.logger.error('[SESSION_BOOKINGS]: Get availability failed', {
        err: err instanceof Error ? err.message : String(err),
        wrapperId,
      });
      exceptionHandling(err);
    }
  }

  /**
   * LUMEN availability formula (single source of truth):
   *   spotsLeft = capacity
   *             - COUNT(CONFIRMED | ATTENDED bookings)
   *             - COUNT(ACTIVE holds with expiresAt > NOW)
   */
  async calculateSpotsLeft(
    slotDate: string,
    slotTime: string,
    capacity: number,
    wrapperId?: string,
    sessionId?: string,
    excludeHoldIds?: ObjectId[],
    excludeEmail?: string,
  ): Promise<number> {
    try {
      const query: any = {
        slotDate,
        slotTime,
        isDeleted: { $ne: true },
      };

      if (wrapperId) {
        query.wrapperId = wrapperId;
      }

      if (sessionId) {
        query.sessionId = sessionId;
      }

      const confirmedCount = await this.sessionBookingModel.countDocuments({
        ...query,
        status: { $in: ['CONFIRMED', 'ATTENDED'] },
      });

      const activeHoldsQuery: any = {
        ...query,
        status: 'ACTIVE',
        holdExpiresAt: { $gt: new Date() },
      };

      // Exclude the holds currently being confirmed — they aren't "other"
      // demand competing for the spot, they're about to become CONFIRMED.
      if (excludeHoldIds?.length) {
        activeHoldsQuery._id = { $nin: excludeHoldIds };
      }

      // Exclude this purchaser's own active holds — a retry/resubmit within
      // the same transaction shouldn't self-conflict. (The stale-hold cleanup
      // in createBatchSessionHolds runs in the same uncommitted transaction,
      // so this count wouldn't see it anyway without this explicit exclusion.)
      if (excludeEmail) {
        activeHoldsQuery['purchaserInfo.email'] = { $ne: excludeEmail };
      }

      const activeHoldsCount = await this.sessionBookingModel.countDocuments(activeHoldsQuery);

      return Math.max(0, capacity - confirmedCount - activeHoldsCount);
    } catch (err) {
      this.logger.error('[SESSION_BOOKINGS]: Failed to calculate spots', {
        err: err instanceof Error ? err.message : String(err),
        slotDate,
        slotTime,
        wrapperId,
        sessionId,
      });
      return 0;
    }
  }

  // ── Maintenance ──────────────────────────────────────────────────────────────

  /**
   * Soft-expire holds whose TTL has passed (mark as EXPIRED, don't delete).
   * Runs every 5 minutes automatically.
   *
   * Why soft-delete (mark EXPIRED):
   * - Keeps audit trail of all holds
   * - No data loss
   * - Safe approach
   * - calculateSpotsLeft() already excludes expired holds from availability
   *
   * Note: Customers see updated availability on next socket emit or refresh
   * since calculateSpotsLeft filters out non-active holds.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupExpiredHolds(): Promise<void> {
    try {
      const result = await this.sessionBookingModel.updateMany(
        {
          status: 'ACTIVE',
          holdExpiresAt: { $lte: new Date() },
          isDeleted: { $ne: true },
        },
        { $set: { status: 'EXPIRED', updatedAt: new Date() } },
      );

      this.logger.info('[SESSION_BOOKINGS]: Expired holds cleaned', {
        modifiedCount: result.modifiedCount,
      });
    } catch (err) {
      this.logger.error('[SESSION_BOOKINGS]: Cleanup failed', {
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
