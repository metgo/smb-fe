import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetPunchPassByIdQuery } from '../get-punch-pass-by-id.query';
import { PunchPass } from '../../schema/punch-pass.schema';

@QueryHandler(GetPunchPassByIdQuery)
export class GetPunchPassByIdHandler
implements IQueryHandler<GetPunchPassByIdQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(PunchPass.name)
    private PunchPassModel: Model<PunchPass>,
  ) {}

  async execute(queries: GetPunchPassByIdQuery): Promise<PunchPass> {
    try {
      const { id, checkout } = queries;

      const punchPass = await this.PunchPassModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        status: CommonStatus.APPROVED,
        isDeleted: { $ne: true },
      });

      if (!punchPass) {
        throw new NotFoundException(`Punch Pass ${ServerErrors.NOT_FOUND}`);
      }

      // If checkout flag is true, return only specific fields
      if (checkout) {
        const primaryImage = punchPass.images?.find((img: any) => img.isPrimary) || punchPass.images?.[0];
        const checkoutResponse: any = {
          _id: punchPass._id,
          name: punchPass.name,
          image: primaryImage?.image || null,
          alt: primaryImage?.alt || null,
          sellingPrice: punchPass.price?.sellingPrice || 0,
        };

        // Only include deliveryArea if it exists and has items
        if (punchPass.deliveryArea && punchPass.deliveryArea?.length > 0) {
          checkoutResponse.deliveryArea = punchPass.deliveryArea;
        }

        return checkoutResponse;
      }

      return punchPass;
    } catch (err) {
      this.logger.error('[PUNCH-PASS]: FAILED TO FETCH PUNCH PASS', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
