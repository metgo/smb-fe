import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { VoucherPaymentStatus } from 'src/common/enum';
import {
  ForbiddenException,
  GoneException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentRequiredException } from 'src/common/exception/payment-required';
import { checkExpireDate } from 'src/common/expireDate';
import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';

import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { Voucher } from '../../schema/voucher.schema';
import { GetByCodeQuery } from '../get-by-code.query';
import { GetByCodeInterface } from '../../interface/get-by-code.handler';
import { ProductsService } from 'src/modules/products/products.services';

@QueryHandler(GetByCodeQuery)
export class GetByCodeHandler implements IQueryHandler<GetByCodeQuery> {
  constructor(
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
    private productService: ProductsService,
  ) {}

  async execute(queries: GetByCodeQuery): Promise<GetByCodeInterface> {
    try {
      const { queryData, code, loggedInUser } = queries;

      const { campCode, productId } = queryData;
      const findQuery: any = {
        code: code.trim(),
        isDeleted: false,
      };

      console.log(loggedInUser);

      const voucher = await this.VoucherModel.findOne(findQuery)
        .select('_id code remainingAmount expireDate paymentStatus campId')
        .populate<{ campId: Campaign }>(
          'campId',
          'code name dmoIds productIds businessIds',
        )
        .exec();

      if (!voucher) {
        throw new UnprocessableEntityException(ServerErrors.VOUCHER.NOT_FOUND);
      }

      const campDetails = voucher?.campId;

      if (campDetails?.code !== campCode) {
        throw new ForbiddenException(ServerErrors.VOUCHER.RESTRICTED_CAMPAIGN);
      }

      if (voucher.paymentStatus !== VoucherPaymentStatus.PAID) {
        throw new PaymentRequiredException(ServerErrors.VOUCHER.UNPAID);
      }

      if (voucher.expireDate) {
        const isAvailable = checkExpireDate(voucher.expireDate);

        if (!isAvailable) {
          throw new GoneException(ServerErrors.VOUCHER.EXPIRED);
        }
      }

      if (productId) {
        if (
          !campDetails?.productIds?.length
          && !campDetails?.businessIds?.length
          && !campDetails?.dmoIds?.length
        ) {
          throw new ForbiddenException(
            'This voucher cannot be used for this product',
          );
        }

        const productDetail = await this.productService.findOne(productId);

        if (
          !campDetails.dmoIds.includes(productDetail?.dmoId?._id)
          && !campDetails.businessIds.includes(productDetail?.businessId)
          && !campDetails.productIds.includes(productDetail?._id)
        ) {
          throw new ForbiddenException(
            'This voucher cannot be used for this product',
          );
        }
      }

      return {
        _id: voucher._id,
        code: voucher.code,
        remainingAmount: voucher.remainingAmount,
        expireDate: voucher.expireDate,
        paymentStatus: voucher.paymentStatus,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
