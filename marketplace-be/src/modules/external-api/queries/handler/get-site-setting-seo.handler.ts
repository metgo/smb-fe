import { Model } from 'mongoose';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ServerErrors } from 'src/common/constant';
import { GetSiteSettingSeoQuery } from '../get-site-setting-seo.query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ExternalApi } from '../../schema/external-api.schema';

const SEO_FIELDS = {
  // SEO & Meta
  metaTitle: 1,
  metaDescription: 1,
  metaKeywords: 1,
  ogTitle: 1,
  ogDescription: 1,
  ogImageUrl: 1,
  twitterCardTitle: 1,
  twitterCardDescription: 1,
  twitterCardImageUrl: 1,
  canonicalUrl: 1,
  robotsTxt: 1,
  sitemapUrl: 1,

  // Branding (used for og:site_name / fallbacks)
  logoUrl: 1,
  faviconUrl: 1,
  websiteNameEn: 1,
  websiteNameHe: 1,
  websiteNameAr: 1,
  sloganEn: 1,
  sloganHe: 1,
  sloganAr: 1,
} as const;

const LOCALE_SUFFIX_MAP: Record<string, string> = {
  en: 'En',
  he: 'He',
  ar: 'Ar',
};

@QueryHandler(GetSiteSettingSeoQuery)
export class GetSiteSettingSeoHandler
implements IQueryHandler<GetSiteSettingSeoQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    @InjectModel(ExternalApi.name)
    private readonly externalApiModel: Model<ExternalApi>,
  ) {}

  async execute(query: GetSiteSettingSeoQuery) {
    try {
      const siteSetting = await this.externalApiModel
        .findOne(
          {
            identifierId: query.identifierId,
            isDeleted: { $ne: true },
          },
          SEO_FIELDS,
        )
        .lean();

      if (!siteSetting) {
        throw new NotFoundException(`Site Setting ${ServerErrors.NOT_FOUND}`);
      }

      this.logger.info('[SITE_SETTING]: SEO DATA FETCHED', {
        websiteId: siteSetting._id,
      });

      const suffix = LOCALE_SUFFIX_MAP[query.locale] || 'En';

      const {
        websiteNameEn,
        websiteNameHe,
        websiteNameAr,
        sloganEn,
        sloganHe,
        sloganAr,
        ...rest
      } = siteSetting;

      return {
        ...rest,
        websiteName: siteSetting[`websiteName${suffix}`] || websiteNameEn || '',
        slogan: siteSetting[`slogan${suffix}`] || sloganEn || '',
      };
    } catch (err: any) {
      this.logger.error('[SITE_SETTING]: FAILED TO GET SEO DATA', {
        err: err.message,
      });

      exceptionHandling(err);
    }
  }
}
