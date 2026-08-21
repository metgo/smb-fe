import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  CampaignStatus,
  CommonStatus,
  VoucherPaymentStatus,
} from 'src/common/enum';
import { GoneException, UnprocessableEntityException } from '@nestjs/common';
import { PaymentRequiredException } from 'src/common/exception/payment-required';
import { checkExpireDate } from 'src/common/expireDate';
import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';

import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { GetProductsByCampaignQuery } from '../get-products-by-campaign.query';
import { GetProductsByCampaignResponse } from 'src/modules/campaign/response/get-products-by-campaign.response';
import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';

@QueryHandler(GetProductsByCampaignQuery)
export class GetProductsByCampaignHandler
implements IQueryHandler<GetProductsByCampaignQuery> {
  constructor(
    @InjectModel(Campaign.name)
    private readonly CampaignModel: Model<Campaign>,
    @InjectModel(Voucher.name)
    private readonly VoucherModel: Model<Voucher>,
    @InjectModel(ProductsAudit.name)
    private readonly ProductsAuditModel: Model<ProductsAudit>,
  ) {}

  async execute(
    queries: GetProductsByCampaignQuery,
  ): Promise<GetProductsByCampaignResponse> {
    try {
      const { queryData, campCode, loggedInUser } = queries;

      const {
        customerEmail, page, limit, voucherId, locale,
      } = queryData;

      const campaignDetail = await this.CampaignModel.findOne({
        code: campCode,
        status: CampaignStatus.ACTIVE,
        $and: [
          {
            $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
          },
          {
            $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
          },
          {
            $or: [{ deletedBy: null }, { deletedBy: { $exists: false } }],
          },
        ],
      });

      console.log(loggedInUser);

      const orConditions: any[] = [];

      if (campaignDetail?.productIds?.length) {
        orConditions.push({ productId: { $in: campaignDetail.productIds } });
      }
      if (campaignDetail?.businessIds?.length) {
        orConditions.push({ businessId: { $in: campaignDetail.businessIds } });
      }
      if (campaignDetail?.dmoIds?.length) {
        orConditions.push({ dmoId: { $in: campaignDetail.dmoIds } });
      }
      if ((campaignDetail as any)?.authorityIds?.length) {
        orConditions.push({
          authorityId: { $in: (campaignDetail as any).authorityIds },
        });
      }

      let productsList: any[] = [];

      if (orConditions.length) {
        const findQuery: any = {
          status: CommonStatus.APPROVED,
          isActive: true,
          isDeleted: { $ne: true },
          $and: [
            {
              $or: [
                { 'quantity.remaining': { $gt: 0 } },
                { 'quantity.isUnlimited': true },
              ],
            },
            { $or: orConditions },
          ],
        };

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const raw = await this.ProductsAuditModel.find(findQuery)
          .select(
            '_id productId name description images price nameHe nameAr descriptionHe descriptionAr slug',
          )
          .populate({
            path: 'businessId',
            select:
              '_id logo name nameHe nameAr slug geoLocation vendorDelivers vendorDeliveryArea globalDelivery globalDeliveryArea',
          })
          .skip(skip)
          .limit(limitNum)
          .lean()
          .exec();

        productsList = raw.map(({ _id, productId, ...rest }: any) => ({
          ...rest,
          _id: productId,
        }));
      }

      if (voucherId) {
        const findQuery: any = {
          _id: voucherId,
          isDeleted: { $ne: true },
        };
        const voucher = await this.VoucherModel.findOne(findQuery)
          .select(
            '_id remainingAmount expireDate paymentStatus campId assigneeInfo',
          )
          .populate<{ campId: Campaign }>(
            'campId',
            'code name dmoIds productIds businessIds miniSite companyInfo type status',
          )
          .exec();

        if (!voucher) {
          throw new UnprocessableEntityException(
            ServerErrors.VOUCHER.NOT_FOUND,
          );
        }

        if (voucher.assigneeInfo.email !== customerEmail) {
          throw new UnprocessableEntityException(
            ServerErrors.VOUCHER.NOT_FOUND,
          );
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

        return new GetProductsByCampaignResponse(
          productsList,
          campaignDetail,
          voucher,
          locale,
        );
      }

      return new GetProductsByCampaignResponse(
        productsList,
        campaignDetail,
        undefined,
        locale,
      );
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
