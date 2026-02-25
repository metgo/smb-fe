import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { BusinessStatus } from '../../../business.type';
import { GetBusinessDetailForMapTourismQuery } from '../get-business-detail-for-map.query';
import { ServerErrors } from 'src/common/constant';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { BusinessService } from 'src/modules/business/shared/services/business.service';

@QueryHandler(GetBusinessDetailForMapTourismQuery)
export class GetBusinessDetailForMapTourismHandler
implements IQueryHandler<GetBusinessDetailForMapTourismQuery> {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    private campaignService: CampaignService,
    private readonly businessService: BusinessService,
  ) {}

  async execute(queries: GetBusinessDetailForMapTourismQuery): Promise<any> {
    try {
      const { id, query } = queries;

      const select
        = '_id name nameHe nameAr descriptionHe descriptionAr description images logo primaryCategoryId dmoId authorityId slug businessId';

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        query.campCode,
      );

      if (
        !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return {};
      }

      try {
        const business = await this.BusinessesAuditModel.findOne({
          businessId: id,
          status: BusinessStatus.APPROVED,
          isActive: true,
        })
          .select(select)
          .lean();

        if (!business) {
          throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
        }

        const { businessId, ...rest } = business;

        if (
          !campDetails.dmoIds.includes(
            new mongoose.Types.ObjectId(business.dmoId),
          )
          && !campDetails.authorityIds.includes(
            new mongoose.Types.ObjectId(business?.authorityId),
          )
          && !campDetails.businessIds.includes(
            new mongoose.Types.ObjectId(businessId),
          )
        ) {
          throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
        }

        const mappedData = {
          ...rest,
          _id: businessId,
        };

        const response = await this.businessService.localizeBusiness(
          mappedData,
          query.locale,
        );

        return response;
      } catch (error) {
        if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
          throw new BadRequestException(
            `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
          );
        }
        exceptionHandling(error);
      }
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
