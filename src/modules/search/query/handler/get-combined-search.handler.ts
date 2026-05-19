import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetCombinedSearchQuery } from '../get-combined-search.query';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { EventsAudit } from 'src/modules/events/schema/events-audit.schema';

@QueryHandler(GetCombinedSearchQuery)
export class GetCombinedSearchHandler
implements IQueryHandler<GetCombinedSearchQuery> {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetCombinedSearchQuery): Promise<any> {
    try {
      const { search, campCode } = queries.query;
      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (
        !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return {
          totalData: 0,
          businesses: [],
          events: [],
        };
      }

      const businessBaseQuery: any = {
        status: CommonStatus.APPROVED,
        isActive: true,
        $and: [],
      };

      const productBaseQuery: any = {
        status: CommonStatus.APPROVED,
        isActive: true,
        $and: [],
      };

      const eventBaseQuery: any = {
        status: CommonStatus.APPROVED,
        isActive: true,
        $and: [],
      };

      const select
        = '_id name nameHe nameAr descriptionHe descriptionAr description images logo slug';

      const searchConditions = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];

      if (searchConditions.length) {
        businessBaseQuery.$and.push({ $or: searchConditions });
        productBaseQuery.$and.push({ $or: searchConditions });
        eventBaseQuery.$and.push({ $or: searchConditions });
      }

      const businessCampConditions = [
        ...(campDetails.businessIds?.length
          ? [{ businessId: { $in: campDetails.businessIds } }]
          : []),
        ...(campDetails.dmoIds?.length
          ? [{ dmoId: { $in: campDetails.dmoIds } }]
          : []),
        ...(campDetails.authorityIds?.length
          ? [{ authorityId: { $in: campDetails.authorityIds } }]
          : []),
      ];

      if (businessCampConditions.length) {
        businessBaseQuery.$and.push({ $or: businessCampConditions });
      }

      const productCampConditions = [
        ...(campDetails.businessIds?.length
          ? [{ businessId: { $in: campDetails.businessIds } }]
          : []),
        ...(campDetails.dmoIds?.length
          ? [{ dmoId: { $in: campDetails.dmoIds } }]
          : []),
        ...(campDetails.authorityIds?.length
          ? [{ authorityId: { $in: campDetails.authorityIds } }]
          : []),
        ...(campDetails.productIds?.length
          ? [{ productId: { $in: campDetails.productIds } }]
          : []),
      ];

      if (productCampConditions.length) {
        productBaseQuery.$and.push({ $or: productCampConditions });
      }

      const eventCampConditions = [
        ...(campDetails.dmoIds?.length
          ? [{ dmoId: { $in: campDetails.dmoIds } }]
          : []),
        ...(campDetails.authorityIds?.length
          ? [{ authorityId: { $in: campDetails.authorityIds } }]
          : []),
      ];

      if (eventCampConditions.length) {
        eventBaseQuery.$and.push({ $or: eventCampConditions });
      }

      const [businessResults, eventResults] = await Promise.all([
        this.BusinessesAuditModel.find(businessBaseQuery)
          .select(select)
          .limit(10)
          .lean(),
        this.EventsAuditModel.find(eventBaseQuery)
          .select(select)
          .limit(10)
          .lean(),

        // this.ProductModel.find(productBaseQuery)
        //   .select(select)
        //   .limit(10)
        //   .lean(),
      ]);

      return {
        businesses: businessResults,
        events: eventResults,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
