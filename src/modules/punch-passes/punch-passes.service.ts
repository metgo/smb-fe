import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { PunchPass } from './schema/punch-pass.schema';

@Injectable()
export class PunchPassesService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(PunchPass.name)
    private PunchPassModel: Model<PunchPass>,
  ) {}

  async deductQuantity(punchPasses: { id: string; quantity: number }[]) {
    try {
      const punchPassBulkOps = punchPasses.map(punchPass => ({
        updateOne: {
          filter: {
            _id: new mongoose.Types.ObjectId(punchPass.id),
            'quantity.initial': { $exists: true },
          },
          // Pipeline update so `remaining` is always DERIVED, never blindly
          // decremented:
          //   sold      += purchased qty  (always reflects reality)
          //   remaining  = max(0, initial - sold)  (never goes negative,
          //               stays consistent with initial even if it was stale)
          // Unlimited punch passes have no real cap, so remaining is 0 -
          // same invariant enforced on create/update.
          update: [
            {
              $set: {
                'quantity.sold': {
                  $add: [
                    { $ifNull: ['$quantity.sold', 0] },
                    punchPass.quantity,
                  ],
                },
              },
            },
            {
              $set: {
                'quantity.remaining': {
                  $cond: [
                    { $eq: ['$quantity.isUnlimited', true] },
                    0,
                    {
                      $max: [
                        0,
                        {
                          $subtract: [
                            { $ifNull: ['$quantity.initial', 0] },
                            '$quantity.sold',
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      }));

      await this.PunchPassModel.bulkWrite(punchPassBulkOps);

      this.logger.info(
        '[DEDUCT PUNCH PASS QUANTITY]: Successfully deducted quantity',
        {
          punchPassCount: punchPasses.length,
        },
      );
    } catch (error) {
      this.logger.error(
        '[DEDUCT PUNCH PASS QUANTITY]: Failed to deduct quantity',
        {
          err: error.message,
          punchPassCount: punchPasses.length,
        },
      );
      throw error;
    }
  }
}
