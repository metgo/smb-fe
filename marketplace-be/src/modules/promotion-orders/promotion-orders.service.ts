import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { PromotionOrderStatus, VoucherPaymentStatus } from 'src/common/enum';
import { DynamicEmailTemplate } from 'src/common/mailchimp/templateId';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { getCommonEmailFields } from 'src/common/utils/email/common-fields';
import { BusinessService } from 'src/modules/business/shared/services/business.service';
import { DocUploadService } from 'src/modules/doc-upload/doc-upload.service';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { PromotionOrdersGateway } from './promotion-orders.gateway';
import { PromotionOrder } from './schema/promotion-order.schema';
import {
  PromotionVoucherState,
  VoucherDetails,
  PromotionApplyResult,
  PromotionConfig,
  PromotionStatusResponse,
} from './promotion-orders.type';
import { LION_COIN_POOL_ASSIGNEE } from './promotion-orders.utils';

export { isLionCoinVoucher } from './promotion-orders.utils';

// Service data layer is generic; feature-specific constants (email recipients, templates)
// are Lion Coin-specific. Future promotions add their own.
export const LION_COIN_REDEEM_CODE = 'LION_COIN';

// Settings per redeemCode (spec v2 §3.3). No admin screen yet - change here. Every promotion voucher stores
// its own value, so a change only affects promotion vouchers reserved after deploy.
export const PROMOTION_CONFIG: Record<string, PromotionConfig> = {
  [LION_COIN_REDEEM_CODE]: {
    voucherValue: 500,
    voucherStepAmount: 2000,
    vouchersPerBusiness: 5,
    // One fixed window per buyer and business, started by the first reservation. Vouchers
    // added or released later keep that deadline; it is not restarted.
    reservationMinutes: 15,
  },
};

// Promotion vouchers of a payment in progress are released by the processor's failure callback, not by
// expiry. This backstop only catches callbacks that never arrive.
const PAYMENT_IN_PROGRESS_BACKSTOP_MINUTES = 60;

// Report recipient hardcoded until settings UI exists (checked MetGo-BE schemas - none fit).
const LION_COIN_REPORT_RECIPIENT = 'ifatkfir@8200.org.il';

// Back to the pool: clears the reservation and the voucher link (a fresh voucher is picked on next reserve).
const RELEASED_VOUCHER_FIELDS = {
  status: PromotionOrderStatus.AVAILABLE,
  reservedCartId: null,
  reservedBy: null,
  reservedAt: null,
  reservedUntil: null,
  paymentInProgress: false,
  voucherId: null,
  voucherCode: null,
  campaignId: null,
};

const UNREDEEMED_VOUCHER_FIELDS = {
  ...RELEASED_VOUCHER_FIELDS,
  redeemedOrderId: null,
  redeemedAt: null,
  paymentId: null,
  businessSubtotal: null,
};

const round2 = (n: number) => Math.round(n * 100) / 100;

const escapeHtml = (value: string) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const isDuplicateKeyError = (error: any): boolean => error?.code === 11000
  || (Array.isArray(error?.writeErrors)
    && error.writeErrors.length > 0
    && error.writeErrors.every((writeError: any) => writeError?.code === 11000));

export interface PromotionOrderEmailContext {
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amountPaid: number;
  paymentRequestId?: string;
  redeemedAt?: Date;
}

// One business's lines in an order's redemption report (spec v2 §4.6).
export interface PromotionRedemptionEntry {
  businessId: string;
  businessName: string;
  businessSubtotal: number;
  promoVouchers: PromotionOrder[];
  discountAmount: number;
  vouchersLeft: number;
  productsSummary?: string;
}

