import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetTripsByBusinessIdQuery } from '../get-trips-by-business-id.query';
import { Trip } from '../../schema/trips.schema';

@QueryHandler(GetTripsByBusinessIdQuery)
export class GetTripsByBusinessIdHandler implements IQueryHandler<GetTripsByBusinessIdQuery> {
  constructor(
    @InjectModel(Trip.name)
    private readonly tripModel: Model<Trip>,
  ) {}

  async execute(query: GetTripsByBusinessIdQuery) {
    try {
      const { businessId, query: queryParams } = query;

      const select
        = 'name shortDescription slug images estimatedDuration stations totalDistanceCovered status';

      const findQuery = {
        stations: {
          $elemMatch: {
            _id: new mongoose.Types.ObjectId(businessId),
          },
        },
        status: 'APPROVED',
        isDeleted: { $ne: true },
      };

      const tripsList = await queryhandler<Trip>(
        this.tripModel,
        {
          findQuery,
          select,
          sort: 'createdAt',
          sortOrder: SortOrder.DESC,
          isLean: true,
          page: queryParams?.page,
          limit: queryParams?.limit,
        },
      );

      if (!tripsList?.data || !tripsList.data?.length) {
        return { totalData: 0, data: [] };
      }

      const formattedTrips = tripsList.data.map((trip: any) => ({
        name: trip.name,
        shortDescription: trip.shortDescription,
        slug: trip.slug,
        image: trip.images?.find((img: any) => img.isPrimary)?.image || null,
        estimatedDuration: trip.estimatedDuration,
        noOfStations: trip.stations?.length || 0,
        totalDistanceCovered: trip.totalDistanceCovered,
      }));

      return {
        data: formattedTrips,
        totalData: tripsList.totalData,
        meta: tripsList.meta,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
