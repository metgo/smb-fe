/* eslint-disable no-nested-ternary */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ExternalApi } from '../../schema/external-api.schema';
import { ServerErrors } from 'src/common/constant';
import { Trip } from 'src/modules/trips/schema/trips.schema';
import { TripStatus } from 'src/modules/trips/trips.types';
import {
  BusinessStatus,
  GeoServicesTypes,
} from 'src/modules/business/business.type';
import { EventStatus } from 'src/modules/events/events.type';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { GetPromotionalItemsQuery } from '../get-promotional-items.query';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { EventsAudit } from 'src/modules/events/schema/events-audit.schema';

@QueryHandler(GetPromotionalItemsQuery)
export class GetPromotionalItemsHandler
implements IQueryHandler<GetPromotionalItemsQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
    @InjectModel(Campaign.name)
    private readonly CampaignModel: Model<Campaign>,
    @InjectModel(BusinessesAudit.name)
    private readonly BusinessesAuditModel: Model<BusinessesAudit>,
    @InjectModel(EventsAudit.name)
    private readonly EventsAuditModel: Model<EventsAudit>,
    @InjectModel(Trip.name)
    private readonly TripModel: Model<Trip>,
  ) {}

  async execute(queries: GetPromotionalItemsQuery) {
    const { identifierId, query } = queries;
    try {
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId,
      });
      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.EXTERNAL_API.IDENTIFIER_ID);
      }

      // get campIds of the externalApi
      const campaigns = await this.CampaignModel.find({
        _id: { $in: externalApi.campIds },
      });

      const campDetails = {
        dmoIds: campaigns.flatMap(c => c.dmoIds || []),
        authorityIds: campaigns.flatMap(c => c.authorityIds || []),
        businessIds: campaigns.flatMap(c => c.businessIds || []),
      };

      const promotionalBusinessItems = externalApi.promotionalBusinesses;
      const promotionalEventsItems = externalApi.promotionalEvents;
      const promotionalTripsItems = externalApi.promotionalTrips;

      let promotionalBusinesses = [];
      let promotionalEvents = [];
      let promotionalTrips = [];
      let allPromotionalItems = [];

      if (
        !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
      ) {
        promotionalBusinesses = [];
        promotionalEvents = [];
        promotionalTrips = [];
      } else {
        if (!query.isBusiness && !query.isEvent && !query.isTrip) {
          const [
            promotionalBusinessesData,
            promotionalEventsData,
            promotionalTripData,
          ] = await Promise.all([
            this.getPromotionalBusinesses(
              promotionalBusinessItems,
              campDetails,
              query.locale,
            ),
            this.getPromotionalEvents(
              promotionalEventsItems,
              campDetails,
              query.locale,
            ),
            this.getPromotionalTrips(promotionalTripsItems, campDetails),
          ]);

          const tagItems = (
            items: any[],
            type: 'business' | 'event' | 'trip',
          ) => items.map(item => ({ ...item, itemType: type }));

          const taggedBusinesses = tagItems(
            promotionalBusinessesData,
            'business',
          );
          const taggedEvents = tagItems(promotionalEventsData, 'event');
          const taggedTrips = tagItems(promotionalTripData, 'trip');

          const allItems = [
            ...taggedBusinesses,
            ...taggedEvents,
            ...taggedTrips,
          ];

          const shuffle = <T>(array: T[]): T[] => {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
          };

          allPromotionalItems = shuffle(allItems).slice(0, 10);
        }

        if (query.isBusiness) {
          promotionalBusinesses = await this.getPromotionalBusinesses(
            promotionalBusinessItems,
            campDetails,
            query.locale,
          );
        }

        if (query.isEvent) {
          promotionalEvents = await this.getPromotionalEvents(
            promotionalEventsItems,
            campDetails,
            query.locale,
          );
        }

        if (query.isTrip) {
          promotionalTrips = await this.getPromotionalTrips(
            promotionalTripsItems,
            campDetails,
          );
        }

        return {
          promotionalBusinesses,
          promotionalEvents,
          promotionalTrips,
          allPromotionalItems,
        };
      }
    } catch (err) {
      this.logger.error(
        `[EXTERNAL_API]: FAILED TO GET PROMOTIONAL INFO BY IDENTIFIER: ENTERED IDENTIFIER='${identifierId}'`,
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  private buildOrConditions({
    dmoIds = [],
    authorityIds = [],
    businessIds = [],
  }) {
    const orConds: any[] = [];

    if (dmoIds.length) orConds.push({ dmoId: { $in: dmoIds } });
    if (authorityIds.length) orConds.push({ authorityId: { $in: authorityIds } });
    if (businessIds.length) orConds.push({ _id: { $in: businessIds } });
    return orConds;
  }

  private async getPromotionalBusinesses(
    promotionalBusinessItems,
    campDetails,
    locale: Locale,
  ) {
    const campaignOrConditionsBusiness = this.buildOrConditions(campDetails);
    const baseBusinessMatch = {
      status: BusinessStatus.APPROVED,
      serviceType: GeoServicesTypes.BUSINESS,
      isActive: true,
      isDeleted: { $ne: true },
    };
    if (promotionalBusinessItems?.isAll) {
      return await this.BusinessesAuditModel.aggregate([
        {
          $match: {
            ...baseBusinessMatch,
            $or: campaignOrConditionsBusiness,
          },
        },
        { $sample: { size: 10 } },
        {
          $project: {
            _id: '$businessId',
            name:
              locale === Locale.HEBREW
                ? '$nameHe'
                : locale === Locale.ARABIC
                  ? '$nameAr'
                  : 1,
            slug: 1,
            shortDescription:
              locale === Locale.HEBREW
                ? '$shortDescriptionHe'
                : locale === Locale.ARABIC
                  ? '$shortDescriptionAr'
                  : 1,
            image: { $arrayElemAt: ['$images', 0] },
          },
        },
      ]);
    }

    const orFilters: any[] = [];
    if (promotionalBusinessItems?.categoryIds?.length) {
      orFilters.push({
        bussCategoriesId: {
          $in: promotionalBusinessItems.categoryIds.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    if (promotionalBusinessItems?.subCategoryIds?.length) {
      orFilters.push({
        bussSubCategoriesId: {
          $in: promotionalBusinessItems.subCategoryIds.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    if (promotionalBusinessItems?.groupTypesId?.length) {
      orFilters.push({
        groupTypesId: {
          $in: promotionalBusinessItems.groupTypesId.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    if (promotionalBusinessItems?.accesibilitiesId?.length) {
      orFilters.push({
        accessibilitiesId: {
          $in: promotionalBusinessItems.accesibilitiesId.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    if (orFilters.length === 0) return [];

    const filters = {
      $and: [
        baseBusinessMatch,
        { $or: campaignOrConditionsBusiness },
        { $or: orFilters },
      ],
    };

    return await this.BusinessesAuditModel.aggregate([
      { $match: filters },
      { $sample: { size: 10 } },
      {
        $project: {
          _id: '$businessId',
          name: 1,
          slug: 1,
          shortDescription: 1,
          image: { $arrayElemAt: ['$images', 0] },
        },
      },
    ]);
  }

  private async getPromotionalEvents(
    promotionalEventsItems,
    campDetails,
    locale: Locale,
  ) {
    const campaignOrConditionsEvent = this.buildOrConditions({
      dmoIds: campDetails.dmoIds,
      authorityIds: campDetails.authorityIds,
    });

    const baseEventMatch = {
      status: EventStatus.APPROVED,
      isActive: true,
      isDeleted: { $ne: true },
    };
    if (promotionalEventsItems?.isAll) {
      return await this.EventsAuditModel.aggregate([
        {
          $match: {
            ...baseEventMatch,
            $or: campaignOrConditionsEvent,
          },
        },
        { $sample: { size: 10 } },
        {
          $project: {
            _id: '$eventId',
            name:
              locale === Locale.HEBREW
                ? '$nameHe'
                : locale === Locale.ARABIC
                  ? '$nameAr'
                  : 1,
            slug: 1,
            shortDescription:
              locale === Locale.HEBREW
                ? '$shortDescriptionHe'
                : locale === Locale.ARABIC
                  ? '$shortDescriptionAr'
                  : 1,
            image: { $arrayElemAt: ['$images', 0] },
          },
        },
      ]);
    }

    const orFilters: any[] = [];

    if (promotionalEventsItems?.subCategoryIds?.length) {
      orFilters.push({
        subCategoriesId: {
          $in: promotionalEventsItems.subCategoryIds.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    if (promotionalEventsItems?.groupTypesId?.length) {
      orFilters.push({
        groupTypesId: {
          $in: promotionalEventsItems.groupTypesId.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    if (promotionalEventsItems?.accesibilitiesId?.length) {
      orFilters.push({
        accessibilitiesId: {
          $in: promotionalEventsItems.accesibilitiesId.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    if (orFilters.length === 0) return [];

    const filters = {
      $and: [
        baseEventMatch,
        { $or: campaignOrConditionsEvent },
        { $or: orFilters },
      ],
    };

    return await this.EventsAuditModel.aggregate([
      { $match: filters },
      { $sample: { size: 10 } },
      {
        $project: {
          _id: '$eventId',
          name:
            locale === Locale.HEBREW
              ? '$nameHe'
              : locale === Locale.ARABIC
                ? '$nameAr'
                : 1,
          slug: 1,
          shortDescription:
            locale === Locale.HEBREW
              ? '$shortDescriptionHe'
              : locale === Locale.ARABIC
                ? '$shortDescriptionAr'
                : 1,
          image: { $arrayElemAt: ['$images', 0] },
        },
      },
    ]);
  }

  private async getPromotionalTrips(promotionalTripsItems, campDetails) {
    const campaignOrConditionsTrip = this.buildOrConditions({
      dmoIds: campDetails.dmoIds,
      authorityIds: campDetails.authorityIds,
    });

    const baseTripMatch: any = {
      status: TripStatus.APPROVED,
      isDeleted: { $ne: true },
      ...(campaignOrConditionsTrip.length > 0 && {
        $or: campaignOrConditionsTrip,
      }),
    };

    if (campaignOrConditionsTrip?.length) {
      baseTripMatch.$or = campaignOrConditionsTrip;
    }

    if (promotionalTripsItems?.isAll) {
      return await this.TripModel.aggregate([
        {
          $match: {
            ...baseTripMatch,
          },
        },
        { $sample: { size: 10 } },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            shortDescription: 1,
            image: { $arrayElemAt: ['$images', 0] },
          },
        },
      ]);
    }

    const orConditions: any[] = [];

    if (promotionalTripsItems?.groupTypesId?.length) {
      orConditions.push({
        'stationBusinesses.groupTypesId': {
          $in: promotionalTripsItems.groupTypesId.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    if (promotionalTripsItems?.accesibilitiesId?.length) {
      orConditions.push({
        'stationBusinesses.accessibilitiesId': {
          $in: promotionalTripsItems.accesibilitiesId.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    if (promotionalTripsItems?.categoryIds?.length) {
      orConditions.push({
        'stationBusinesses.bussCategoriesId': {
          $in: promotionalTripsItems.categoryIds.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    if (promotionalTripsItems?.subCategoryIds?.length) {
      orConditions.push({
        'stationBusinesses.bussSubCategoriesId': {
          $in: promotionalTripsItems.subCategoryIds.map(
            id => new mongoose.Types.ObjectId(id),
          ),
        },
      });
    }

    const combinedBusinessFilter: any = {};
    if (orConditions.length > 0) {
      combinedBusinessFilter.$or = orConditions;
    }

    const pipeline: any[] = [
      { $match: baseTripMatch },
      {
        $lookup: {
          from: 'businesses',
          localField: 'stations._id',
          foreignField: '_id',
          as: 'stationBusinessesAddress',
          pipeline: [{ $project: { address: 1 } }],
        },
      },
    ];

    if (Object.keys(combinedBusinessFilter).length > 0) {
      pipeline.push({ $match: combinedBusinessFilter });
    }

    pipeline.push(
      {
        $addFields: {
          address: {
            $ifNull: [
              { $arrayElemAt: ['$stationBusinessesAddress.address', 0] },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          shortDescription: 1,
          image: { $arrayElemAt: ['$images', 0] },
          address: 1,
        },
      },
      { $sample: { size: 10 } },
    );

    return await this.TripModel.aggregate(pipeline);
  }
}
