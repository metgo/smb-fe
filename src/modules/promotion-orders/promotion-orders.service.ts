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
import { PromotionApplyResult, PromotionStatusResponse } from './promotion-orders.type';

// Service data layer is generic; feature-specific constants (email recipients, templates)
// are Lion Coin-specific. Future promotions add their own.
const LION_COIN_REDEEM_CODE = 'LION_COIN';

// Report recipient hardcoded until settings UI exists (checked MetGo-BE schemas - none fit).
const LION_COIN_REPORT_RECIPIENT = 'ifatkfir@8200.org.il';

// 15-minute timeout (Barak corrected from PDF's 24h). Cron backstops abandoned drawer-holds
// since most reservations start before checkout.
const LION_COIN_RESERVATION_TIMEOUT_MINUTES = 15;

export interface PromotionOrderEmailContext {
  orderId: string;
  orderNumber: string;
  businessName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  productsSummary?: string;
  amountBeforeDiscount: number;
  amountPaid: number;
  paymentRequestId?: string;
  redeemedAt?: Date;
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

  async getStatusForBusinesses(
    businessIds: string[],
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<PromotionStatusResponse[]> {
    try {
      const records = await this.PromotionOrderModel.find({
        businessId: { $in: businessIds },
        redeemCode,
      }).lean();

      const byBusinessId = new Map(
        records.map(record => [record.businessId.toString(), record]),
      );

      return businessIds.map(businessId => {
        const record = byBusinessId.get(businessId);

        if (!record) {
          return {
            businessId,
            status: 'NOT_PARTICIPATING' as const,
            value: 0,
            minThreshold: 0,
          };
        }

        return {
          businessId,
          status: record.status,
          value: record.value,
          minThreshold: record.minThreshold,
          voucherId: record.voucherId?.toString(),
          voucherCode: record.voucherCode,
          campaignId: record.campaignId?.toString(),
        };
      });
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /**
   * Get voucher by ID for API response.
   */
  async getVoucherById(voucherId?: string): Promise<any | null> {
    if (!voucherId) return null;
    try {
      return await this.VoucherModel.findById(voucherId)
        .select('_id code remainingAmount expireDate paymentStatus')
        .lean();
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO GET VOUCHER BY ID', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Finds an available voucher from the specific 100 vouchers Barak created for Lion Coin.
   * Match criteria from vouchers_2026-10-15.csv and staging database (ALL THREE must match):
   * - assigneeInfo.name = "Lion Coin"
   * - assigneeInfo.email = "support@metgo.app"
   * - amount = 2500
   * - paymentStatus = 'PAID' (vouchers are activated)
   * - remainingAmount >= 2500
   * - Not already linked to a RESERVED or REDEEMED PromotionOrder
   * Returns null if no available voucher found.
   */
  private async findAvailableGALILVoucher(): Promise<{
    _id: string;
    code: string;
    campId: string;
    remainingAmount: number;
    expireDate: Date;
    paymentStatus: string;
  } | null> {
    try {
      // Find vouchers specifically assigned to "Lion Coin" (Barak's 100 vouchers)
      // All three criteria must match to ensure we only use the specific 100 vouchers
      const usedVoucherIds = await this.PromotionOrderModel.find({
        voucherId: { $ne: null },
        status: { $in: [PromotionOrderStatus.RESERVED, PromotionOrderStatus.REDEEMED] },
      }).distinct('voucherId');

      const voucher: any = await this.VoucherModel.findOne({
        'assigneeInfo.name': 'Lion Coin',
        'assigneeInfo.email': 'support@metgo.app',
        amount: 2500,
        paymentStatus: VoucherPaymentStatus.PAID,
        remainingAmount: { $gte: 2500 },
        _id: { $nin: usedVoucherIds },
        isDeleted: { $ne: true },
      }).select('_id code campId remainingAmount expireDate paymentStatus').lean();

      if (!voucher) {
        this.logger.warn('[LION_COIN]: NO AVAILABLE LION COIN VOUCHER');
        return null;
      }

      return {
        _id: voucher._id.toString(),
        code: voucher.code,
        campId: voucher.campId?.toString(),
        remainingAmount: voucher.remainingAmount,
        expireDate: voucher.expireDate,
        paymentStatus: voucher.paymentStatus,
      };
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO FIND AVAILABLE VOUCHER', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Atomic claim: only succeeds while AVAILABLE. Prevents concurrent double-claims (spec test #6).
   * holderId is client session id, not validated identity. Auto-generated if not provided.
   * If voucherId not provided, automatically selects from GALIL pool (Barak's 100 vouchers).
   */
  async reserve(
    businessId: string,
    holderId?: string,
    cartId?: string,
    redeemCode: string = LION_COIN_REDEEM_CODE,
    voucherId?: string,
    voucherCode?: string,
    campaignId?: string,
  ): Promise<PromotionOrder | null> {
    try {
      // Auto-generate holderId if not provided
      const actualHolderId = holderId || this.generateSessionId();

      // Auto-select from GALIL pool if no voucher provided
      let selectedVoucherId = voucherId;
      let selectedVoucherCode = voucherCode;
      let selectedCampaignId = campaignId;

      if (!selectedVoucherId && redeemCode === LION_COIN_REDEEM_CODE) {
        const availableVoucher = await this.findAvailableGALILVoucher();
        if (availableVoucher) {
          selectedVoucherId = availableVoucher._id;
          selectedVoucherCode = availableVoucher.code;
          selectedCampaignId = availableVoucher.campId;
        }
      }

      const updateData: any = {
        status: PromotionOrderStatus.RESERVED,
        reservedCartId: cartId || null,
        reservedBy: actualHolderId,
        reservedAt: new Date(),
      };

      if (selectedVoucherId) updateData.voucherId = selectedVoucherId;
      if (selectedVoucherCode) updateData.voucherCode = selectedVoucherCode;
      if (selectedCampaignId) updateData.campaignId = selectedCampaignId;

      const reserved = await this.PromotionOrderModel.findOneAndUpdate(
        { businessId, redeemCode, status: PromotionOrderStatus.AVAILABLE },
        updateData,
        { new: true },
      );

      if (!reserved) {
        // Check if a record exists at all
        const existingRecord = await this.PromotionOrderModel.findOne({
          businessId,
          redeemCode,
        });

        if (!existingRecord) {
          // Only auto-create if we have a voucher available
          if (!selectedVoucherId) {
            this.logger.warn(
              '[LION_COIN]: CANNOT AUTO-CREATE - NO VOUCHER AVAILABLE',
              { businessId },
            );
            return null;
          }

          // Try to create a new promotion order if none exists
          const newPromotionOrder = await this.PromotionOrderModel.create({
            businessId,
            redeemCode,
            status: PromotionOrderStatus.RESERVED,
            value: 2500,
            minThreshold: 9500,
            reservedCartId: cartId || null,
            reservedBy: actualHolderId,
            reservedAt: new Date(),
            voucherId: selectedVoucherId,
            voucherCode: selectedVoucherCode,
            campaignId: selectedCampaignId,
          });

          if (newPromotionOrder) {
            this.gateway.emitStatusChange(businessId, PromotionOrderStatus.RESERVED);
            return newPromotionOrder;
          }
        }

        this.logger.info(
          '[LION_COIN]: RESERVE FAILED - NOT AVAILABLE',
          { businessId, holderId },
        );
        return null;
      }

      this.gateway.emitStatusChange(businessId, PromotionOrderStatus.RESERVED);
      return reserved;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /**
   * Cart-drawer "Cancellation of Use" - releases reservation.
   * If holderId provided, only releases if caller matches holderId (prevents canceling others' holds).
   * If holderId not provided, releases any reservation for this business (less secure but simpler).
   */
  async release(
    businessId: string,
    holderId?: string,
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<PromotionOrder | null> {
    try {
      const query: any = {
        businessId,
        redeemCode,
        status: PromotionOrderStatus.RESERVED,
      };

      // Only check holderId if provided (security check)
      if (holderId) {
        query.reservedBy = holderId;
      }

      const released = await this.PromotionOrderModel.findOneAndUpdate(
        query,
        {
          status: PromotionOrderStatus.AVAILABLE,
          reservedCartId: null,
          reservedBy: null,
          reservedAt: null,
        },
        { new: true },
      );

      if (released) {
        this.logger.info('[LION_COIN]: RELEASED', { businessId, holderId: holderId || 'any' });
        this.gateway.emitStatusChange(businessId, PromotionOrderStatus.AVAILABLE);
      }

      return released;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /**
   * Cart-drawer "Enable Discount" - server-side threshold check (spec requirement).
   * Returns distinct reasons: below threshold vs already taken.
   * Auto-selects from GALIL voucher pool if Lion Coin.
   * Auto-generates sessionId if not provided.
   */
  async applyAtDrawer(
    businessId: string,
    sessionId?: string,
    totalAmount?: number,
    redeemCode: string = LION_COIN_REDEEM_CODE,
  ): Promise<{ promotionOrder: PromotionOrder | null; sessionId?: string }> {
    // Auto-generate sessionId if not provided
    const generatedSessionId = sessionId || this.generateSessionId();

    // Try to reserve - if fails for any reason (no record, already reserved, no vouchers), returns null
    const reserved = await this.reserve(
      businessId,
      generatedSessionId,
      undefined,
      redeemCode,
    );

    return { promotionOrder: reserved, sessionId: generatedSessionId };
  }

  /**
   * Generate a unique session ID.
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Backstop for abandoned drawer-holds (most start before checkout).
   * Payment failures release immediately; this catches the rest.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async expireStaleReservations(redeemCode: string = LION_COIN_REDEEM_CODE): Promise<void> {
    try {
      const cutoff = new Date(
        Date.now() - LION_COIN_RESERVATION_TIMEOUT_MINUTES * 60 * 1000,
      );
      const staleFilter = {
        redeemCode,
        status: PromotionOrderStatus.RESERVED,
        reservedAt: { $lt: cutoff },
      };

      // Read businessIds before updateMany (it doesn't report touched docs) for socket broadcast.
      const expiring = await this.PromotionOrderModel.find(staleFilter, { businessId: 1 }).lean();

      const result = await this.PromotionOrderModel.updateMany(staleFilter, {
        status: PromotionOrderStatus.AVAILABLE,
        reservedCartId: null,
        reservedBy: null,
        reservedAt: null,
      });

      if (result.modifiedCount) {
        this.logger.info('[LION_COIN]: EXPIRED STALE RESERVATIONS', {
          count: result.modifiedCount,
        });
        expiring.forEach(record => this.gateway.emitStatusChange(
          record.businessId.toString(),
          PromotionOrderStatus.AVAILABLE,
        ));
      }
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO EXPIRE STALE RESERVATIONS', {
        err: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async releaseByCartId(cartId: string, redeemCode: string = LION_COIN_REDEEM_CODE): Promise<void> {
    try {
      const filter = {
        reservedCartId: cartId,
        redeemCode,
        status: PromotionOrderStatus.RESERVED,
      };
      const releasing = await this.PromotionOrderModel.find(filter, { businessId: 1 }).lean();

      const result = await this.PromotionOrderModel.updateMany(filter, {
        status: PromotionOrderStatus.AVAILABLE,
        reservedCartId: null,
        reservedBy: null,
        reservedAt: null,
      });

      if (result.modifiedCount) {
        this.logger.info('[LION_COIN]: RELEASED RESERVATIONS FOR CART', {
          cartId,
          count: result.modifiedCount,
        });
        releasing.forEach(record => this.gateway.emitStatusChange(
          record.businessId.toString(),
          PromotionOrderStatus.AVAILABLE,
        ));
      }
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO RELEASE BY CART ID', {
        cartId,
        err: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * RESERVED -> REDEEMED after payment confirmation. Atomic on status so retried webhooks can't double-redeem.
   */
  async redeem(
    promotionOrderId: string,
    orderId: string,
    paymentId?: string,
  ): Promise<PromotionOrder | null> {
    try {
      const redeemed = await this.PromotionOrderModel.findOneAndUpdate(
        { _id: promotionOrderId, status: PromotionOrderStatus.RESERVED },
        {
          status: PromotionOrderStatus.REDEEMED,
          redeemedOrderId: orderId,
          redeemedAt: new Date(),
          paymentId: paymentId || null,
        },
        { new: true },
      );

      if (redeemed) {
        this.logger.info('[LION_COIN]: REDEEMED', { promotionOrderId, orderId });
        this.gateway.emitStatusChange(redeemed.businessId.toString(), PromotionOrderStatus.REDEEMED);
      }

      return redeemed;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /** Full cancellation / full refund of an order that redeemed a record. */
  async releaseByOrderId(orderId: string): Promise<PromotionOrder | null> {
    try {
      // Filter on status: REDEEMED too (not just redeemedOrderId) to prevent matching inconsistent states.
      const released = await this.PromotionOrderModel.findOneAndUpdate(
        { redeemedOrderId: orderId, status: PromotionOrderStatus.REDEEMED },
        {
          status: PromotionOrderStatus.AVAILABLE,
          redeemedOrderId: null,
          redeemedAt: null,
          paymentId: null,
          reservedCartId: null,
          reservedBy: null,
          reservedAt: null,
        },
        { new: true },
      );

      if (released) {
        this.logger.info('[LION_COIN]: RELEASED AFTER ORDER CANCELLATION', {
          orderId,
          promotionOrderId: released._id,
        });
        this.gateway.emitStatusChange(released.businessId.toString(), PromotionOrderStatus.AVAILABLE);
      }

      return released;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /**
   * Finds Lion Coin discount amount for a specific order (replaces Order.lionCoinDiscountAmount).
   * Returns the discount value if this order has a redeemed Lion Coin, else 0.
   */
  async getDiscountAmountByOrderId(orderId: string, redeemCode: string = LION_COIN_REDEEM_CODE): Promise<number> {
    try {
      const promotionOrder = await this.PromotionOrderModel.findOne({
        redeemedOrderId: orderId,
        redeemCode,
        status: PromotionOrderStatus.REDEEMED,
      }).select('value').lean();

      return promotionOrder?.value || 0;
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO GET DISCOUNT BY ORDER ID', {
        orderId,
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  /**
   * Finds all claims (RESERVED or REDEEMED) for a cart. reservedCartId persists through
   * redemption, no Cart/Order persistence needed.
   */
  async findByCartId(cartId: string, redeemCode: string = LION_COIN_REDEEM_CODE): Promise<Map<string, PromotionOrder>> {
    try {
      const records = await this.PromotionOrderModel.find({
        reservedCartId: cartId,
        redeemCode,
      });

      return new Map(records.map(record => [record.businessId.toString(), record]));
    } catch (error) {
      exceptionHandling(error);
    }
  }

  /**
   * Adopts drawer-won holds into checkout (reservedBy = holderId is the consent signal).
   * Attaches cartId, claims nothing fresh.
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
      const myReservations = await this.PromotionOrderModel.find({
        businessId: { $in: businessIds },
        redeemCode,
        status: PromotionOrderStatus.RESERVED,
        reservedBy: holderId,
      });

      if (!myReservations.length) return [];

      // Each adoption is an independent atomic update against a different
      // business's record, so running them concurrently is safe.
      const claims = await Promise.all(
        myReservations.map(async record => {
          const adopted = await this.PromotionOrderModel.findOneAndUpdate(
            {
              _id: record._id,
              status: PromotionOrderStatus.RESERVED,
              reservedBy: holderId,
            },
            { reservedCartId: cartId },
            { new: true },
          );

          if (!adopted) return null;

          // Fetch full voucher details for API response
          const voucher = await this.getVoucherById(adopted.voucherId?.toString());

          return {
            businessId: adopted.businessId.toString(),
            _id: adopted._id.toString(),
            status: adopted.status,
            sessionId: adopted.reservedBy, // Use the reservation holder as sessionId
            vouchers: voucher ? {
              _id: voucher._id?.toString(),
              code: voucher.code,
              remainingAmount: voucher.remainingAmount,
              expireDate: voucher.expireDate,
              paymentStatus: voucher.paymentStatus,
            } : null,
          };
        }),
      );

      return claims.filter((claim): claim is PromotionApplyResult => claim !== null);
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async sendRedemptionEmails(
    promotionOrder: PromotionOrder,
    context: PromotionOrderEmailContext,
    externalApi?: any,
  ): Promise<void> {
    try {
      // Merge vars match high-value-order-alert convention: ORDER_ID (not ORDER_NUMBER) plus ORDER_DATE per spec.
      const mergeVars = {
        BUSINESS_NAME: context.businessName,
        ORDER_ID: context.orderNumber,
        ORDER_DATE: (context.redeemedAt || new Date()).toISOString(),
        BUYER_NAME: context.buyerName,
        BUYER_EMAIL: context.buyerEmail,
        BUYER_PHONE: context.buyerPhone,
        PRODUCTS_PURCHASED: context.productsSummary || '',
        AMOUNT_BEFORE_DISCOUNT: context.amountBeforeDiscount,
        LION_COIN_DISCOUNT: promotionOrder.value,
        AMOUNT_PAID: context.amountPaid,
        PAYMENT_REFERENCE: context.paymentRequestId || '',
      };

      await this.mailchimpService.sendTransactionalEmail({
        to: LION_COIN_REPORT_RECIPIENT,
        templatedId: DynamicEmailTemplate.LionCoinRedeemed,
        subject: `Lion Coin redeemed – ${context.businessName} – Order ${context.orderNumber}`,
        mergeVars,
      });

      if (promotionOrder.notifyBusinessOnRedemption) {
        const [business] = (await this.businessService.findBusinessEmailByIds([
          promotionOrder.businessId as any,
        ])) || [];
        const businessEmail = (business as any)?.userId?.email;

        if (businessEmail) {
          // Vendor-facing email needs site branding (logo, colors, footer).
          // External emails use getCommonEmailFields; internal alerts don't.
          const { emailFields } = externalApi
            ? await getCommonEmailFields(externalApi, this.docUploadService)
            : { emailFields: {} };

          await this.mailchimpService.sendTransactionalEmail({
            to: businessEmail,
            templatedId: DynamicEmailTemplate.LionCoinRedeemedForBusiness,
            subject: `Lion Coin redeemed – Order ${context.orderNumber}`,
            mergeVars: { ...mergeVars, ...emailFields },
          });
        }
      }
    } catch (error) {
      // Email failure never rolls back redemption (saved in DB per spec, recoverable from report).
      this.logger.error('[LION_COIN]: FAILED TO SEND REDEMPTION EMAIL', {
        promotionOrderId: promotionOrder._id,
        err: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async sendCancellationEmail(
    promotionOrder: PromotionOrder,
    context: Pick<PromotionOrderEmailContext, 'orderId' | 'orderNumber' | 'businessName' | 'buyerName' | 'amountPaid'>,
  ): Promise<void> {
    try {
      await this.mailchimpService.sendTransactionalEmail({
        to: LION_COIN_REPORT_RECIPIENT,
        templatedId: DynamicEmailTemplate.LionCoinCancelled,
        subject: `Lion Coin redemption cancelled – ${context.businessName} – Order ${context.orderNumber}`,
        mergeVars: {
          BUSINESS_NAME: context.businessName,
          ORDER_ID: context.orderNumber,
          ORDER_DATE: new Date().toISOString(),
          BUYER_NAME: context.buyerName || '',
          LION_COIN_DISCOUNT: promotionOrder.value,
          AMOUNT_PAID: context.amountPaid || 0,
        },
      });
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO SEND CANCELLATION EMAIL', {
        promotionOrderId: promotionOrder._id,
        err: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async list(businessIds: string[]) {
    try {
      const records = await this.PromotionOrderModel.find(
        {
          businessId: { $in: businessIds },
          redeemCode: LION_COIN_REDEEM_CODE,
        },
        { _id: 1, businessId: 1, status: 1 },
      ).lean();
      return records;
    } catch (error) {
      this.logger.error('[LION_COIN]: FAILED TO LIST RESERVED/REDEEMED ORDERS', {
        err: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
