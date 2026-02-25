/* eslint-disable no-bitwise */
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { paginateData } from 'src/common/pagination';
import { shuffleArray } from 'src/common/utils/shuffle';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllFeedItemsQuery } from '../get-all-feed-items.query';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { ServicesTypes } from '../../dashboard.type';
import { EventsAudit } from 'src/modules/events/schema/events-audit.schema';
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
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
    @InjectModel(Trip.name)
    private TripModel: Model<Trip>,
    private campaignService: CampaignService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    queries: GetAllFeedItemsQuery,
  ): Promise<GetAllFeedItemResponse> {
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

      if (wantsBusiness) {
        business = await this.getBusinesses(queries, campDetails);
      }

      if (wantsPOI) {
        poi = await this.getPoi(queries, campDetails);
      }

      if (wantsEvents) {
        event = await this.getEvents(queries, campDetails);
      }

      if (wantsTripsOrFunday) {
        tripAndFunday = await this.getTrip(
          queries,
          campDetails,
          finalServiceType,
        );
      }

      const allItems = [
        ...(Array.isArray(business?.data) ? business.data : []),
        ...(Array.isArray(poi?.data) ? poi.data : []),
        ...(Array.isArray(event?.data) ? event.data : []),
        ...(Array.isArray(tripAndFunday?.data) ? tripAndFunday.data : []),
      ];

      const shuffledItems = this.deterministicShuffle(allItems, campCode);

      const paginatedItems = paginateData(page, limit, shuffledItems);

      paginatedItems.data = shuffleArray(paginatedItems.data);

      return paginatedItems;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private deterministicShuffle(items: any[], seed: string): any[] {
    if (!items || items.length === 0) return items;

    const itemsCopy = [...items];
    let seedNumber = this.hashString(seed);

    for (let i = itemsCopy.length - 1; i > 0; i--) {
      seedNumber = (seedNumber * 9301 + 49297) % 233280;
      const j = Math.floor((seedNumber / 233280) * (i + 1));
      [itemsCopy[i], itemsCopy[j]] = [itemsCopy[j], itemsCopy[i]];
    }

    return itemsCopy;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    return Math.abs(hash);
  }

  private async getBusinesses(
    queries: GetAllFeedItemsQuery,
    campDetails: any,
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
        = '_id name shortDescription description nameHe shortDescriptionHe descriptionHe nameAr shortDescriptionAr descriptionAr geoLocation images primaryCategoryId address slug serviceType groupTypesId accessibilitiesId';

      const allBusiness = await queryhandler<BusinessesAudit>(
        this.BusinessesAuditModel,
        {
          findQuery: { ...findQuery, isActive: true },
          select,
          sort: sortBy || 'createdAt',
          sortOrder: sortOrder || SortOrder.DESC,
        },
      );

      return allBusiness;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getPoi(
    queries: GetAllFeedItemsQuery,
    campDetails: any,
  ): Promise<GetAllFeedItemResponse> {
    try {
      const { sortBy, sortOrder, search } = queries;

      const findQuery = await this.queryBus.execute(
        new GetPOIRawQuery({
          campDetails,
          search,
        }),
      );

      const select
        = '_id name shortDescription description nameHe shortDescriptionHe descriptionHe nameAr shortDescriptionAr descriptionAr geoLocation images primaryCategoryId address slug serviceType groupTypesId accessibilitiesId';

      const allPOI = await queryhandler<BusinessesAudit>(
        this.BusinessesAuditModel,
        {
          findQuery,
          select,
          sort: sortBy || 'createdAt',
          sortOrder: sortOrder || SortOrder.DESC,
        },
      );

      return allPOI;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getEvents(
    queries: GetAllFeedItemsQuery,
    campDetails: any,
  ): Promise<GetAllFeedItemResponse> {
    try {
      const { sortBy, sortOrder, search } = queries;

      const findQuery = await this.queryBus.execute(
        new GetEventRawQuery({
          campDetails,
          search,
        }),
      );

      const select
        = '_id name nameHe nameAr shortDescription shortDescriptionHe shortDescriptionAr description descriptionHe descriptionAr geoLocation images address slug groupTypesId accessibilitiesId';

      const allEvents = await queryhandler<EventsAudit>(this.EventsAuditModel, {
        findQuery: { ...findQuery, isActive: true },
        select,
        sort: sortBy || 'createdAt',
        sortOrder: sortOrder || SortOrder.DESC,
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
  ): Promise<GetAllFeedItemResponse> {
    try {
      const { sortBy, sortOrder, search } = queries;

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
          groupTypesId: 1,
          accessibilitiesId: 1,
        },
      });

      pipeline.push({
        $sort: {
          [sortBy || 'createdAt']: sortOrder === SortOrder.ASC ? 1 : -1,
          _id: 1,
        },
      });

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
        groupTypesId: trip.groupTypesId,
        accessibilitiesId: trip.accessibilitiesId,
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
