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
  ) {}

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
    isConsumed: boolean;
    existingBooking?: {
      bookingId: string;
      sessionName: string;
      slotDate: string;
      slotTime: string;
      room?: string;
      bookingReference?: string;
    };
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
          sessionName: existingConfirmed.sessionName,
          slotDate: existingConfirmed.slotDate,
          slotTime: existingConfirmed.slotTime,
          room: existingConfirmed.room,
          bookingReference: existingConfirmed.bookingReference,
        };
      }
    }

    const response: any = {
      wrapperId: payload.wrapperId,
      customerName: payload.name,
      customerEmail: payload.email,
      customerPhone: payload.phone,
      isConsumed,
    };

    if (existingBooking) {
      response.existingBooking = existingBooking;
    }

    return response;
  }

  // ── Session display ──────────────────────────────────────────────────────────

  /**
   * Get session wrapper with active sessions and availability data.
   * No auth required — wrapper must be isActive.
   */
  async getSessionByWrapperId(wrapperId: string): Promise<any> {
    try {
      this.logger.info('[SESSION_BOOKINGS]: GET session', { wrapperId });

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
                  const [confirmed, held, attended] = await Promise.all([
                    this.connection
                      .collection('sessionbookings')
                      .countDocuments({
                        wrapperId,
                        sessionName: session.name,
                        slotDate: dateObj.date,
                        slotTime: slot.time,
                        status: 'CONFIRMED',
                        isDeleted: { $ne: true },
                      }),
                    this.connection
                      .collection('sessionbookings')
                      .countDocuments({
                        wrapperId,
                        sessionName: session.name,
                        slotDate: dateObj.date,
                        slotTime: slot.time,
                        status: 'ACTIVE',
                        isDeleted: { $ne: true },
                      }),
                    this.connection
                      .collection('sessionbookings')
                      .countDocuments({
                        wrapperId,
                        sessionName: session.name,
                        slotDate: dateObj.date,
                        slotTime: slot.time,
                        status: 'ATTENDED',
                        isDeleted: { $ne: true },
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

      return {
        success: true,
        message: 'Session details retrieved',
        data: {
          wrapperId,
          brand: wrapper.brand,
          headline: wrapper.headline,
          subhead: wrapper.subhead,
          selectionMode: wrapper.selectionMode,
          image: imageUrl,
          theme: wrapper.themeId,
          events: sessionsWithAvailability,
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
    sessions: Array<{ sessionName: string; slotDate: string; slotTime: string; room?: string }>,
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
        sessionName: sessions[0].sessionName,
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

      // ── 2. Atomically check availability for ALL sessions ────────────────────
      const holdExpiresAt = new Date();
      const ttlMinutes = HOLD_TTL_MINUTES + (3 * (sessions.length - 1)); // 7 + (3 × extraSessions)
      holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + ttlMinutes);

      // Validate all sessions first
      sessions.forEach(sessionData => {
        const sessionInWrapper = (wrapper.sessions || []).find(
          (s: any) => s.name === sessionData.sessionName,
        );

        if (!sessionInWrapper) {
          throw new BadRequestException(
            `Session "${sessionData.sessionName}" not found in wrapper`,
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
            (s: any) => s.name === sessionData.sessionName,
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
            sessionData.sessionName,
          );

          return { sessionData, spotsLeft };
        }),
      );

      // Verify all have availability
      spotsChecks.forEach(({ sessionData, spotsLeft }) => {
        if (spotsLeft <= 0) {
          throw new ConflictException(
            `No spots available for ${sessionData.sessionName} on ${sessionData.slotDate} at ${sessionData.slotTime}`,
          );
        }
      });

      // Create all holds in parallel using native MongoDB insert
      const docsToInsert = sessions.map(sessionData => ({
        wrapperId,
        sessionName: sessionData.sessionName,
        slotDate: sessionData.slotDate,
        slotTime: sessionData.slotTime,
        room: sessionData.room,
        purchaserInfo,
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

      try {
        await Promise.all(holds.map(async hold => {
          const sessionData = (wrapperForCapacity.sessions || []).find(
            (s: any) => s.name === hold.sessionName,
          );

          if (!sessionData) {
            throw new NotFoundException(`Session "${hold.sessionName}" not found in wrapper`);
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
            hold.sessionName,
          );
          if (spotsLeft <= 0) {
            throw new ConflictException(
              `No spots available for ${hold.sessionName}. Please select another time.`,
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
            sessionName: hold.sessionName,
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
          const { bucketUrl, emailFields } = getCommonEmailFields(
            externalApi.identifierId,
            externalApi,
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

          // Send one email per confirmed booking — each has its own QR and reference
          await Promise.all(
            confirmedBookings.map(async (booking: any) => {
              // QR points to Workspace-FE verify-session page (room rep check-in UI)
              // Format: FE_BASE_URL/verify-session/:wrapperId/:sessionBookingId
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

              const mergeVars = {
                ...emailFields,
                CUSTOMER_NAME: payload.name,
                CUSTOMER_EMAIL: payload.email,
                SESSION_NAME: booking.sessionName,
                SLOT_DATE: formatDate(booking.slotDate),
                SLOT_TIME: booking.slotTime,
                ROOM: booking.room || 'לא צוין',
                BOOKING_REFERENCE: booking.bookingReference,
                QR_CODE_URL: checkInQrUrl || checkInUrl,
                CHECK_IN_URL: checkInUrl,
                BUTTON_LINK: externalApi?.websiteUrl,
                BANNER_IMG: `${bucketUrl}footer/banner-web.png`,
                MOBILE_BANNER_IMG: `${bucketUrl}footer/banner-mobile.png`,
                WEBSITE_NAME: externalApi?.name,
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
                mergeVars,
              });

              this.logger.info('[SESSION_BOOKINGS]: Confirmation email sent', {
                email: payload.email,
                bookingReference: booking.bookingReference,
                sessionName: booking.sessionName,
              });
            }),
          );
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
          sessionName: updated.sessionName,
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
    sessionName?: string,
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

      if (sessionName) {
        query.sessionName = sessionName;
      }

      const confirmedCount = await this.sessionBookingModel.countDocuments({
        ...query,
        status: { $in: ['CONFIRMED', 'ATTENDED'] },
      });

      const activeHoldsCount = await this.sessionBookingModel.countDocuments({
        ...query,
        status: 'ACTIVE',
        holdExpiresAt: { $gt: new Date() },
      });

      return Math.max(0, capacity - confirmedCount - activeHoldsCount);
    } catch (err) {
      this.logger.error('[SESSION_BOOKINGS]: Failed to calculate spots', {
        err: err instanceof Error ? err.message : String(err),
        slotDate,
        slotTime,
        wrapperId,
        sessionName,
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
