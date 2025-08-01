import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { Trip } from '../../schema/trips.schema';
import { GetTripBySlugQuery } from '../get-trip-by-slug.query';

@QueryHandler(GetTripBySlugQuery)
export class GetTripBySlugHandler implements IQueryHandler<GetTripBySlugQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Trip.name)
    private readonly tripModel: Model<Trip>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetTripBySlugQuery): Promise<any> {
    try {
      const { slug, query } = queries;
      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        query.campCode,
      );

      if (!campDetails?.dmoIds?.length && !campDetails?.authorityIds?.length) {
        return {};
      }

      let findQuery: any = {
        slug,
      };

      const orConditions = [];

      if (campDetails?.dmoIds?.length) {
        orConditions.push({ dmoId: { $in: campDetails.dmoIds } });
      }

      if (campDetails?.authorityIds?.length) {
        orConditions.push({ authorityId: { $in: campDetails.authorityIds } });
      }

      if (orConditions.length) {
        findQuery = {
          ...findQuery,
          $or: orConditions,
        };
      }

      let populate;
      let select;

      if (query.isMap && /true/.test(query.isMap)) {
        populate = [
          {
            path: 'stations._id',
            select: 'name description primaryCategoryId geoLocation',
          },
        ];
        select = '_id name description slug stations';
      }

      if (!query.isMap || (query.isMap && /false/.test(query.isMap))) {
        populate = [
          {
            path: 'stations._id',
            select:
              'name description images logo groupTypesId accessibilitiesId primaryCategoryId bussCategoriesId bussSubCategoriesId geoLocation',
            populate: {
              path: 'groupTypesId accessibilitiesId primaryCategoryId bussCategoriesId bussSubCategoriesId',
              select: 'name hebrewName',
            },
          },
        ];

        select
          = '_id name description slug stations estimatedDuration totalDistanceCovered';
      }

      const trip = await this.tripModel
        .findOne(findQuery)
        .populate(populate)
        .select(select);
      if (!trip) {
        throw new NotFoundException(`Trips ${ServerErrors.NOT_FOUND}`);
      }

      const tripObj = trip.toObject();
      tripObj.stations.sort((a, b) => a.order - b.order);

      let groupTypesAndAccessibilitesMap = [];

      const stations = tripObj.stations.map((station: any) => {
        const stationData = station._id;

        const {
          groupTypesId = [],
          accessibilitiesId = [],
          ...rest
        } = stationData;

        groupTypesAndAccessibilitesMap = [
          ...groupTypesAndAccessibilitesMap,
          ...groupTypesId,
          ...accessibilitiesId,
        ];

        return {
          ...rest,
          _id: stationData._id,
          order: station.order,
          type: station.type,
        };
      });

      const uniqueByNameMap = new Map();

      groupTypesAndAccessibilitesMap.forEach(item => {
        if (!uniqueByNameMap.has(item.name)) {
          uniqueByNameMap.set(item.name, item);
        }
      });

      const groupTypesAndAccessibilities = Array.from(uniqueByNameMap.values());

      return {
        ...tripObj,
        stations,
        ...(query.isMap && /true/.test(query.isMap)
          ? {}
          : {
            groupTypesAndAccessibilities,
          }),
      };
    } catch (err) {
      this.logger.error('[EVENT]: FAILED TO FETCH Trip', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
