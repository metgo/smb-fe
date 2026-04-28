import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { SiteSetting } from '../../schema/site-settings.schema';
import { GetSiteSettingSeoQuery } from '../get-site-setting-seo.query';

const SEO_FIELDS = {
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
  // Analytics
  googleAnalyticsId: 1,
  googleTagManagerId: 1,
  facebookPixelId: 1,
  headerScripts: 1,
  footerScripts: 1,
} as const;

@QueryHandler(GetSiteSettingSeoQuery)
export class GetSiteSettingSeoHandler
implements IQueryHandler<GetSiteSettingSeoQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(SiteSetting.name)
    private readonly SiteSettingModel: Model<SiteSetting>,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
  ) {}

  async execute(query: GetSiteSettingSeoQuery) {
    try {
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId: query.identifierId,
      });

      if (!externalApi) {
        throw new NotFoundException(`External Api ${ServerErrors.NOT_FOUND}`);
      }

      const siteSetting = await this.SiteSettingModel.findOne(
        { externalApiId: externalApi._id, isDeleted: { $ne: true } },
        SEO_FIELDS, // project only SEO fields
      ).lean();

      if (!siteSetting) {
        throw new NotFoundException(`Site Setting ${ServerErrors.NOT_FOUND}`);
      }

      this.logger.info('[SITE_SETTING]: SEO DATA FETCHED', {
        externalApiId: externalApi._id,
      });

      return {
        siteSetting,
        externalApiId: externalApi._id,
      };
    } catch (err: any) {
      this.logger.error('[SITE_SETTING]: FAILED TO GET SEO DATA', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
