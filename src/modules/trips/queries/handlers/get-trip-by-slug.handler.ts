import { Logger } from 'winston';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { Trip } from '../../schema/trips.schema';
import { GetTripBySlugQuery } from '../get-trip-by-slug.query';
import { TripStatus } from '../../trips.types';

@QueryHandler(GetTripBySlugQuery)
export class GetTripBySlugHandler implements IQueryHandler<GetTripBySlugQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Trip.name)
    private readonly tripModel: Model<Trip>,
  ) {}

  async execute(queries: GetTripBySlugQuery): Promise<any> {
    try {
      const { slug, query } = queries;

      const findQuery: any = {
        slug,
        status: TripStatus.APPROVED,
      };

      let populate;
      let select;

      if (query.isMap) {
        populate = [
          {
            path: 'stations._id',
            select: 'name description primaryCategoryId geoLocation',
          },
        ];
        select = '_id name description shortDescription slug stations';
      } else {
        populate = [
          {
            path: 'stations._id',
            select:
              'name nameHe slug description descriptionHe images primaryCategoryId  geoLocation',
            populate: {
              path: 'primaryCategoryId',
              select: 'name hebrewName',
            },
          },
        ];
        select
          = '_id name description shortDescription contactDetails slug stations images itenary estimatedDuration totalDistanceCovered';
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

        if (!stationData) {
          return { order: station.order, type: station.type };
        }

        const {
          groupTypesId = [],
          accessibilitiesId = [],
          images = [],
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
          image: images[0]?.image ?? null,
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

      tripObj.itenary.sort((a, b) => {
        const toMinutes = (t: string) => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };

        return toMinutes(a.startTime) - toMinutes(b.startTime);
      });

      return {
        ...tripObj,
        stations,
        groupTypesAndAccessibilities,
        itenary: tripObj.itenary,
      };
    } catch (err) {
      this.logger.error('[EVENT]: FAILED TO FETCH Trip', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
