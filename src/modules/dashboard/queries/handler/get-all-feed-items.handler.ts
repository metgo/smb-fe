import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { shuffleArray } from 'src/common/utils/shuffle';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllFeedItemsQuery } from '../get-all-feed-items.query';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { ServicesTypes } from '../../dashboard.type';
import { Event } from 'src/modules/events/schema/events.schema';
import { Trip } from 'src/modules/trips/schema/trips.schema';
import { GetAllFeedItemResponse } from '../../response/get-all-feed-Items.response';
import { GetBusinessRawQuery } from '../get-business-raw-query.query';
import { GetEventRawQuery } from '../get-event-raw-query.query';
import { GetTripRawQuery } from '../get-trip-raw-query.query';
import { GetPOIRawQuery } from '../get-poi-raw-query.query';

@QueryHandler(GetAllFeedItemsQuery)
export class GetAllFeedItemsHandler
implements IQueryHandler<GetAllFeedItemsQuery> {
  constructor(
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    @InjectModel(Event.name)
    private EventModel: Model<Event>,
    @InjectModel(Trip.name)
    private TripModel: Model<Trip>,
    private campaignService: CampaignService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(queries: GetAllFeedItemsQuery): Promise<GetAllFeedItemResponse> {
    try {
      const {
        campCode,
        serviceType,
        page,
        limit,
        categoriesId,
        subCategoriesId,
        accessibilitiesId,
        groupTypesId,
      } = queries;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      let business: any;
      let poi: any;
      let tripAndFunday;
      let event;

      // eslint-disable-next-line no-nested-ternary
      const finalServiceType = serviceType
        ? Array.isArray(serviceType)
          ? serviceType
          : [serviceType]
        : [];

      const hasBusinessSpecificFilters
        = !!categoriesId
        || !!subCategoriesId
        || !!accessibilitiesId
        || !!groupTypesId;

      if (hasBusinessSpecificFilters) {
        if (!finalServiceType.includes(ServicesTypes.BUSINESS)) {
          finalServiceType.push(ServicesTypes.BUSINESS);
        }
      }

      const hasServiceFilter
        = Array.isArray(finalServiceType) && finalServiceType.length > 0;

      const wantsBusiness
        = !hasServiceFilter || finalServiceType.includes(ServicesTypes.BUSINESS);

      const wantsPOI
        = !hasServiceFilter
        || finalServiceType.includes(ServicesTypes.POINT_OF_INTEREST);

      const wantsEvents
        = !hasServiceFilter || finalServiceType.includes(ServicesTypes.EVENT);

      const wantsTripsOrFunday
        = !hasServiceFilter
        || finalServiceType.some(t => [ServicesTypes.TRIPS, ServicesTypes.FUNDAY].includes(t));

      let noOfServiceType: number = 0;

      const numberedPage = Number(page);
      const numberedLimit = Number(limit);
      if (numberedPage && numberedLimit) {
        noOfServiceType = Math.floor(numberedLimit / (finalServiceType?.length || 5));
      }

      if (wantsBusiness) {
        business = await this.getBusinesses(queries, campDetails, numberedPage, noOfServiceType);
      }

      if (wantsPOI) {
        poi = await this.getPoi(queries, campDetails, numberedPage, noOfServiceType);
      }

      if (wantsEvents) {
        event = await this.getEvents(queries, campDetails, numberedPage, noOfServiceType);
      }

      if (wantsTripsOrFunday) {
        tripAndFunday = await this.getTrip(
          queries,
          campDetails,
          finalServiceType,
          numberedPage,
          noOfServiceType,
        );
      }

      const allItems = [
        ...(Array.isArray(business?.data) ? business.data : []),
        ...(Array.isArray(poi?.data) ? poi.data : []),
        ...(Array.isArray(event?.data) ? event.data : []),
        ...(Array.isArray(tripAndFunday?.data) ? tripAndFunday.data : []),
      ];

      const shuffledItems = shuffleArray(allItems);

      const totalData
        = (business?.totalData || 0)
        + (poi?.totalData || 0)
        + (event?.totalData || 0)
        + (tripAndFunday?.totalData || 0);
      const pageCount = Math.ceil(totalData / limit);
      return {
        data: shuffledItems,
        totalData,
        meta: {
          page: numberedPage,
          limit: numberedLimit,
          data: shuffledItems?.length,
          pageCount,
          hasPreviousPage: numberedPage > 1,
          hasNextPage: numberedPage < pageCount,
        },
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getBusinesses(
    queries: GetAllFeedItemsQuery,
    campDetails: any,
    page: number | null,
    limit: number | null,
  ): Promise<GetAllFeedItemResponse> {
    try {
      const {
        groupTypesId,
        accessibilitiesId,
        categoriesId,
        subCategoriesId,
        sortBy,
        sortOrder,
        search,
      } = queries;

      const findQuery = await this.queryBus.execute(
        new GetBusinessRawQuery({
          categoriesId,
          subCategoriesId,
          accessibilitiesId,
          groupTypesId,
          campDetails,
          search,
        }),
      );

      const select
        = '_id name shortDescription description geoLocation images primaryCategoryId address slug serviceType';

      const allBusiness = await queryhandler<Business>(this.BusinessModel, {
        findQuery,
        select,
        sort: sortBy || 'createdAt',
        sortOrder: sortOrder || SortOrder.DESC,
        page,
        limit,
      });

      return allBusiness;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getPoi(
    queries: GetAllFeedItemsQuery,
    campDetails: any,
    page: number | null,
    limit: number | null,
  ): Promise<GetAllFeedItemResponse> {
    try {
      const {
        sortBy, sortOrder, search,
      } = queries;

      const findQuery = await this.queryBus.execute(
        new GetPOIRawQuery({
          campDetails,
          search,
        }),
      );

      const select
        = '_id name shortDescription description geoLocation images primaryCategoryId address slug serviceType';

      const allPOI = await queryhandler<Business>(this.BusinessModel, {
        findQuery,
        select,
        sort: sortBy || 'createdAt',
        sortOrder: sortOrder || SortOrder.DESC,
        page,
        limit,
      });

      return allPOI;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getEvents(
    queries: GetAllFeedItemsQuery,
    campDetails: any,
    page: number | null,
    limit: number | null,
  ): Promise<GetAllFeedItemResponse> {
    try {
      const {
        sortBy, sortOrder, search,
      } = queries;

      const findQuery = await this.queryBus.execute(
        new GetEventRawQuery({
          campDetails,
          search,
        }),
      );

      const select
        = '_id name shortDescription description geoLocation images address slug';

      const allEvents = await queryhandler<Event>(this.EventModel, {
        findQuery,
        select,
        sort: sortBy || 'createdAt',
        sortOrder: sortOrder || SortOrder.DESC,
        page,
        limit,
      });

      allEvents.data = allEvents.data.map(event => ({
        ...event.toObject(),
        serviceType: ServicesTypes.EVENT,
        primaryCategoryId: '6566e208a77d2a477266d2b3',
      }));

      return allEvents;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getTrip(
    queries: GetAllFeedItemsQuery,
    campDetails: any,
    serviceType: ServicesTypes[],
    page: number | null,
    limit: number | null,
  ): Promise<GetAllFeedItemResponse> {
    try {
      const {
        sortBy, sortOrder, search,
      } = queries;

      const matchQuery = await this.queryBus.execute(
        new GetTripRawQuery({
          campDetails,
          serviceType,
        }),
      );

      const orConditions: Record<string, any>[] = [];

      let combinedBusinessFilter: any = {};
      if (orConditions.length > 0) {
        combinedBusinessFilter.$or = orConditions;
      }

      if (search) {
        const combinedSearchFilter = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'stationBusinesses.name': { $regex: search, $options: 'i' } },
            {
              'stationBusinesses.description': {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        };
        if (Object.keys(combinedBusinessFilter).length) {
          combinedBusinessFilter = {
            $and: [combinedBusinessFilter, combinedSearchFilter],
          };
        } else {
          combinedBusinessFilter = combinedSearchFilter;
        }
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
          serviceType: {
            $cond: {
              if: '$isTrip',
              then: ServicesTypes.TRIPS,
              else: ServicesTypes.FUNDAY,
            },
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
          serviceType: 1,
        },
      });

      pipeline.push({
        $sort: {
          [sortBy || 'createdAt']:
            sortOrder === SortOrder.ASC ? 1 : -1,
          _id: 1,
        },
      });

      if (page && limit) {
        pipeline.push({
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
            ],
          },
        });

        const result = await this.TripModel.aggregate(pipeline).exec();

        const items = result[0].data;
        const totalData = result[0].metadata[0]?.total || 0;
        const mappedTrips = items.map(trip => ({
          _id: trip._id,
          name: trip.name,
          shortDescription: trip.shortDescription,
          geoLocation: {
            lat: '',
            long: '',
          },
          images: trip.images,
          primaryCategoryId: '6566e31ca77d2a477266d2d6',
          address: trip.address,
          slug: trip.slug,
          serviceType: trip.serviceType,
        }));

        return {
          data: mappedTrips,
          totalData,
        };
      }

      const allTrips = await this.TripModel.aggregate(pipeline).exec();

      const mappedTrips = allTrips.map(trip => ({
        _id: trip._id,
        name: trip.name,
        shortDescription: trip.shortDescription,
        geoLocation: {
          lat: '',
          long: '',
        },
        images: trip.images,
        primaryCategoryId: '6566e31ca77d2a477266d2d6',
        address: trip.address,
        slug: trip.slug,
        serviceType: trip.serviceType,
      }));

      return {
        data: mappedTrips,
        totalData: mappedTrips.length,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
