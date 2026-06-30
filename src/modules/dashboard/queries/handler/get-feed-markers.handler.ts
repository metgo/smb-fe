import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { EventsAudit } from 'src/modules/events/schema/events-audit.schema';
import { Trip } from 'src/modules/trips/schema/trips.schema';
import { PointOfInterestsAudit } from 'src/modules/point-of-interests/schema/point-of-interest-audit.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { FindByIdAndPopulateQuery } from 'src/modules/campaign/queries/find-by-id-and-populate.query';
import { GetBusinessRawQuery } from '../get-business-raw-query.query';
import { GetEventRawQuery } from '../get-event-raw-query.query';
import { GetTripRawQuery } from '../get-trip-raw-query.query';
import { GetPOIRawQuery } from '../get-poi-raw-query.query';
import { GetFeedMarkersQuery } from '../get-feed-markers.query';
import { GetFeedMarkersResponse } from '../../response/get-feed-markers.response';
import { ServicesTypes } from '../../dashboard.type';

@QueryHandler(GetFeedMarkersQuery)
export class GetFeedMarkersHandler implements IQueryHandler<GetFeedMarkersQuery> {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
    @InjectModel(PointOfInterestsAudit.name)
    private PointOfInterestsAuditModel: Model<PointOfInterestsAudit>,
    @InjectModel(Trip.name)
    private TripModel: Model<Trip>,
    @InjectModel(ExternalApi.name)
    private ExternalApiModel: Model<ExternalApi>,
    private campaignService: CampaignService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(queries: GetFeedMarkersQuery): Promise<GetFeedMarkersResponse> {
    try {
      const { identifierId, campCode } = queries;

      if (!identifierId && !campCode) {
        throw new BadRequestException('Please enter identifierId or campcode');
      }

      let campDetails;

      if (identifierId) {
        const externalApi = await this.ExternalApiModel.findOne({
          identifierId,
        }).select('_id primaryCampIds');

        if (!externalApi) {
          throw new NotFoundException(`SITE ${ServerErrors.NOT_FOUND}`);
        }

        campDetails = await this.queryBus.execute(
          new FindByIdAndPopulateQuery(externalApi.primaryCampIds[0]),
        );
      }

      if (campCode) {
        campDetails = await this.campaignService.findCampaignAndReturn(
          'code',
          campCode,
        );
      }

      const [businesses, poi, events, trips] = await Promise.all([
        this.getBusinessMarkers(campDetails),
        this.getPOIMarkers(campDetails),
        this.getEventMarkers(campDetails),
        this.getTripMarkers(campDetails),
      ]);

      const data = [...businesses, ...poi, ...events, ...trips].filter(
        item => item.geoLocation?.lat && item.geoLocation?.long,
      );

      return { data, totalData: data.length };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getBusinessMarkers(campDetails: any) {
    try {
      const { findQuery, whitelist, blacklist } = await this.queryBus.execute(
        new GetBusinessRawQuery({ campDetails }),
      );

      const select = '_id slug geoLocation primaryCategoryId businessId';

      const result = await queryhandler<BusinessesAudit>(
        this.BusinessesAuditModel,
        {
          findQuery: { ...findQuery, isActive: true },
          select,
          sort: 'createdAt',
          sortOrder: SortOrder.DESC,
          isLean: true,
        },
      );

      let items = result.data;

      if (blacklist?.length) {
        const blacklistSet = new Set(blacklist.map((id: any) => id.toString()));
        items = items.filter(
          (item: any) => !blacklistSet.has(item.businessId.toString()),
        );
      }

      if (whitelist?.length) {
        const whitelisted = await queryhandler<BusinessesAudit>(
          this.BusinessesAuditModel,
          {
            findQuery: { businessId: { $in: whitelist }, isActive: true },
            select,
            sort: 'createdAt',
            sortOrder: SortOrder.DESC,
            isLean: true,
          },
        );
        items = [...items, ...whitelisted.data];
      }

      return items.map((item: any) => ({
        _id: item._id,
        businessId: item.businessId,
        slug: item.slug,
        serviceType: ServicesTypes.BUSINESS,
        geoLocation: item.geoLocation ?? { lat: null, long: null },
        primaryCategoryId: item.primaryCategoryId,
      }));
    } catch (err) {
      exceptionHandling(err);
    }
    return [];
  }

  private async getPOIMarkers(campDetails: any) {
    try {
      const result = await this.queryBus.execute(
        new GetPOIRawQuery({ campDetails }),
      );

      if (!result) return [];

      const { findQuery, whitelist, blacklist } = result;
      const select = '_id slug geoLocation primaryCategoryId pointOfInterestId';

      const poiResult = await queryhandler<PointOfInterestsAudit>(
        this.PointOfInterestsAuditModel,
        {
          findQuery: { ...findQuery, isActive: true },
          select,
          sort: 'createdAt',
          sortOrder: SortOrder.DESC,
          isLean: true,
        },
      );

      let items = poiResult.data;

      if (blacklist?.length) {
        const blacklistSet = new Set(blacklist.map((id: any) => id.toString()));
        items = items.filter(
          (item: any) => !blacklistSet.has(item.pointOfInterestId.toString()),
        );
      }

      if (whitelist?.length) {
        const whitelisted = await queryhandler<PointOfInterestsAudit>(
          this.PointOfInterestsAuditModel,
          {
            findQuery: { pointOfInterestId: { $in: whitelist }, isActive: true },
            select,
            sort: 'createdAt',
            sortOrder: SortOrder.DESC,
            isLean: true,
          },
        );
        items = [...items, ...whitelisted.data];
      }

      return items.map((item: any) => ({
        _id: item._id,
        slug: item.slug,
        serviceType: ServicesTypes.POINT_OF_INTEREST,
        geoLocation: item.geoLocation ?? { lat: null, long: null },
        primaryCategoryId: item.primaryCategoryId,
      }));
    } catch (err) {
      exceptionHandling(err);
    }
    return [];
  }

  private async getEventMarkers(campDetails: any) {
    try {
      const { findQuery, whitelist, blacklist } = await this.queryBus.execute(
        new GetEventRawQuery({ campDetails }),
      );

      const select = '_id slug geoLocation eventId';

      const eventsResult = await queryhandler<EventsAudit>(
        this.EventsAuditModel,
        {
          findQuery: { ...findQuery, isActive: true },
          select,
          sort: 'createdAt',
          sortOrder: SortOrder.DESC,
          isLean: true,
        },
      );

      let items = eventsResult.data;

      if (blacklist?.length) {
        const blacklistSet = new Set(blacklist.map((id: any) => id.toString()));
        items = items.filter(
          (item: any) => !blacklistSet.has(item.eventId.toString()),
        );
      }

      if (whitelist?.length) {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const whitelisted = await queryhandler<EventsAudit>(
          this.EventsAuditModel,
          {
            findQuery: {
              eventId: { $in: whitelist },
              isActive: true,
              dayDescription: { $elemMatch: { date: { $gte: todayStart } } },
            },
            select,
            sort: 'createdAt',
            sortOrder: SortOrder.DESC,
            isLean: true,
          },
        );
        items = [...items, ...whitelisted.data];
      }

      return items.map((item: any) => ({
        _id: item._id,
        slug: item.slug,
        serviceType: ServicesTypes.EVENT,
        geoLocation: item.geoLocation ?? { lat: null, long: null },
        primaryCategoryId: '6566e208a77d2a477266d2b3',
      }));
    } catch (err) {
      exceptionHandling(err);
    }
    return [];
  }

  private async getTripMarkers(campDetails: any) {
    try {
      const {
        matchQuery,
        tripWhitelist,
        tripBlacklist,
        fundayWhitelist,
        fundayBlacklist,
      } = await this.queryBus.execute(
        new GetTripRawQuery({ campDetails, serviceType: [] }),
      );

      const pipeline: any[] = [
        { $match: matchQuery },
        {
          $addFields: {
            serviceType: {
              $cond: {
                if: '$isTrip',
                then: ServicesTypes.TRIPS,
                else: ServicesTypes.FUNDAY,
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            slug: 1,
            serviceType: 1,
            isTrip: 1,
          },
        },
      ];

      const allTrips = await this.TripModel.aggregate(pipeline).exec();

      const tripBlacklistSet = new Set(
        tripBlacklist.map((id: any) => id.toString()),
      );
      const fundayBlacklistSet = new Set(
        fundayBlacklist.map((id: any) => id.toString()),
      );

      let filtered = allTrips.filter((trip: any) => {
        if (trip.serviceType === ServicesTypes.TRIPS) {
          return !tripBlacklistSet.has(trip._id.toString());
        }
        return !fundayBlacklistSet.has(trip._id.toString());
      });

      const existingIds = new Set(filtered.map((t: any) => t._id.toString()));
      const whitelistIds = [
        ...tripWhitelist.filter((id: any) => !existingIds.has(id.toString())),
        ...fundayWhitelist.filter((id: any) => !existingIds.has(id.toString())),
      ];

      if (whitelistIds.length) {
        const whitelisted = await this.TripModel.aggregate([
          { $match: { _id: { $in: whitelistIds }, isDeleted: { $ne: true } } },
          {
            $addFields: {
              serviceType: {
                $cond: {
                  if: '$isTrip',
                  then: ServicesTypes.TRIPS,
                  else: ServicesTypes.FUNDAY,
                },
              },
            },
          },
          { $project: { _id: 1, slug: 1, serviceType: 1 } },
        ]).exec();
        filtered = [...filtered, ...whitelisted];
      }

      return filtered.map((trip: any) => ({
        _id: trip._id,
        slug: trip.slug,
        serviceType: trip.serviceType,
        geoLocation: { lat: null, long: null },
        primaryCategoryId: '6566e31ca77d2a477266d2d6',
      }));
    } catch (err) {
      exceptionHandling(err);
    }
    return [];
  }
}
