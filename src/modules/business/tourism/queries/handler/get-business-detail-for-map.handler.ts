import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { Business } from '../../../shared/schema/business.schema';
import { BusinessStatus } from '../../../business.type';
import { GetBusinessDetailForMapTourismQuery } from '../get-business-detail-for-map.query';
import { ServerErrors } from 'src/common/constant';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CampaignService } from 'src/modules/campaign/campaign.service';

@QueryHandler(GetBusinessDetailForMapTourismQuery)
export class GetBusinessDetailForMapTourismHandler
implements IQueryHandler<GetBusinessDetailForMapTourismQuery> {
  constructor(
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetBusinessDetailForMapTourismQuery): Promise<any> {
    try {
      const { id, query } = queries;

      const select = '_id name description images logo primaryCategoryId dmoId authorityId';

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
        const business = await this.BusinessModel.findOne({
          _id: id,
          status: BusinessStatus.APPROVED,
        }).select(select);

        if (!business) {
          throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
        }

        if (
          !campDetails.dmoIds.includes(
            new mongoose.Types.ObjectId(business.dmoId),
          )
          && !campDetails.authorityIds.includes(
            new mongoose.Types.ObjectId(business?.authorityId),
          )
          && !campDetails.businessIds.includes(
            new mongoose.Types.ObjectId(business?._id),
          )
        ) {
          throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
        }

        return business;
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
