import { Logger } from 'winston';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { Locale } from 'src/common/enum';
import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { SiteFiltersConfigStatus } from '../../site-filters-config.type';
import { SiteFiltersConfig } from '../../schema/site-filters-config.schema';
import { GetSiteConfigByIdentifierIdQuery } from '../get-site-config-by-identifierId.query';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { ServicesTypes } from 'src/modules/dashboard/dashboard.type';

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
  ) {}

  async execute(queries: GetSiteConfigByIdentifierIdQuery) {
    try {
      const { identifierId, query } = queries;

      const siteSetting = await this.ExternalApiModel.findOne({
        identifierId,
      }).select('_id');

      if (!siteSetting) {
        throw new NotFoundException(`SITE ${ServerErrors.NOT_FOUND}`);
      }

      const select
        = 'siteTopics';

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
          {
            path: 'siteTopics.siteCategories.poiIds',
            select:
              'slug name nameHe nameAr shortDescription shortDescriptionHe shortDescriptionAr geoLocation images primaryCategoryId groupTypesId accessibilitiesId tagsId address',
          },
          {
            path: 'siteTopics.siteCategories.eventIds',
            select:
              'slug name shortDescription geoLocation images primaryCategoryId groupTypesId accessibilitiesId address dayDescription',
          },
          {
            path: 'siteTopics.siteCategories.tripIds',
            select: 'slug name shortDescription images groupTypesId accessibilitiesId',
          },
          {
            path: 'siteTopics.siteCategories.fundayIds',
            select: 'slug name shortDescription images groupTypesId accessibilitiesId',
          },
          {
            path: 'siteTopics.siteCategories.productIds',
            select:
              'slug name nameHe nameAr shortDescription shortDescriptionHe shortDescriptionAr images primaryCategoryId groupTypesId accessibilitiesId tagsId address',
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

      // Filter out expired events (where all dayDescription dates are in the past)
      // Also deduplicate eventIds across all categories to prevent duplicates
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const seenEventIds = new Set<string>();

      const isEventExpired = (event: any): boolean => {
        const dayDescriptions: Array<{ date: Date }> = event.dayDescription ?? [];
        if (dayDescriptions.length === 0) return false; // no dates — keep it
        return !dayDescriptions.some(d => new Date(d.date) >= today);
      };

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

      result.siteTopics = (result.siteTopics || [])
        .filter((topic: any) => !topic.isArchived)
        .map((topic: any) => {
          const {
            titleHe,
            titleAr,
            descriptionHe,
            descriptionAr,
            icon,
            colors,
            ...topicRest
          } = topic;
          return {
            ...topicRest,
            icon,
            colors,
            title: this.localizeString(
              { base: topic.title, he: titleHe, ar: titleAr },
              locale,
            ),
            description: this.localizeString(
              { base: topic.description, he: descriptionHe, ar: descriptionAr },
              locale,
            ),
            siteCategories: (topic.siteCategories || [])
              .filter((cat: any) => !cat.isArchived)
              .map((cat: any) => {
                const {
                  titleHe: catTitleHe,
                  titleAr: catTitleAr,
                  descriptionHe: catDescHe,
                  descriptionAr: catDescAr,
                  ...catRest
                } = cat;
                return {
                  ...catRest,
                  title: this.localizeString(
                    { base: cat.title, he: catTitleHe, ar: catTitleAr },
                    locale,
                  ),
                  description: this.localizeString(
                    { base: cat.description, he: catDescHe, ar: catDescAr },
                    locale,
                  ),
                  businessIds: (cat.businessIds || [])
                    .filter(Boolean)
                    .map((item: any) => ({ ...this.localizeItem(item, locale), serviceType: ServicesTypes.BUSINESS })),
                  poiIds: (cat.poiIds || [])
                    .filter(Boolean)
                    .map((item: any) => ({
                      ...this.localizeItem(item, locale),
                      serviceType: ServicesTypes.POINT_OF_INTEREST,
                    })),
                  productIds: (cat.productIds || [])
                    .filter(Boolean)
                    .map((item: any) => ({
                      ...this.localizeItem(item, locale),
                      serviceType: ServicesTypes.PRODUCT,
                    })),
                  eventIds: (cat.eventIds || [])
                    .filter((event: any) => {
                      if (!event?._id || !event || isEventExpired(event)) return false;
                      const eventIdStr = event._id.toString();
                      if (seenEventIds.has(eventIdStr)) return false;
                      seenEventIds.add(eventIdStr);
                      return true;
                    })
                    .map(({ images, dayDescription, ...item }: any) => ({
                      ...item,
                      images: this.sanitizeImages(images),
                      serviceType: ServicesTypes.EVENT,
                    })),
                  tripIds: (cat.tripIds || [])
                    .filter(Boolean)
                    .map(({ images, ...item }: any) => ({
                      ...item,
                      images: this.sanitizeImages(images),
                      serviceType: ServicesTypes.TRIPS,
                    })),
                  fundayIds: (cat.fundayIds || [])
                    .filter(Boolean)
                    .map(({ images, ...item }: any) => ({
                      ...item,
                      images: this.sanitizeImages(images),
                      serviceType: ServicesTypes.FUNDAY,
                    })),
                };
              }),
          };
        });

      return result;
    } catch (error) {
      this.logger.error('[SITE CONFIG]: FAILED TO GET SITE CONFIG', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  private sanitizeImages(images: any[]): any[] {
    if (!Array.isArray(images)) return images;
    return images.map(({ subCoordinates, ...img }) => img);
  }

  private localizeItem(item: any, locale: Locale) {
    const {
      name, nameHe, nameAr,
      shortDescription, shortDescriptionHe, shortDescriptionAr,
      images,
      ...rest
    } = item;
    return {
      ...rest,
      name: this.localizeString({ base: name, he: nameHe, ar: nameAr }, locale),
      shortDescription: this.localizeString(
        { base: shortDescription, he: shortDescriptionHe, ar: shortDescriptionAr },
        locale,
      ),
      images: this.sanitizeImages(images),
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
