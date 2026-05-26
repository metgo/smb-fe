/* eslint-disable no-bitwise */
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Locale, SortOrder } from 'src/common/enum';
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
import { GetProductRawQuery } from '../get-product-raw-query.query';
import { PointOfInterestsAudit } from 'src/modules/point-of-interests/schema/point-of-interest-audit.schema';
import { FindByIdAndPopulateQuery } from 'src/modules/campaign/queries/find-by-id-and-populate.query';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServerErrors } from 'src/common/constant';

@QueryHandler(GetAllFeedItemsQuery)
export class GetAllFeedItemsHandler
implements IQueryHandler<GetAllFeedItemsQuery> {
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

    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,

    private campaignService: CampaignService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    queries: GetAllFeedItemsQuery,
  ): Promise<GetAllFeedItemResponse> {
    try {
      const {
        identifierId,
        campCode,
        serviceType,
        page,
        limit,
        categoriesId,
        subCategoriesId,
        accessibilitiesId,
        groupTypesId,
      } = queries;

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

        // need to add if multiple primary campId exists
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

      let business: any;
      let poi: any;
      let tripAndFunday;
      let event;
      let product: any;

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

      const wantsProducts
        = identifierId
        && (!hasServiceFilter || finalServiceType.includes(ServicesTypes.PRODUCT));

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

      if (wantsProducts) {
        product = await this.getProducts(queries, campDetails);
      }

      const allItems = [
        ...(Array.isArray(business?.data) ? business.data : []),
        ...(Array.isArray(poi?.data) ? poi.data : []),
        ...(Array.isArray(event?.data) ? event.data : []),
        ...(Array.isArray(tripAndFunday?.data) ? tripAndFunday.data : []),
        ...(Array.isArray(product?.data) ? product.data : []),
      ];

      const shuffledItems = this.deterministicShuffle(
        allItems,
        identifierId || campCode,
      );

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
        locale,
      } = queries;

      const { findQuery, whitelist, blacklist } = await this.queryBus.execute(
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
        = '_id businessId name shortDescription description nameHe shortDescriptionHe descriptionHe nameAr shortDescriptionAr descriptionAr geoLocation images primaryCategoryId address slug serviceType groupTypesId accessibilitiesId';

      const allBusiness = await queryhandler<BusinessesAudit>(
        this.BusinessesAuditModel,
        {
          findQuery: { ...findQuery, isActive: true },
          select,
          sort: sortBy || 'createdAt',
          sortOrder: sortOrder || SortOrder.DESC,
          isLean: true,
        },
      );

      if (blacklist?.length) {
        const blacklistSet = new Set(blacklist.map((id: any) => id.toString()));
        allBusiness.data = allBusiness.data.filter(
          (item: any) => !blacklistSet.has(item.businessId.toString()),
        );
        allBusiness.totalData = allBusiness.data.length;
      }

      if (whitelist?.length) {
        const whitelistedBusiness = await queryhandler<BusinessesAudit>(
          this.BusinessesAuditModel,
          {
            findQuery: { businessId: { $in: whitelist }, isActive: true },
            select,
            sort: sortBy || 'createdAt',
            sortOrder: sortOrder || SortOrder.DESC,
            isLean: true,
          },
        );

        if (whitelistedBusiness?.data?.length) {
          allBusiness.data = [...allBusiness.data, ...whitelistedBusiness.data];
          allBusiness.totalData = allBusiness.data.length;
        }
      }

      const mappedBusinesses = allBusiness.data.map((bus: any) => ({
        ...bus,
        serviceType: ServicesTypes.BUSINESS,
      }));

      allBusiness.data = await Promise.all(
        mappedBusinesses.map(p => this.localizeItem(p, locale)),
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
      const {
        sortBy, sortOrder, search, locale,
      } = queries;

      const result = await this.queryBus.execute(
        new GetPOIRawQuery({ campDetails, search }),
      );

      if (!result) return { data: [], totalData: 0 };

      const { findQuery, whitelist, blacklist } = result;

      const select
        = '_id pointOfInterestId name shortDescription description nameHe shortDescriptionHe descriptionHe nameAr shortDescriptionAr descriptionAr geoLocation images primaryCategoryId address slug groupTypesId accessibilitiesId';

      const allPOI = await queryhandler<PointOfInterestsAudit>(
        this.PointOfInterestsAuditModel,
        {
          findQuery: { ...findQuery, isActive: true },
          select,
          sort: sortBy || 'createdAt',
          sortOrder: sortOrder || SortOrder.DESC,
          isLean: true,
        },
      );

      if (blacklist?.length) {
        const blacklistSet = new Set(blacklist.map((id: any) => id.toString()));
        allPOI.data = allPOI.data.filter(
          (item: any) => !blacklistSet.has(item.pointOfInterestId.toString()),
        );
        allPOI.totalData = allPOI.data.length;
      }

      if (whitelist?.length) {
        const whitelistedPOI = await queryhandler<PointOfInterestsAudit>(
          this.PointOfInterestsAuditModel,
          {
            findQuery: {
              pointOfInterestId: { $in: whitelist },
              isActive: true,
            },
            select,
            sort: sortBy || 'createdAt',
            sortOrder: sortOrder || SortOrder.DESC,
            isLean: true,
          },
        );

        if (whitelistedPOI?.data?.length) {
          allPOI.data = [...allPOI.data, ...whitelistedPOI.data];
          allPOI.totalData = allPOI.data.length;
        }
      }

      allPOI.data = allPOI.data.map((item: any) => ({
        ...item,
        serviceType: ServicesTypes.POINT_OF_INTEREST,
      }));

      allPOI.data = await Promise.all(
        allPOI.data.map(p => this.localizeItem(p, locale)),
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
      const {
        sortBy, sortOrder, search, locale,
      } = queries;

      const { findQuery, whitelist, blacklist } = await this.queryBus.execute(
        new GetEventRawQuery({
          campDetails,
          search,
        }),
      );

      const select
        = '_id eventId name nameHe nameAr shortDescription shortDescriptionHe shortDescriptionAr description descriptionHe descriptionAr geoLocation images address slug groupTypesId accessibilitiesId';

      const allEvents = await queryhandler<EventsAudit>(this.EventsAuditModel, {
        findQuery: { ...findQuery, isActive: true },
        select,
        sort: sortBy || 'createdAt',
        sortOrder: sortOrder || SortOrder.DESC,
        isLean: true,
      });

      if (blacklist?.length) {
        const blacklistSet = new Set(blacklist.map((id: any) => id.toString()));
        allEvents.data = allEvents.data.filter(
          (item: any) => !blacklistSet.has(item.eventId.toString()),
        );
        allEvents.totalData = allEvents.data.length;
      }

      if (whitelist?.length) {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const whitelistedEvents = await queryhandler<EventsAudit>(
          this.EventsAuditModel,
          {
            findQuery: {
              eventId: { $in: whitelist },
              isActive: true,
              dayDescription: { $elemMatch: { date: { $gte: todayStart } } },
            },
            select,
            sort: sortBy || 'createdAt',
            sortOrder: sortOrder || SortOrder.DESC,
            isLean: true,
          },
        );

        if (whitelistedEvents?.data?.length) {
          allEvents.data = [...allEvents.data, ...whitelistedEvents.data];
          allEvents.totalData = allEvents.data.length;
        }
      }

      const mappedEvents = allEvents.data.map(event => ({
        ...event,
        serviceType: ServicesTypes.EVENT,
        primaryCategoryId: '6566e208a77d2a477266d2b3',
      }));

      allEvents.data = await Promise.all(
        mappedEvents.map(p => this.localizeItem(p, locale)),
      );

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

      const {
        matchQuery,
        tripWhitelist,
        tripBlacklist,
        fundayWhitelist,
        fundayBlacklist,
      } = await this.queryBus.execute(
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

      const tripBlacklistSet = new Set(
        tripBlacklist.map((id: any) => id.toString()),
      );
      const fundayBlacklistSet = new Set(
        fundayBlacklist.map((id: any) => id.toString()),
      );
      const filteredTrips = allTrips.filter((trip: any) => {
        if (trip.serviceType === ServicesTypes.TRIPS) {
          return !tripBlacklistSet.has(trip._id.toString());
        }
        return !fundayBlacklistSet.has(trip._id.toString());
      });

      const existingIds = new Set(
        filteredTrips.map((t: any) => t._id.toString()),
      );
      const whitelistIds = [
        ...tripWhitelist.filter((id: any) => !existingIds.has(id.toString())),
        ...fundayWhitelist.filter((id: any) => !existingIds.has(id.toString())),
      ];

      if (whitelistIds.length) {
        const whitelistPipeline: any[] = [
          { $match: { _id: { $in: whitelistIds }, isDeleted: { $ne: true } } },
          {
            $lookup: {
              from: 'businesses',
              localField: 'stations._id',
              foreignField: '_id',
              as: 'stationBusinessesAddress',
              pipeline: [{ $project: { address: 1 } }],
            },
          },
          {
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
          },
          {
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
          },
        ];
        const whitelistedTrips = await this.TripModel.aggregate(
          whitelistPipeline,
        ).exec();
        filteredTrips.push(...whitelistedTrips);
      }

      const mappedTrips = filteredTrips.map((trip: any) => ({
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

  private async getProducts(
    queries: GetAllFeedItemsQuery,
    campDetails: any,
  ): Promise<GetAllFeedItemResponse> {
    try {
      const {
        categoriesId,
        subCategoriesId,
        accessibilitiesId,
        groupTypesId,
        sortBy,
        sortOrder,
        search,
        locale,
      } = queries;

      const result = await this.queryBus.execute(
        new GetProductRawQuery({
          categoriesId,
          subCategoriesId,
          accessibilitiesId,
          groupTypesId,
          campDetails,
          search,
        }),
      );

      if (!result) {
        return { data: [], totalData: 0 };
      }

      const { findQuery, whitelist, blacklist } = result;

      const select
        = '_id productId name shortDescription description nameHe shortDescriptionHe descriptionHe nameAr shortDescriptionAr descriptionAr images primaryCategoryId address slug groupTypesId accessibilitiesId price';

      const allProducts = await queryhandler<ProductsAudit>(
        this.ProductsAuditModel,
        {
          findQuery,
          select,
          sort: sortBy || 'createdAt',
          sortOrder: sortOrder || SortOrder.DESC,
          isLean: true,
        },
      );

      if (blacklist?.length) {
        const blacklistSet = new Set(blacklist.map((id: any) => id.toString()));
        allProducts.data = allProducts.data.filter(
          (item: any) => !blacklistSet.has(item.productId.toString()),
        );
        allProducts.totalData = allProducts.data.length;
      }

      if (whitelist?.length) {
        const whitelistedProducts = await queryhandler<ProductsAudit>(
          this.ProductsAuditModel,
          {
            findQuery: { productId: { $in: whitelist }, isActive: true },
            select,
            sort: sortBy || 'createdAt',
            sortOrder: sortOrder || SortOrder.DESC,
            isLean: true,
          },
        );

        if (whitelistedProducts?.data?.length) {
          allProducts.data = [...allProducts.data, ...whitelistedProducts.data];
          allProducts.totalData = allProducts.data.length;
        }
      }

      const mappedProducts = allProducts.data.map((prod: any) => ({
        ...prod,
        serviceType: ServicesTypes.PRODUCT,
        geoLocation: { lat: '', long: '' },
      }));

      allProducts.data = await Promise.all(
        mappedProducts.map(p => this.localizeItem(p, locale)),
      );

      return allProducts;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async localizeItem(item: any, locale: Locale) {
    const {
      nameAr,
      descriptionAr,
      shortDescriptionAr,
      name,
      description,
      shortDescription,
      nameHe,
      descriptionHe,
      shortDescriptionHe,
      ...rest
    } = item;

    switch (locale) {
      case Locale.ARABIC:
        return {
          ...rest,
          name: nameAr || name || nameHe,
          description: descriptionAr || description || descriptionHe,
          shortDescription:
            shortDescriptionAr || shortDescription || shortDescriptionHe,
        };
      case Locale.HEBREW:
        return {
          ...rest,
          name: nameHe || name || nameAr,
          description: descriptionHe || description || descriptionAr,
          shortDescription:
            shortDescriptionHe || shortDescription || shortDescriptionAr,
        };

      case Locale.ENGLISH:
        return {
          ...rest,
          name: name || nameHe || nameAr,
          description: description || descriptionHe || descriptionAr,
          shortDescription:
            shortDescription || shortDescriptionHe || shortDescriptionAr,
        };
      default:
        return item;
    }
  }
}
