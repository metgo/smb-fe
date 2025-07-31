import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { paginateData } from 'src/common/pagination';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllTripsQuery } from '../get-all-trips.query';
import { Trip } from '../../schema/trips.schema';

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

    if (campDetails?.dmoIds?.length) {
      orConditionsDMO.push({ dmoId: { $in: campDetails.dmoIds } });
    }

    if (campDetails?.authorityIds?.length) {
      orConditionsDMO.push({ authorityId: { $in: campDetails.authorityIds } });
    }

    // Build base match query for Trips based on user role and filters
    const matchQuery: Record<string, any> = {
      ...((estimatedDurationMin || estimatedDurationMax) && {
        estimatedDuration: {
          ...(estimatedDurationMin && { $gte: Number(estimatedDurationMin) }),
          ...(estimatedDurationMax && { $lte: Number(estimatedDurationMax) }),
        },
      }),

      ...((totalDistanceCoveredMin || totalDistanceCoveredMax) && {
        totalDistanceCovered: {
          ...(totalDistanceCoveredMin && {
            $gte: Number(totalDistanceCoveredMin),
          }),
          ...(totalDistanceCoveredMax && {
            $lte: Number(totalDistanceCoveredMax),
          }),
        },
      }),

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
    const businessFilter: Record<string, any> = {};

    if (orConditions.length > 0) {
      businessFilter.$or = orConditions;
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
      Object.keys(businessFilter).length > 0
      && Object.keys(combinedSearchFilter).length > 0
    ) {
      combinedBusinessFilter = { $and: [businessFilter, combinedSearchFilter] };
    } else if (Object.keys(businessFilter).length > 0) {
      combinedBusinessFilter = businessFilter;
    } else if (Object.keys(combinedSearchFilter).length > 0) {
      combinedBusinessFilter = combinedSearchFilter;
    }

    const pipeline: any[] = [];

    pipeline.push({ $match: matchQuery });
    pipeline.push({
      $lookup: {
        from: 'businesses',
        localField: 'stations._id',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              image: {
                $let: {
                  vars: {
                    primaryImages: {
                      $filter: {
                        input: '$images',
                        as: 'img',
                        cond: { $eq: ['$$img.isPrimary', true] },
                      },
                    },
                  },
                  in: {
                    $cond: [
                      { $gt: [{ $size: '$$primaryImages' }, 0] },
                      { $arrayElemAt: ['$$primaryImages', 0] },
                      { $arrayElemAt: ['$images', 0] },
                    ],
                  },
                },
              },
              address: 1,
            },
          },
        ],
        as: 'stationImagesArray',
      },
    });

    if (Object.keys(combinedBusinessFilter).length > 0) {
      pipeline.push({ $unwind: '$stationDetails' });
      pipeline.push({ $match: combinedBusinessFilter });
      pipeline.push({
        $group: {
          _id: '$_id',
          doc: { $first: '$$ROOT' },
          stationDetails: { $push: '$stationDetails' },
        },
      });

      pipeline.push({
        $addFields: {
          'doc.stationDetails': '$stationDetails',
        },
      });

      pipeline.push({
        $replaceRoot: { newRoot: '$doc' },
      });
    }

    pipeline.push({
      $addFields: {
        images: {
          $filter: {
            input: {
              $map: {
                input: '$stationImagesArray',
                as: 'station',
                in: '$$station.image',
              },
            },
            as: 'img',
            cond: { $ne: ['$$img', null] },
          },
        },
        address: {
          $ifNull: [{ $arrayElemAt: ['$stationImagesArray.address', 0] }, null],
        },
      },
    });

    pipeline.push({
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' },
      },
    });

    pipeline.push({ $replaceRoot: { newRoot: '$doc' } });

    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        slug: 1,
        images: 1,
        address: 1,
      },
    });

    pipeline.push({
      $sort: { [sortBy || 'createdAt']: sortOrder === SortOrder.ASC ? 1 : -1 },
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
