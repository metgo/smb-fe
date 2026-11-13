/* eslint-disable no-restricted-syntax */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  Business,
  BusinessDocument,
} from 'src/modules/business/shared/schema/business.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import {
  ExternalApi,
  ExternalApiDocument,
} from 'src/modules/external-api/schema/external-api.schema';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';
import { GoogleAnalyticsService } from 'src/services/google-analytics/ga.services';
import { GetSiteStatsQuery } from '../get-site-stats.query';

@QueryHandler(GetSiteStatsQuery)
export class GetSiteStatsHandler implements IQueryHandler<GetSiteStatsQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApiDocument>,
    @InjectModel(Campaign.name)
    private readonly CampaignModel: Model<Campaign>,
    @InjectModel(Voucher.name)
    private readonly VoucherModel: Model<Voucher>,
    @InjectModel(Business.name)
    private readonly BusinessModel: Model<BusinessDocument>,
    @InjectModel(Order.name)
    private readonly OrderModel: Model<Order>,
    private readonly googleAnalyticsService: GoogleAnalyticsService,
  ) {}

  async execute(query: GetSiteStatsQuery) {
    const { identifierId } = query;
    try {
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId,
      }).lean();

      if (!externalApi) {
        return {
          visitorsLastMonth: 0,
          vouchersSold: 0,
          activeBusiness: 0,
          transferredToBusinessTotal: 0,
        };
      }

      const campIds = externalApi.campIds ?? [];
      const primaryCampIds = externalApi.primaryCampIds ?? [];

      const [
        visitorsLastMonth,
        vouchersSold,
        campaigns,
        transferredToBusinessTotal,
      ] = await Promise.all([
        // 1. GA visitors in last 30 days via the site's gaPropertyId
        externalApi.googleAnalyticsId
          ? this.googleAnalyticsService.activeUsersLastMonth(
            externalApi.googleAnalyticsId,
          )
          : Promise.resolve(0),

        // 2. Vouchers created under primaryCampIds
        primaryCampIds.length > 0
          ? this.VoucherModel.countDocuments({
            campId: { $in: primaryCampIds },
          })
          : Promise.resolve(0),

        // 3. Campaigns for campIds → extract dmoIds + authorityIds
        campIds.length > 0
          ? this.CampaignModel.find(
            { _id: { $in: campIds } },
            { dmoIds: 1, authorityIds: 1 },
          ).lean()
          : Promise.resolve([]),

        // 4. Total order amounts where campId in campIds
        campIds.length > 0
          ? this.OrderModel.aggregate([
            { $match: { campId: { $in: campIds } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ]).then(res => res[0]?.total ?? 0)
          : Promise.resolve(0),
      ]);

      // Collect unique dmoIds and authorityIds from the campaigns
      const dmoIds: string[] = [];
      const authorityIds: string[] = [];
      for (const camp of campaigns) {
        for (const id of camp.dmoIds ?? []) dmoIds.push(id.toString());
        for (const id of camp.authorityIds ?? []) authorityIds.push(id.toString());
      }

      // 3b. Count approved businesses linked to those dmoIds / authorityIds
      const activeBusiness
        = dmoIds.length > 0 || authorityIds.length > 0
          ? await this.BusinessModel.countDocuments({
            $or: [
              ...(dmoIds.length > 0 ? [{ dmoId: { $in: dmoIds } }] : []),
              ...(authorityIds.length > 0
                ? [{ authorityId: { $in: authorityIds } }]
                : []),
            ],
            status: CommonStatus.APPROVED,
          })
          : 0;

      return {
        visitorsLastMonth,
        vouchersSold,
        activeBusiness,
        transferredToBusinessTotal,
      };
    } catch (err) {
      this.logger.error(
        `[EXTERNAL_API]: FAILED TO GET SITE STATS FOR identifierId='${identifierId}'`,
        { err: err.message },
      );
      exceptionHandling(err);
    }
  }
}