@Injectable()
export class PromotionOrdersService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(PromotionOrder.name)
    private readonly PromotionOrderModel: Model<PromotionOrder>,
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<any>,
    private readonly mailchimpService: MailChimpService,
    private readonly businessService: BusinessService,
    private readonly gateway: PromotionOrdersGateway,
    private readonly docUploadService: DocUploadService,
  ) {}

  getConfig(redeemCode: string = LION_COIN_REDEEM_CODE): PromotionConfig {
    return PROMOTION_CONFIG[redeemCode] ?? PROMOTION_CONFIG[LION_COIN_REDEEM_CODE];
  }

  /** One promotion voucher per full step of the business subtotal (before discount), capped per business. */
  getEligibleVoucherCount(businessSubtotal: number, redeemCode: string = LION_COIN_REDEEM_CODE): number {
    const config = this.getConfig(redeemCode);
    const subtotal = Math.max(0, round2(Number(businessSubtotal) || 0));
    return Math.min(config.vouchersPerBusiness, Math.floor(subtotal / config.voucherStepAmount));
  }

  private reservedUntilFromNow(config: PromotionConfig): Date {
    return new Date(Date.now() + config.reservationMinutes * 60 * 1000);
  }

  private async findPromoVouchersByBusiness(
    businessIds: string[],
    redeemCode: string,
  ): Promise<Map<string, PromotionOrder[]>> {
    const promoVouchers = await this.PromotionOrderModel.find({
      businessId: { $in: businessIds },
      redeemCode,
      voucherNumber: { $ne: null },
    })
      .select('businessId voucherNumber status value reservedBy reservedUntil')
      .lean();

    const byBusinessId = new Map<string, PromotionOrder[]>(businessIds.map(id => [id, []]));
    promoVouchers.forEach(promoVoucher => byBusinessId
      .get(promoVoucher.businessId.toString())
      ?.push(promoVoucher as PromotionOrder));
    return byBusinessId;
  }

  // Promotion vouchers are created lazily (first reservation), so a business with fewer docs than
  // vouchersPerBusiness still has the missing ones available. Each one also needs a free pool
  // voucher to back it, so availability is capped by what the pool has left.
  private countPromoVouchers(
    promoVouchers: PromotionOrder[],
    config: PromotionConfig,
    holderId?: string,
    freePoolVouchers: number = Infinity,
  ) {
    const mine = holderId
      ? promoVouchers.filter(promoVoucher => promoVoucher.status === PromotionOrderStatus.RESERVED
        && promoVoucher.reservedBy === holderId)
      : [];
    const reserved = promoVouchers.filter(promoVoucher => promoVoucher.status === PromotionOrderStatus.RESERVED).length;
    const redeemed = promoVouchers.filter(promoVoucher => promoVoucher.status === PromotionOrderStatus.REDEEMED).length;
    const available = Math.min(
      freePoolVouchers,
      promoVouchers.filter(promoVoucher => promoVoucher.status === PromotionOrderStatus.AVAILABLE).length
        + Math.max(0, config.vouchersPerBusiness - promoVouchers.length),
    );

    return {
      mine,
      reserved,
      redeemed,
      available,
      total: Math.max(config.vouchersPerBusiness, promoVouchers.length),
    };
  }

  private buildState(
    businessId: string,
    businessSubtotal: number,
    promoVouchers: PromotionOrder[],
    holderId: string | undefined,
    redeemCode: string,
    freePoolVouchers: number,
  ): PromotionVoucherState {
    const config = this.getConfig(redeemCode);
    const counts = this.countPromoVouchers(promoVouchers, config, holderId, freePoolVouchers);
    const eligibleByAmount = this.getEligibleVoucherCount(businessSubtotal, redeemCode);
    const applied = counts.mine.length;

    // Promotion vouchers still free after the buyer takes everything they qualify for now.
    const leftAfterEligible = counts.available - Math.max(0, eligibleByAmount - applied);
    const subtotal = Math.max(0, round2(Number(businessSubtotal) || 0));
    const nextVoucherGap = eligibleByAmount < config.vouchersPerBusiness && leftAfterEligible > 0
      ? round2((Math.floor(subtotal / config.voucherStepAmount) + 1) * config.voucherStepAmount - subtotal)
      : null;

    const reservedUntilTimes = counts.mine
      .map(promoVoucher => promoVoucher.reservedUntil?.getTime?.())
      .filter((time): time is number => typeof time === 'number');

    return {
      businessId,
      businessSubtotal: subtotal,
      voucherValue: config.voucherValue,
      voucherStepAmount: config.voucherStepAmount,
      vouchersTotal: counts.total,
      eligibleByAmount,
      available: counts.available,
      applied,
      appliedAmount: counts.mine.reduce((sum, promoVoucher) => sum + (promoVoucher.value || 0), 0),
      vouchersReserved: counts.reserved,
      vouchersRedeemed: counts.redeemed,
      nextVoucherGap,
      limitedByStock: applied + counts.available < eligibleByAmount,
      reservedUntil: reservedUntilTimes.length ? new Date(Math.min(...reservedUntilTimes)) : null,
    };
  }

  /** Spec v2 §4.2 - per-business promotion voucher state for the cart strip (no side effects). */
  async getVoucherStates(
    businesses: { businessId: string; businessSubtotal: number }[],
    holderId?: string,
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<PromotionVoucherState[]> {
    try {
      const [promoVouchersByBusiness, freePoolVouchers] = await Promise.all([
        this.findPromoVouchersByBusiness(
          businesses.map(business => business.businessId),
          redeemCode,
        ),
        this.countFreePoolVouchers(this.getConfig(redeemCode)),
      ]);

      return businesses.map(({ businessId, businessSubtotal }) => this.buildState(
        businessId,
        businessSubtotal,
        promoVouchersByBusiness.get(businessId) || [],
        holderId,
        redeemCode,
        freePoolVouchers,
      ));
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async getStatusForBusinesses(
    businessIds: string[],
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<PromotionStatusResponse[]> {
    try {
      const config = this.getConfig(redeemCode);
      const [promoVouchersByBusiness, freePoolVouchers] = await Promise.all([
        this.findPromoVouchersByBusiness(businessIds, redeemCode),
        this.countFreePoolVouchers(config),
      ]);

      return businessIds.map(businessId => {
        const counts = this.countPromoVouchers(
          promoVouchersByBusiness.get(businessId) || [],
          config,
          undefined,
          freePoolVouchers,
        );

        let status = PromotionOrderStatus.AVAILABLE;
        if (counts.redeemed >= counts.total) status = PromotionOrderStatus.REDEEMED;
        else if (counts.available === 0) status = PromotionOrderStatus.RESERVED;

        return {
          businessId,
          status,
          value: config.voucherValue,
          minThreshold: config.voucherStepAmount,
          vouchersTotal: counts.total,
          vouchersAvailable: counts.available,
          vouchersReserved: counts.reserved,
          vouchersRedeemed: counts.redeemed,
        };
      });
    } catch (error) {
      exceptionHandling(error);
    }
  }

  private async emitStatusForBusinesses(
    businessIds: string[],
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<void> {
    const uniqueIds = [...new Set(businessIds)];
    if (!uniqueIds.length) return;

    try {
      const statuses = await this.getStatusForBusinesses(uniqueIds, redeemCode);
      statuses.forEach(status => this.gateway.emitStatusChange(status, redeemCode));
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO EMIT STATUS', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getVouchersByIds(voucherIds: string[]): Promise<VoucherDetails[]> {
    const ids = voucherIds.filter(Boolean);
    if (!ids.length) return [];

    try {
      const vouchers = await this.VoucherModel.find({ _id: { $in: ids } })
        .select('_id code remainingAmount expireDate paymentStatus')
        .lean();

      return vouchers.map((voucher: any) => ({
        _id: voucher._id.toString(),
        code: voucher.code,
        remainingAmount: voucher.remainingAmount,
        expireDate: voucher.expireDate,
        paymentStatus: voucher.paymentStatus,
      }));
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO GET VOUCHERS', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /** Free vouchers in the Lion Coin pool worth exactly one promotion voucher, not linked to any. */
  private async freePoolVoucherFilter(config: PromotionConfig) {
    const usedVoucherIds = await this.PromotionOrderModel.distinct('voucherId', {
      voucherId: { $ne: null },
    });

    return {
      'assigneeInfo.name': LION_COIN_POOL_ASSIGNEE.name,
      'assigneeInfo.email': LION_COIN_POOL_ASSIGNEE.email,
      amount: config.voucherValue,
      paymentStatus: VoucherPaymentStatus.PAID,
      remainingAmount: { $gte: config.voucherValue },
      _id: { $nin: usedVoucherIds },
      isDeleted: { $ne: true },
      $or: [{ expireDate: null }, { expireDate: { $gte: new Date() } }],
    };
  }

  private async countFreePoolVouchers(config: PromotionConfig): Promise<number> {
    return this.VoucherModel.countDocuments(await this.freePoolVoucherFilter(config));
  }

  /**
   * A free pool voucher to back one promotion voucher. The unique voucherId index catches the
   * remaining concurrent-pick race.
   */
  private async findAvailablePoolVoucher(config: PromotionConfig): Promise<any | null> {
    const voucher = await this.VoucherModel.findOne(await this.freePoolVoucherFilter(config))
      .select('_id code campId')
      .lean();

    if (!voucher) {
      this.logger.warn('[LION_COIN]: NO AVAILABLE LION COIN VOUCHER', { voucherValue: config.voucherValue });
    }

    return voucher;
  }

  /** Creates the business's promotion voucher docs on first use. Concurrent callers race safely on the unique index. */
  private async ensurePromoVouchers(businessId: string, redeemCode: string, config: PromotionConfig): Promise<void> {
    const existing = await this.PromotionOrderModel.countDocuments({
      businessId,
      redeemCode,
      voucherNumber: { $ne: null },
    });
    if (existing >= config.vouchersPerBusiness) return;

    const operations = Array.from({ length: config.vouchersPerBusiness }, (_, index) => ({
      updateOne: {
        filter: { businessId, redeemCode, voucherNumber: index + 1 },
        update: {
          $setOnInsert: {
            status: PromotionOrderStatus.AVAILABLE,
            value: config.voucherValue,
            minThreshold: config.voucherStepAmount,
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    try {
      await this.PromotionOrderModel.bulkWrite(operations as any, { ordered: false });
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
    }
  }

  /** Atomic claim of the lowest-numbered AVAILABLE promotion voucher, paired with a fresh pool voucher. */
  private async reserveOneVoucher(
    businessId: string,
    holderId: string,
    redeemCode: string,
    config: PromotionConfig,
    reservedUntil: Date,
  ): Promise<PromotionOrder | null> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      const voucher = await this.findAvailablePoolVoucher(config);
      if (!voucher) return null;

      try {
        // eslint-disable-next-line no-await-in-loop
        return await this.PromotionOrderModel.findOneAndUpdate(
          {
            businessId,
            redeemCode,
            status: PromotionOrderStatus.AVAILABLE,
            voucherNumber: { $ne: null },
          },
          {
            status: PromotionOrderStatus.RESERVED,
            value: config.voucherValue,
            minThreshold: config.voucherStepAmount,
            reservedBy: holderId,
            reservedAt: new Date(),
            reservedUntil,
            paymentInProgress: false,
            voucherId: voucher._id,
            voucherCode: voucher.code,
            campaignId: voucher.campId || null,
          },
          { new: true, sort: { voucherNumber: 1 } },
        ).lean();
      } catch (error) {
        // Another buyer took this voucher in the meantime - pick another one.
        if (!isDuplicateKeyError(error)) throw error;
      }
    }

    return null;
  }

  /**
   * Spec v2 §4.4 - makes the buyer's held promotion vouchers for one business match what the subtotal
   * qualifies for: releases the excess (highest voucherNumber first) or reserves more while
   * promotion vouchers are left.
   *
   * Reservation window: the first reservation starts a fixed reservationMinutes window. Vouchers
   * added later get the same deadline, and releasing some leaves the rest unchanged - the timer is
   * never restarted (product decision, deviates from spec §2 / test 11b). Once the window is over,
   * the old holds are released and the next reservation starts a new window.
   */
  async syncHolderVouchers(
    businessId: string,
    holderId: string,
    businessSubtotal: number,
    options: { cartId?: string; paymentInProgress?: boolean } = {},
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<{ promoVouchers: PromotionOrder[]; previousCount: number }> {
    const config = this.getConfig(redeemCode);
    const eligible = this.getEligibleVoucherCount(businessSubtotal, redeemCode);
    const holderFilter = {
      businessId,
      redeemCode,
      status: PromotionOrderStatus.RESERVED,
      reservedBy: holderId,
      voucherNumber: { $ne: null },
    };

    let held = await this.PromotionOrderModel.find(holderFilter)
      .sort({ voucherNumber: -1 })
      .lean();

    const now = Date.now();
    const heldDeadlines = held
      .map(promoVoucher => promoVoucher.reservedUntil?.getTime?.())
      .filter((time): time is number => typeof time === 'number');
    const heldDeadline = heldDeadlines.length ? Math.min(...heldDeadlines) : null;

    // Window over but the expiry job hasn't run yet: those holds are gone, start fresh.
    if (held.length && heldDeadline !== null && heldDeadline <= now) {
      await this.PromotionOrderModel.updateMany(
        { ...holderFilter, _id: { $in: held.map(promoVoucher => promoVoucher._id) } },
        RELEASED_VOUCHER_FIELDS,
      );
      held = [];
    }
    const previousCount = held.length;

    // Keep the running window; only a buyer with no live holds gets a new one.
    const reservedUntil = held.length && heldDeadline !== null
      ? new Date(heldDeadline)
      : this.reservedUntilFromNow(config);

    let keptIds = held.map(promoVoucher => promoVoucher._id);
    if (held.length > eligible) {
      const excessIds = keptIds.slice(0, held.length - eligible);
      keptIds = keptIds.slice(held.length - eligible);
      await this.PromotionOrderModel.updateMany(
        { ...holderFilter, _id: { $in: excessIds } },
        RELEASED_VOUCHER_FIELDS,
      );
    }

    // Docs are only created when the pool can actually back a reservation.
    if (keptIds.length < eligible && await this.countFreePoolVouchers(config) > 0) {
      await this.ensurePromoVouchers(businessId, redeemCode, config);
      while (keptIds.length < eligible) {
        // eslint-disable-next-line no-await-in-loop
        const claimed = await this.reserveOneVoucher(
          businessId,
          holderId,
          redeemCode,
          config,
          reservedUntil,
        );
        if (!claimed) break;
        keptIds.push(claimed._id);
      }
    }

    let promoVouchers: PromotionOrder[] = [];
    if (keptIds.length) {
      await this.PromotionOrderModel.updateMany(
        { ...holderFilter, _id: { $in: keptIds } },
        {
          // Aligns every held voucher on the one deadline (never extends it).
          reservedUntil,
          ...(options.cartId ? { reservedCartId: options.cartId } : {}),
          ...(options.paymentInProgress !== undefined
            ? { paymentInProgress: options.paymentInProgress }
            : {}),
        },
      );
      promoVouchers = await this.PromotionOrderModel.find({ ...holderFilter, _id: { $in: keptIds } })
        .sort({ voucherNumber: 1 })
        .lean() as PromotionOrder[];
    }

    if (promoVouchers.length !== previousCount) {
      this.logger.info('[LION_COIN]: HOLDER COINS ADJUSTED', {
        businessId,
        holderId,
        businessSubtotal,
        previousCount,
        count: promoVouchers.length,
      });
      await this.emitStatusForBusinesses([businessId], redeemCode);
    }

    return { promoVouchers, previousCount };
  }

  private async toApplyResult(
    businessId: string,
    sessionId: string,
    businessSubtotal: number,
    promoVouchers: PromotionOrder[],
    previousCount: number,
    redeemCode: string,
  ): Promise<PromotionApplyResult> {
    const [state] = await this.getVoucherStates(
      [{ businessId, businessSubtotal }],
      sessionId,
      redeemCode,
    );
    const vouchers = await this.getVouchersByIds(
      promoVouchers.map(promoVoucher => promoVoucher.voucherId?.toString()).filter(Boolean),
    );

    return {
      businessId,
      sessionId,
      promoVouchers: promoVouchers.map(promoVoucher => ({
        _id: promoVoucher._id.toString(),
        voucherNumber: promoVoucher.voucherNumber,
        value: promoVoucher.value,
      })),
      vouchers,
      state,
      previousCount,
    };
  }

  /**
   * Cart "Apply N Lion Coins" (opt-in) and every later cart change for an opted-in business.
   * The browser only sends the subtotal; the promotion voucher count is always decided here.
   */
  async applyAtDrawer(
    businessId: string,
    sessionId: string | undefined,
    businessSubtotal: number,
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<PromotionApplyResult> {
    try {
      const holderId = sessionId || this.generateSessionId();
      const { promoVouchers, previousCount } = await this.syncHolderVouchers(
        businessId,
        holderId,
        businessSubtotal,
        {},
        redeemCode,
      );

      return await this.toApplyResult(
        businessId,
        holderId,
        businessSubtotal,
        promoVouchers,
        previousCount,
        redeemCode,
      );
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /** Cart "Cancel" (opt-out) - releases only this buyer's promotion vouchers for the business. */
  async release(
    businessId: string,
    holderId: string,
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<number> {
    try {
      const result = await this.PromotionOrderModel.updateMany(
        {
          businessId,
          redeemCode,
          status: PromotionOrderStatus.RESERVED,
          reservedBy: holderId,
        },
        RELEASED_VOUCHER_FIELDS,
      );

      if (result.modifiedCount) {
        this.logger.info('[LION_COIN]: RELEASED', { businessId, holderId, count: result.modifiedCount });
        await this.emitStatusForBusinesses([businessId], redeemCode);
      }

      return result.modifiedCount;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /**
   * Buyer closed the payment page: releases every promotion voucher the session holds, across
   * businesses. Vouchers of a payment already at the processor stay - its callback decides.
   */
  async releaseSession(
    holderId: string,
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<number> {
    try {
      const filter = {
        redeemCode,
        status: PromotionOrderStatus.RESERVED,
        reservedBy: holderId,
        paymentInProgress: { $ne: true },
      };
      const releasing = await this.PromotionOrderModel.find(filter, { businessId: 1 }).lean();
      if (!releasing.length) return 0;

      const result = await this.PromotionOrderModel.updateMany(
        { ...filter, _id: { $in: releasing.map(promoVoucher => promoVoucher._id) } },
        RELEASED_VOUCHER_FIELDS,
      );

      if (result.modifiedCount) {
        this.logger.info('[LION_COIN]: RELEASED ON PAGE CLOSE', { holderId, count: result.modifiedCount });
        await this.emitStatusForBusinesses(
          releasing.map(promoVoucher => promoVoucher.businessId.toString()),
          redeemCode,
        );
      }

      return result.modifiedCount;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /**
   * Generate a unique session ID.
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Releases reservations past reservedUntil. Promotion vouchers of a payment in progress are left to the
   * processor's callback (with a backstop for lost callbacks).
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async expireStaleReservations(redeemCode: string = LION_COIN_REDEEM_CODE): Promise<void> {
    try {
      const now = new Date();
      const paymentBackstop = new Date(
        now.getTime() - PAYMENT_IN_PROGRESS_BACKSTOP_MINUTES * 60 * 1000,
      );
      const staleFilter = {
        redeemCode,
        status: PromotionOrderStatus.RESERVED,
        $or: [
          { paymentInProgress: { $ne: true }, reservedUntil: { $lt: now } },
          { paymentInProgress: true, reservedUntil: { $lt: paymentBackstop } },
        ],
      };

      // Read businessIds before updateMany (it doesn't report touched docs) for socket broadcast.
      const expiring = await this.PromotionOrderModel.find(staleFilter, { businessId: 1 }).lean();
      if (!expiring.length) return;

      const result = await this.PromotionOrderModel.updateMany(
        { _id: { $in: expiring.map(promoVoucher => promoVoucher._id) }, status: PromotionOrderStatus.RESERVED },
        RELEASED_VOUCHER_FIELDS,
      );

      if (result.modifiedCount) {
        this.logger.info('[LION_COIN]: EXPIRED STALE RESERVATIONS', {
          count: result.modifiedCount,
        });
        await this.emitStatusForBusinesses(
          expiring.map(promoVoucher => promoVoucher.businessId.toString()),
          redeemCode,
        );
      }
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO EXPIRE STALE RESERVATIONS', {
        err: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Checkout was refused before payment started - the vouchers stay held (normal expiry applies)
   * but are no longer protected as "payment in progress".
   */
  async endPaymentInProgress(cartId: string, redeemCode: string = LION_COIN_REDEEM_CODE): Promise<void> {
    await this.PromotionOrderModel.updateMany(
      {
        reservedCartId: cartId,
        redeemCode,
        status: PromotionOrderStatus.RESERVED,
        paymentInProgress: true,
      },
      { paymentInProgress: false },
    );
  }

  /** Payment failed / abandoned - releases every promotion voucher reserved against the cart. */
  async releaseByCartId(cartId: string, redeemCode: string = LION_COIN_REDEEM_CODE): Promise<void> {
    try {
      const filter = {
        reservedCartId: cartId,
        redeemCode,
        status: PromotionOrderStatus.RESERVED,
      };
      const releasing = await this.PromotionOrderModel.find(filter, { businessId: 1 }).lean();
      if (!releasing.length) return;

      const result = await this.PromotionOrderModel.updateMany(filter, RELEASED_VOUCHER_FIELDS);

      if (result.modifiedCount) {
        this.logger.info('[LION_COIN]: RELEASED RESERVATIONS FOR CART', {
          cartId,
          count: result.modifiedCount,
        });
        await this.emitStatusForBusinesses(
          releasing.map(promoVoucher => promoVoucher.businessId.toString()),
          redeemCode,
        );
      }
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO RELEASE BY CART ID', {
        cartId,
        err: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Payment initiation (spec v2 §4.4): final server-side recalculation for every business the
   * buyer opted into, links the promotion vouchers to the cart and flags the payment as in
   * progress (which protects them from expiry - the window itself is not extended).
   * Returns the promotion vouchers (and their backing vouchers) that will be charged.
   */
  async applyToVendorCart(
    vendorProducts: { _id: mongoose.Types.ObjectId; totalAmount: number }[],
    cartId: string,
    holderId: string,
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<PromotionApplyResult[]> {
    if (!holderId || !vendorProducts.length) return [];

    try {
      const businessIds = vendorProducts.map(vendor => vendor._id.toString());
      const optedInBusinessIds = new Set(
        (await this.PromotionOrderModel.distinct('businessId', {
          businessId: { $in: businessIds },
          redeemCode,
          status: PromotionOrderStatus.RESERVED,
          reservedBy: holderId,
        })).map(id => id.toString()),
      );

      if (!optedInBusinessIds.size) return [];

      // Different businesses' promotion vouchers are independent, so syncing concurrently is safe.
      const results = await Promise.all(
        vendorProducts
          .filter(vendor => optedInBusinessIds.has(vendor._id.toString()))
          .map(async vendor => {
            const businessId = vendor._id.toString();
            const { promoVouchers, previousCount } = await this.syncHolderVouchers(
              businessId,
              holderId,
              vendor.totalAmount,
              { cartId, paymentInProgress: true },
              redeemCode,
            );

            return this.toApplyResult(
              businessId,
              holderId,
              vendor.totalAmount,
              promoVouchers,
              previousCount,
              redeemCode,
            );
          }),
      );

      return results.filter(result => result.promoVouchers.length);
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /**
   * Promotion vouchers charged in this cart's payment, keyed by businessId. Matched by cart link and by the
   * vouchers actually redeemed on the order, never by "any reservation for the business".
   * REDEEMED is included so retried webhooks compute the same discounts.
   */
  async findPromoVouchersForCart(
    cartId: string,
    voucherIds: string[] = [],
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<Map<string, PromotionOrder[]>> {
    try {
      const promoVouchers = await this.PromotionOrderModel.find({
        redeemCode,
        voucherNumber: { $ne: null },
        status: { $in: [PromotionOrderStatus.RESERVED, PromotionOrderStatus.REDEEMED] },
        $or: [
          { reservedCartId: cartId },
          ...(voucherIds.length ? [{ voucherId: { $in: voucherIds } }] : []),
        ],
      })
        .sort({ voucherNumber: 1 })
        .lean();

      const byBusinessId = new Map<string, PromotionOrder[]>();
      promoVouchers.forEach(promoVoucher => {
        const businessId = promoVoucher.businessId.toString();
        byBusinessId.set(businessId, [...(byBusinessId.get(businessId) || []), promoVoucher as PromotionOrder]);
      });
      return byBusinessId;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /** Voucher ids of the promotion vouchers this buyer currently holds (any business). */
  async getHeldVoucherIds(holderId: string, redeemCode: string = LION_COIN_REDEEM_CODE): Promise<string[]> {
    if (!holderId) return [];

    const promoVouchers = await this.PromotionOrderModel.find({
      redeemCode,
      status: PromotionOrderStatus.RESERVED,
      reservedBy: holderId,
      voucherId: { $ne: null },
    })
      .select('voucherId')
      .lean();

    return promoVouchers.map(promoVoucher => promoVoucher.voucherId.toString());
  }

  /**
   * RESERVED -> REDEEMED after payment confirmation, per promotion voucher. Atomic on status so retried
   * webhooks can't double-redeem; `newlyRedeemed` is false on a retry (no second email).
   */
  async redeemVouchers(
    promoVoucherIds: string[],
    orderId: string,
    businessSubtotal: number,
    paymentId?: string,
  ): Promise<{ promoVouchers: PromotionOrder[]; newlyRedeemed: boolean }> {
    try {
      const result = await this.PromotionOrderModel.updateMany(
        { _id: { $in: promoVoucherIds }, status: PromotionOrderStatus.RESERVED },
        {
          status: PromotionOrderStatus.REDEEMED,
          redeemedOrderId: orderId,
          redeemedAt: new Date(),
          paymentId: paymentId || null,
          businessSubtotal,
          paymentInProgress: false,
          reservedUntil: null,
        },
      );

      const promoVouchers = await this.PromotionOrderModel.find({
        _id: { $in: promoVoucherIds },
        status: PromotionOrderStatus.REDEEMED,
        redeemedOrderId: orderId,
      })
        .sort({ voucherNumber: 1 })
        .lean() as PromotionOrder[];

      if (result.modifiedCount) {
        this.logger.info('[LION_COIN]: REDEEMED', { orderId, count: result.modifiedCount });
        await this.emitStatusForBusinesses(promoVouchers.map(promoVoucher => promoVoucher.businessId.toString()));
      }

      return { promoVouchers, newlyRedeemed: result.modifiedCount > 0 };
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /** Full cancellation / full refund - every promotion voucher redeemed on these orders returns to the pool. */
  async releaseByOrderIds(orderIds: string[]): Promise<PromotionOrder[]> {
    try {
      const filter = {
        redeemedOrderId: { $in: orderIds },
        status: PromotionOrderStatus.REDEEMED,
      };
      const releasing = await this.PromotionOrderModel.find(filter).sort({ voucherNumber: 1 }).lean();
      if (!releasing.length) return [];

      const result = await this.PromotionOrderModel.updateMany(
        { ...filter, _id: { $in: releasing.map(promoVoucher => promoVoucher._id) } },
        UNREDEEMED_VOUCHER_FIELDS,
      );

      if (result.modifiedCount) {
        this.logger.info('[LION_COIN]: RELEASED AFTER ORDER CANCELLATION', {
          orderIds,
          count: result.modifiedCount,
        });
        await this.emitStatusForBusinesses(releasing.map(promoVoucher => promoVoucher.businessId.toString()));
      }

      return releasing as PromotionOrder[];
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /** Total Lion Coin discount redeemed on an order (sum of its promotion vouchers). */
  async getDiscountAmountByOrderId(orderId: string, redeemCode: string = LION_COIN_REDEEM_CODE): Promise<number> {
    try {
      const promoVouchers = await this.PromotionOrderModel.find({
        redeemedOrderId: orderId,
        redeemCode,
        status: PromotionOrderStatus.REDEEMED,
      }).select('value').lean();

      return promoVouchers.reduce((sum, promoVoucher) => sum + (promoVoucher.value || 0), 0);
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO GET DISCOUNT BY ORDER ID', {
        orderId,
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  async getVouchersLeft(businessId: string, redeemCode: string = LION_COIN_REDEEM_CODE): Promise<number> {
    const [status] = (await this.getStatusForBusinesses([businessId], redeemCode)) || [];
    return status?.vouchersAvailable ?? 0;
  }

  private buildBusinessTableHtml(entries: PromotionRedemptionEntry[]): string {
    const rows = entries.map(entry => `<tr>
      <td>${escapeHtml(entry.businessName)}</td>
      <td>₪${round2(entry.businessSubtotal)}</td>
      <td>${entry.promoVouchers.length}</td>
      <td>₪${round2(entry.discountAmount)}</td>
      <td>${entry.vouchersLeft}</td>
    </tr>`).join('');

    return `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
      <tr><th>Business</th><th>Business subtotal</th><th>Vouchers applied</th><th>Discount</th><th>Vouchers left</th></tr>
      ${rows}
    </table>`;
  }

  /** Spec v2 §4.6 - one report email per order, one table row per business. */
  async sendRedemptionEmails(
    entries: PromotionRedemptionEntry[],
    context: PromotionOrderEmailContext,
    externalApi?: any,
  ): Promise<void> {
    if (!entries.length) return;

    const buildMergeVars = (lines: PromotionRedemptionEntry[]) => {
      const vouchersCount = lines.reduce((sum, entry) => sum + entry.promoVouchers.length, 0);
      const discount = round2(lines.reduce((sum, entry) => sum + entry.discountAmount, 0));

      // Merge vars match high-value-order-alert convention: ORDER_ID (not ORDER_NUMBER) plus ORDER_DATE per spec.
      return {
        vouchersCount,
        discount,
        mergeVars: {
          BUSINESS_NAME: lines.map(entry => entry.businessName).join(', '),
          ORDER_ID: context.orderNumber,
          ORDER_DATE: (context.redeemedAt || new Date()).toISOString(),
          BUYER_NAME: context.buyerName,
          BUYER_EMAIL: context.buyerEmail,
          BUYER_PHONE: context.buyerPhone,
          PRODUCTS_PURCHASED: lines.map(entry => entry.productsSummary).filter(Boolean).join(' | '),
          AMOUNT_BEFORE_DISCOUNT: round2(lines.reduce((sum, entry) => sum + entry.businessSubtotal, 0)),
          LION_COIN_DISCOUNT: discount,
          VOUCHERS_COUNT: vouchersCount,
          BUSINESS_TABLE: this.buildBusinessTableHtml(lines),
          AMOUNT_PAID: context.amountPaid,
          PAYMENT_REFERENCE: context.paymentRequestId || '',
        },
      };
    };

    try {
      const report = buildMergeVars(entries);
      await this.mailchimpService.sendTransactionalEmail({
        to: LION_COIN_REPORT_RECIPIENT,
        templatedId: DynamicEmailTemplate.LionCoinRedeemed,
        subject: `Lion Coins redeemed – Order ${context.orderNumber} – ${report.vouchersCount} promoVouchers – ₪${report.discount}`,
        mergeVars: report.mergeVars,
      });
    } catch (error) {
      // Email failure never rolls back redemption (saved in DB per spec, recoverable from report).
      this.logger.error('[LION_COIN]: FAILED TO SEND REDEMPTION EMAIL', {
        orderNumber: context.orderNumber,
        err: error instanceof Error ? error.message : String(error),
      });
    }

    // Optional per-business notification (no settings UI yet) - only that business's lines.
    const notifyEntries = entries.filter(entry => entry.promoVouchers
      .some(promoVoucher => promoVoucher.notifyBusinessOnRedemption));
    if (!notifyEntries.length) return;

    try {
      const businesses = (await this.businessService.findBusinessEmailByIds(
        notifyEntries.map(entry => entry.businessId as any),
      )) || [];
      const emailByBusinessId = new Map(
        businesses.map((business: any) => [business?._id?.toString(), business?.userId?.email]),
      );

      // Vendor-facing email needs site branding (logo, colors, footer).
      // External emails use getCommonEmailFields; internal alerts don't.
      const { emailFields } = externalApi
        ? await getCommonEmailFields(externalApi, this.docUploadService)
        : { emailFields: {} };

      await Promise.all(notifyEntries.map(async entry => {
        const businessEmail = emailByBusinessId.get(entry.businessId);
        if (!businessEmail) return;

        const { vouchersCount, discount, mergeVars } = buildMergeVars([entry]);
        await this.mailchimpService.sendTransactionalEmail({
          to: businessEmail,
          templatedId: DynamicEmailTemplate.LionCoinRedeemedForBusiness,
          subject: `Lion Coins redeemed – Order ${context.orderNumber} – ${vouchersCount} promoVouchers – ₪${discount}`,
          mergeVars: { ...mergeVars, ...emailFields },
        });
      }));
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO SEND BUSINESS REDEMPTION EMAIL', {
        orderNumber: context.orderNumber,
        err: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /** Lists the promotion vouchers returned to each business. */
  async sendCancellationEmail(
    releasedVouchers: PromotionOrder[],
    context: { orderNumber: string; buyerName: string; amountPaid: number },
  ): Promise<void> {
    if (!releasedVouchers.length) return;

    try {
      const promoVouchersByBusiness = new Map<string, PromotionOrder[]>();
      releasedVouchers.forEach(promoVoucher => {
        const businessId = promoVoucher.businessId.toString();
        promoVouchersByBusiness.set(businessId, [...(promoVouchersByBusiness.get(businessId) || []), promoVoucher]);
      });

      const businesses = (await this.businessService.findBusinessEmailByIds(
        [...promoVouchersByBusiness.keys()] as any,
      )) || [];
      const nameByBusinessId = new Map(
        businesses.map((business: any) => [business?._id?.toString(), business?.name]),
      );

      const rows = [...promoVouchersByBusiness.entries()].map(([businessId, promoVouchers]) => `<tr>
        <td>${escapeHtml(nameByBusinessId.get(businessId) || businessId)}</td>
        <td>${promoVouchers.map(promoVoucher => `#${promoVoucher.voucherNumber}`).join(', ')}</td>
        <td>₪${round2(promoVouchers.reduce((sum, promoVoucher) => sum + (promoVoucher.value || 0), 0))}</td>
      </tr>`).join('');
      const discount = round2(releasedVouchers.reduce((sum, promoVoucher) => sum + (promoVoucher.value || 0), 0));
      const businessNames = [...promoVouchersByBusiness.keys()]
        .map(businessId => nameByBusinessId.get(businessId) || businessId)
        .join(', ');

      await this.mailchimpService.sendTransactionalEmail({
        to: LION_COIN_REPORT_RECIPIENT,
        templatedId: DynamicEmailTemplate.LionCoinCancelled,
        subject: `Lion Coins redemption cancelled – ${businessNames} – Order ${context.orderNumber}`,
        mergeVars: {
          BUSINESS_NAME: businessNames,
          ORDER_ID: context.orderNumber,
          ORDER_DATE: new Date().toISOString(),
          BUYER_NAME: context.buyerName || '',
          LION_COIN_DISCOUNT: discount,
          VOUCHERS_COUNT: releasedVouchers.length,
          BUSINESS_TABLE: `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
            <tr><th>Business</th><th>Vouchers returned</th><th>Value</th></tr>
            ${rows}
          </table>`,
          AMOUNT_PAID: context.amountPaid || 0,
        },
      });
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO SEND CANCELLATION EMAIL', {
        orderNumber: context.orderNumber,
        err: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /** Per-business status + promotion voucher counters for the cart's availability polling. */
  async list(businessIds: string[]): Promise<PromotionStatusResponse[]> {
    try {
      return await this.getStatusForBusinesses(businessIds);
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO LIST RESERVED/REDEEMED ORDERS', {
        err: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
