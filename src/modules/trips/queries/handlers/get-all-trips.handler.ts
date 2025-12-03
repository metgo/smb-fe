import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { paginateData } from 'src/common/pagination';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllTripsQuery } from '../get-all-trips.query';
import { Trip } from '../../schema/trips.schema';
import { TripStatus } from '../../trips.types';

@QueryHandler(GetAllTripsQuery)
export class GetAllTripsHandler implements IQueryHandler<GetAllTripsQuery> {
  constructor(
    @InjectModel(Trip.name)
    private readonly tripModel: Model<Trip>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetAllTripsQuery) {
    const toObjectIdArray = (ids: string | string[]) => {
      if (!ids) return [];
      if (Array.isArray(ids)) {
        return ids.map(id => new mongoose.Types.ObjectId(id));
      }
      return [new mongoose.Types.ObjectId(ids)];
    };

    const { query } = queries;

    const {
      campCode,
      groupTypesId,
      accessibilitiesId,
      bussCategoriesId,
      bussSubCategoriesId,
      sortOrder,
      sortBy,
      estimatedDurationMin,
      estimatedDurationMax,
      totalDistanceCoveredMin,
      totalDistanceCoveredMax,
      search,
      page,
      limit,
      isTrip,
    } = query;

    const campDetails = await this.campaignService.findCampaignAndReturn(
      'code',
      campCode,
    );

    if (!campDetails?.dmoIds?.length && !campDetails?.authorityIds?.length) {
      return {
        totalData: 0,
        data: [],
      };
    }

    const orConditionsDMO = [];

    if (campDetails.dmoIds?.length) {
      orConditionsDMO.push({ dmoId: { $in: campDetails.dmoIds } });
    }

    if (campDetails.authorityIds?.length) {
      orConditionsDMO.push({
        authorityId: { $in: campDetails.authorityIds },
      });
    }

    const matchQuery: Record<string, any> = {
      status: TripStatus.APPROVED,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      ...(isTrip !== undefined && { isTrip }),

      ...(estimatedDurationMin || estimatedDurationMax
        ? {
          estimatedDuration: {
            ...(estimatedDurationMin && {
              $gte: Number(estimatedDurationMin),
            }),
            ...(estimatedDurationMax && {
              $lte: Number(estimatedDurationMax),
            }),
          },
        }
        : {}),

      ...(totalDistanceCoveredMin || totalDistanceCoveredMax
        ? {
          totalDistanceCovered: {
            ...(totalDistanceCoveredMin && {
              $gte: Number(totalDistanceCoveredMin),
            }),
            ...(totalDistanceCoveredMax && {
              $lte: Number(totalDistanceCoveredMax),
            }),
          },
        }
        : {}),

      ...(orConditionsDMO.length > 0 && { $or: orConditionsDMO }),
    };

    const orConditions: Record<string, any>[] = [];

    if (groupTypesId) {
      orConditions.push({
        'stationBusinesses.groupTypesId': {
          $in: toObjectIdArray(groupTypesId),
        },
      });
    }

    if (accessibilitiesId) {
      orConditions.push({
        'stationBusinesses.accessibilitiesId': {
          $in: toObjectIdArray(accessibilitiesId),
        },
      });
    }

    if (bussCategoriesId) {
      orConditions.push({
        'stationBusinesses.bussCategoriesId': {
          $in: toObjectIdArray(bussCategoriesId),
        },
      });
    }

    if (bussSubCategoriesId) {
      orConditions.push({
        'stationBusinesses.bussSubCategoriesId': {
          $in: toObjectIdArray(bussSubCategoriesId),
        },
      });
    }

    let combinedBusinessFilter: Record<string, any> = {};
    if (orConditions.length > 0) {
      combinedBusinessFilter.$or = orConditions;
    }

    let combinedSearchFilter: Record<string, any> = {};

    if (search) {
      combinedSearchFilter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'stationBusinesses.name': { $regex: search, $options: 'i' } },
          {
            'stationBusinesses.description': { $regex: search, $options: 'i' },
          },
        ],
      };
    }

    if (
      Object.keys(combinedBusinessFilter).length > 0
      && Object.keys(combinedSearchFilter).length > 0
    ) {
      combinedBusinessFilter = {
        $and: [combinedBusinessFilter, combinedSearchFilter],
      };
    } else if (Object.keys(combinedSearchFilter).length > 0) {
      combinedBusinessFilter = combinedSearchFilter;
    }

    const pipeline: any[] = [];

    pipeline.push({ $match: matchQuery });

    if (Object.keys(combinedBusinessFilter).length > 0) {
      pipeline.push({ $match: combinedBusinessFilter });
    }

    pipeline.push({
      $lookup: {
        from: 'businesses',
        localField: 'stations._id',
        foreignField: '_id',
        as: 'stationBusinessesAddress',
        pipeline: [
          {
            $project: {
              address: 1,
            },
          },
        ],
      },
    });

    pipeline.push({
      $addFields: {
        address: {
          $ifNull: [
            { $arrayElemAt: ['$stationBusinessesAddress.address', 0] },
            null,
          ],
        },
      },
    });

    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        shortDescription: 1,
        slug: 1,
        images: 1,
        address: 1,
        createdAt: 1,
      },
    });

    pipeline.push({
      $sort: {
        [sortBy || 'createdAt']: sortOrder === SortOrder.ASC ? 1 : -1,
      },
    });

    const allTrips = await this.tripModel.aggregate(pipeline).exec();

    const allPaginatedTrips = paginateData(
      Number(page),
      Number(limit),
      allTrips,
    );
    return allPaginatedTrips;
  }
}
