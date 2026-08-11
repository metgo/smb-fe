import { Logger } from 'winston';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { Locale, CommonStatus } from 'src/common/enum';
import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { sanitizeImages } from 'src/core/helper/image.util';
import { SiteFiltersConfigStatus } from '../../site-filters-config.type';
import { SiteFiltersConfig } from '../../schema/site-filters-config.schema';
import { GetSiteConfigByIdentifierIdQuery } from '../get-site-config-by-identifierId.query';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { ServicesTypes } from 'src/modules/dashboard/dashboard.type';
import { EventsAudit } from 'src/modules/events/schema/events-audit.schema';
import { Trip } from 'src/modules/trips/schema/trips.schema';
import { TripStatus } from 'src/modules/trips/trips.types';
import { PointOfInterestsAudit } from 'src/modules/point-of-interests/schema/point-of-interest-audit.schema';

@QueryHandler(GetSiteConfigByIdentifierIdQuery)
export class GetSiteConfigByIdentifierIdHandler
implements IQueryHandler<GetSiteConfigByIdentifierIdQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(SiteFiltersConfig.name)
    private SiteFiltersConfigModel: Model<SiteFiltersConfig>,
    @InjectModel(ExternalApi.name)
    private ExternalApiModel: Model<ExternalApi>,
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
    @InjectModel(Trip.name)
    private TripModel: Model<Trip>,
    @InjectModel(PointOfInterestsAudit.name)
    private PointOfInterestsAuditModel: Model<PointOfInterestsAudit>,
  ) { }

  async execute(queries: GetSiteConfigByIdentifierIdQuery) {
    try {
      const { identifierId, query } = queries;

      const siteSetting = await this.ExternalApiModel.findOne({
        identifierId,
      }).select('_id');

      if (!siteSetting) {
        throw new NotFoundException(`SITE ${ServerErrors.NOT_FOUND}`);
      }

      const select = 'siteTopics';

      const siteSettings = await this.SiteFiltersConfigModel.findOne({
        externalApiId: siteSetting._id,
        status: SiteFiltersConfigStatus.APPROVED,
      })
        .select(select)
        .populate([
          {
            path: 'siteTopics.siteCategories.businessIds',
            select:
              'slug name nameHe nameAr shortDescription shortDescriptionHe shortDescriptionAr geoLocation images primaryCategoryId groupTypesId accessibilitiesId tagsId address',
          },
        ]);

      if (!siteSettings) {
        throw new NotFoundException(`SITE SETTINGS ${ServerErrors.NOT_FOUND}`);
      }

      this.logger.info('[SITE CONFIG]: SITE CONFIG FOUND', {
        externalApiId: siteSettings._id,
      });

      const { locale } = query;
      const result = siteSettings.toObject();

      // Events are no longer curated per-category via SiteFiltersConfig.
      // Site scoping for events is determined solely by EventsAudit.associatedWebsiteIds -
      // any matching event shows up under every category on the site.
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const events = await this.EventsAuditModel.find({
        associatedWebsiteIds: siteSetting._id,
        isDeleted: { $ne: true },
        status: CommonStatus.APPROVED,
        isActive: true,
        // Filter out expired events - events with all dayDescription dates in the past
        $or: [
          { dayDescription: { $exists: false } },
          { dayDescription: { $size: 0 } },
          {
            dayDescription: {
              $elemMatch: {
                date: { $gte: today },
              },
            },
          },
        ],
      })
        .select(
          'slug name nameHe shortDescriptionHe shortDescription geoLocation images primaryCategoryId groupTypesId accessibilitiesId address dayDescription eventId',
        )
        .lean();

      const siteEvents = events.map((event: any) => ({
        ...event,
        _id: event.eventId,
        images: sanitizeImages(event.images?.slice(0, 5)),
        serviceType: ServicesTypes.EVENT,
      }));

      // Trips are no longer curated per-category via cat.tripIds - same as events,
      // site scoping is determined solely by Trip.associatedWebsiteIds.
      const trips = await this.TripModel.find({
        associatedWebsiteIds: siteSetting._id,
        status: TripStatus.APPROVED,
        isDeleted: { $ne: true },
      })
        .select(
          'slug name shortDescription images groupTypesId accessibilitiesId',
        )
        .lean();

      const siteTrips = trips.map((trip: any) => ({
        ...trip,
        images: sanitizeImages(trip.images?.slice(0, 5)),
        serviceType: ServicesTypes.TRIPS,
      }));

      // POIs are no longer curated per-category via SiteFiltersConfig.
      // Site scoping for POIs is determined solely by PointOfInterestsAudit.associatedWebsiteIds -
      // any matching POI shows up under every category on the site.
      const pois = await this.PointOfInterestsAuditModel.find({
        associatedWebsiteIds: siteSetting._id,
        status: CommonStatus.APPROVED,
        isActive: true,
        isDeleted: { $ne: true },
      })
        .select(
          'slug name nameHe nameAr shortDescription shortDescriptionHe shortDescriptionAr geoLocation images primaryCategoryId groupTypesId accessibilitiesId tagsId address pointOfInterestId',
        )
        .lean();

      const sitePOIs = pois.map((poi: any) => {
        const { pointOfInterestId, ...rest } = poi;
        return {
          ...rest,
          _id: pointOfInterestId,
          images: sanitizeImages(poi.images?.slice(0, 5)),
          serviceType: ServicesTypes.POINT_OF_INTEREST,
        };
      });

      result.header = this.localizeString(
        { base: result.header, he: result.headerHe, ar: result.headerAr },
        locale,
      );
      result.headerDescription = this.localizeString(
        {
          base: result.headerDescription,
          he: result.headerDescriptionHe,
          ar: result.headerDescriptionAr,
        },
        locale,
      );
      delete result.headerHe;
      delete result.headerAr;
      delete result.headerDescriptionHe;
      delete result.headerDescriptionAr;

      // Process all site topics and categories
      const processedSiteTopics = result.siteTopics
        .filter((topic: any) => !topic.isArchived)
        .map((topic: any, topicIndex: number) => {
          const {
            titleHe: topicTitleHe,
            titleAr: topicTitleAr,
            descriptionHe: topicDescHe,
            descriptionAr: topicDescAr,
            icon,
            colors,
            isArchived: topicIsArchived,
            synonyms: topicSynonyms,
            synonymsHe: topicSynonymsHe,
            synonymsAr: topicSynonymsAr,
            searchKeywords: topicSearchKeywords,
            searchKeywordsHe: topicSearchKeywordsHe,
            searchKeywordsAr: topicSearchKeywordsAr,
            ...topicRest
          } = topic;

          // Process categories for this topic
          const processedCategories = topic.siteCategories
            .filter((cat: any) => !cat.isArchived)
            .map((category: any, categoryIndex: number) => {
              const {
                titleHe: catTitleHe,
                titleAr: catTitleAr,
                descriptionHe: catDescHe,
                descriptionAr: catDescAr,
                productIds,
                fundayIds,
                isPrimary,
                isArchived,
                synonyms,
                synonymsHe,
                synonymsAr,
                searchKeywords,
                searchKeywordsHe,
                searchKeywordsAr,
                ...catRest
              } = category;

              // Prepare base category object
              const processedCategory = {
                ...catRest,
                title: this.localizeString(
                  { base: category.title, he: catTitleHe, ar: catTitleAr },
                  locale,
                ),
                description: this.localizeString(
                  { base: category.description, he: catDescHe, ar: catDescAr },
                  locale,
                ),
                businessIds: (category.businessIds || [])
                  .filter(Boolean)
                  .map((item: any) => ({
                    ...this.localizeItem(item, locale),
                    images: sanitizeImages(item.images?.slice(0, 5)),
                    serviceType: ServicesTypes.BUSINESS,
                  })),
              };

              // Only add eventIds, tripIds and poiIds to the first topic's first category
              if (topicIndex === 0 && categoryIndex === 0) {
                processedCategory.eventIds = siteEvents; // All events for the site
                processedCategory.tripIds = siteTrips; // All trips for the site
                processedCategory.poiIds = sitePOIs; // All POIs for the site
              }

              return processedCategory;
            });

          return {
            ...topicRest,
            title: this.localizeString(
              { base: topic.title, he: topicTitleHe, ar: topicTitleAr },
              locale,
            ),
            siteCategories: processedCategories,
          };
        });

      // Set the result with all processed topics
      result.siteTopics = processedSiteTopics;

      return result;
    } catch (error) {
      this.logger.error('[SITE CONFIG]: FAILED TO GET SITE CONFIG', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  private localizeItem(item: any, locale: Locale) {
    const {
      name,
      nameHe,
      nameAr,
      shortDescription,
      shortDescriptionHe,
      shortDescriptionAr,
      images,
      ...rest
    } = item;
    return {
      ...rest,
      name: this.localizeString({ base: name, he: nameHe, ar: nameAr }, locale),
      shortDescription: this.localizeString(
        {
          base: shortDescription,
          he: shortDescriptionHe,
          ar: shortDescriptionAr,
        },
        locale,
      ),
      images: sanitizeImages(images),
    };
  }

  private localizeString(
    { base, he, ar }: { base: string; he: string; ar: string },
    locale: Locale,
  ): string {
    switch (locale) {
      case Locale.ARABIC:
        return ar || base || he;
      case Locale.HEBREW:
        return he || base || ar;
      case Locale.ENGLISH:
        return base || he || ar;
      default:
        return base;
    }
  }
}
