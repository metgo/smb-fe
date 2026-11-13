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
import { CampaignType } from 'src/modules/campaign/campaign.type';
import { Voucher } from '../../schema/voucher.schema';
import { GetByCodeQuery } from '../get-by-code.query';
import { ProductsService } from 'src/modules/products/products.services';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { GetByCodeResponse } from '../../responses/get-by-code.response';

@QueryHandler(GetByCodeQuery)
export class GetByCodeHandler implements IQueryHandler<GetByCodeQuery> {
  constructor(
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
    private productService: ProductsService,
    private externalApiService: ExternalApiServices,
  ) {}

  async execute(queries: GetByCodeQuery): Promise<GetByCodeResponse> {
    try {
      const { queryData, code } = queries;

      const { identifierId, productId, locale } = queryData;
      const findQuery: any = {
        code: code.trim(),
        isDeleted: { $ne: true },
      };

      const [voucher, externalApi] = await Promise.all([
        this.VoucherModel.findOne(findQuery)
          .select(
            '_id code remainingAmount purchaserInfo assigneeInfo creatorInfo expireDate paymentStatus campId createdAt',
          )
          .populate<{ campId: Campaign }>(
            'campId',
            'code name type dmoIds productIds businessIds',
          )
          .populate('purchaserInfo.id', 'firstName lastName email')
          .populate('assigneeInfo.id', 'firstName lastName email')
          .populate('creatorInfo.id', 'firstName lastName email')
          .exec(),
        this.externalApiService.findByFieldName('identifierId', identifierId),
      ]);

      if (!voucher) {
        throw new UnprocessableEntityException(ServerErrors.VOUCHER.NOT_FOUND);
      }

      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.EXTERNAL_API.IDENTIFIER_ID);
      }

      const campDetails = voucher?.campId;

      const isAllowed = externalApi?.campIds.some(campId => campId.equals(campDetails._id));

      if (!isAllowed) {
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

      // This per-product/business/dmo scoping lives on the campaign document
      // and predates website-level scoping (checked above via campIds). It
      // still applies to MINI_SITE campaigns; CASH_IN/CASH_BACK vouchers are
      // already fully scoped by the campIds check above.
      if (productId && campDetails?.type === CampaignType.MINI_SITE) {
        if (
          !campDetails?.productIds?.length
          && !campDetails?.businessIds?.length
          && !campDetails?.dmoIds?.length
        ) {
          throw new ForbiddenException(
            'This voucher cannot be used for this product',
          );
        }

        const productDetail = await this.productService.findOne(
          productId,
          locale,
        );

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
        purchaser:
          ((voucher.purchaserInfo?.id as any)?.firstName
            && `${(voucher.purchaserInfo.id as any).firstName} ${
              (voucher.purchaserInfo.id as any).lastName
            }`.trim())
          || (voucher.purchaserInfo?.id as any)?.email
          || voucher.purchaserInfo?.name
          || voucher.purchaserInfo?.email
          || ((voucher.creatorInfo?.id as any)?.firstName
            && `${(voucher.creatorInfo.id as any).firstName} ${
              (voucher.creatorInfo.id as any).lastName
            }`.trim())
          || (voucher.creatorInfo?.id as any)?.email
          || voucher.creatorInfo?.name
          || voucher.creatorInfo?.email
          || null,
        assignee:
          ((voucher.assigneeInfo?.id as any)?.firstName
            && `${(voucher.assigneeInfo.id as any).firstName} ${
              (voucher.assigneeInfo.id as any).lastName
            }`.trim())
          || (voucher.assigneeInfo?.id as any)?.email
          || voucher.assigneeInfo?.name
          || voucher.assigneeInfo?.email
          || null,
        createdAt: voucher.createdAt,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
