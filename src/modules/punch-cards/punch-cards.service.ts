import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { PunchCardStatus } from './punch-cards.type';
import { PunchCard } from './schema/punch-card.schema';
import { PunchPass } from '../punch-passes/schema/punch-pass.schema';
import { exceptionHandling } from 'src/common/utils/exception-handling';

export interface CreatePunchCardInput {
  punchPass: PunchPass;
  orderProductId: string;
  businessId: string;
  userId?: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class PunchCardsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(PunchCard.name)
    private PunchCardModel: Model<PunchCard>,
  ) {}

  // One card per purchased unit - call once per unit, never once per order
  // line with quantity > 1 (a card = a wallet pass, quantity must fan out
  // the same way tickets fan out to one OrderProduct per unit).
  async create(input: CreatePunchCardInput): Promise<PunchCard> {
    try {
      const {
        punchPass, orderProductId, businessId, userId, email, phone,
      }
        = input;

      const cardNumber = `PP-${new Date().getFullYear()}-${randomUUID()
        .replace(/-/g, '')
        .slice(0, 8)
        .toUpperCase()}`;

      const redemptionToken = randomUUID();

      // Each catalogue row's own quantity (default 1 if uncapped) becomes
      // that item's redeemable count - totalItems is the SUM of those, not
      // just the number of catalogue rows (a "Yoga Class" x6 row counts as 6).
      const items = (punchPass.catalogues || []).map((catalogue: any) => ({
        name: catalogue.name,
        nameHe: catalogue.nameHe,
        nameAr: catalogue.nameAr,
        type: catalogue.type,
        quantity: catalogue.quantity || 1,
        usedCount: 0,
      }));
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

      // PunchPass.expiryDate is a duration in months (default 60), not a
      // calendar date - see the field comment in the PunchPass schema.
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + (punchPass.expiryDate || 60));

      const punchCard = new this.PunchCardModel({
        cardNumber,
        punchPassId: punchPass._id,
        orderProductId,
        businessId,
        userId: userId || null,
        email: email || null,
        phone: phone || null,
        totalItems,
        usedItems: 0,
        remainingItems: totalItems,
        items,
        redemptionToken,
        validUntil,
        status: PunchCardStatus.ACTIVE,
      });

      const created = await punchCard.save();

      this.logger.info('[PUNCH-CARD]: CREATED', {
        punchCardId: created._id,
        cardNumber: created.cardNumber,
        orderProductId,
      });

      return created;
    } catch (err) {
      this.logger.error('[PUNCH-CARD]: FAILED TO CREATE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async setGoogleWalletPass(
    punchCardId: Types.ObjectId | string,
    walletGoogleObjectId: string,
    walletGoogleSaveUrl: string,
  ): Promise<void> {
    await this.PunchCardModel.updateOne(
      { _id: punchCardId },
      { $set: { walletGoogleObjectId, walletGoogleSaveUrl } },
    );
  }

  // Used by the /order-confirmation page to find the cards issued for a
  // punch-pass order - one PunchCard per unit, linked via orderProductId.
  async findByOrderProductIds(orderProductIds: (Types.ObjectId | string)[]): Promise<PunchCard[]> {
    if (!orderProductIds.length) return [];
    return this.PunchCardModel.find({
      orderProductId: { $in: orderProductIds.map(id => id.toString()) },
    }).lean();
  }
}
