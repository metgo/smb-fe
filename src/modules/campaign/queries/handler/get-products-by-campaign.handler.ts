import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CampaignStatus, VoucherPaymentStatus } from 'src/common/enum';
import { GoneException, UnprocessableEntityException } from '@nestjs/common';
import { PaymentRequiredException } from 'src/common/exception/payment-required';
import { checkExpireDate } from 'src/common/expireDate';
import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';

import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { GetProductsByCampaignQuery } from '../get-products-by-campaign.query';
import { GetAllProductsQuery } from 'src/modules/products/queries';
import { GetAllProductsRequest } from 'src/modules/products/requests/get-all-products.query';
import { GetProductsByCampaignResponse } from 'src/modules/campaign/response/get-products-by-campaign.response';
import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';

@QueryHandler(GetProductsByCampaignQuery)
export class GetProductsByCampaignHandler
implements IQueryHandler<GetProductsByCampaignQuery> {
  constructor(
    @InjectModel(Campaign.name)
    private readonly CampaignModel: Model<Campaign>,
    @InjectModel(Voucher.name)
    private readonly VoucherModel: Model<Voucher>,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    queries: GetProductsByCampaignQuery,
  ): Promise<GetProductsByCampaignResponse> {
    try {
      const { queryData, campCode, loggedInUser } = queries;

      const {
        customerEmail, page, limit, voucherId,
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

      const productsQuery = new GetAllProductsRequest();
      productsQuery.campCode = campCode;

      if (page) productsQuery.page = page;
      if (limit) productsQuery.limit = limit;
      const customSelect = '_id productId name description images price';

      const products = await this.queryBus.execute(
        new GetAllProductsQuery(productsQuery, customSelect),
      );

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
          products.data,
          campaignDetail,
          voucher,
        );
      }

      return new GetProductsByCampaignResponse(products.data, campaignDetail);
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
