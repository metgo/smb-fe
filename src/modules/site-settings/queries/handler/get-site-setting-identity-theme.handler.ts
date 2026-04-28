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
import { GetSiteSettingIdentityThemeQuery } from '../get-site-setting-identity-theme.query';

const IDENTITY_THEME_FIELDS = {
  // Identity
  websiteName: 1,
  slogan: 1,
  logoUrl: 1,
  faviconUrl: 1,
  splashLogoUrl: 1,
  // Media
  desktopVideos: 1,
  mobileVideos: 1,
  // Theme
  primaryColor: 1,
  secondaryColor: 1,
  backgroundColor: 1,
  fontFamily: 1,
  fontSourceUrl: 1,
  buttonStyle: 1,
  buttonRadius: 1,
  darkModeEnabled: 1,
  // Localization
  defaultLanguage: 1,
  multiLanguageEnabled: 1,
  timezone: 1,
  currency: 1,
  dateFormat: 1,
} as const;

@QueryHandler(GetSiteSettingIdentityThemeQuery)
export class GetSiteSettingIdentityThemeHandler
implements IQueryHandler<GetSiteSettingIdentityThemeQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(SiteSetting.name)
    private readonly SiteSettingModel: Model<SiteSetting>,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
  ) {}

  async execute(query: GetSiteSettingIdentityThemeQuery) {
    try {
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId: query.identifierId,
      });

      if (!externalApi) {
        throw new NotFoundException(`External Api ${ServerErrors.NOT_FOUND}`);
      }

      const siteSetting = await this.SiteSettingModel.findOne(
        { externalApiId: externalApi._id, isDeleted: { $ne: true } },
        IDENTITY_THEME_FIELDS,
      ).lean();

      if (!siteSetting) {
        throw new NotFoundException(`Site Setting ${ServerErrors.NOT_FOUND}`);
      }

      this.logger.info('[SITE_SETTING]: IDENTITY & THEME FETCHED', {
        externalApiId: externalApi._id,
      });

      return {
        ...siteSetting,
        externalApiId: externalApi._id,
        desktopVideos: siteSetting.desktopVideos.find(v => v.isActive) ?? null,
        mobileVideos: siteSetting.mobileVideos.find(v => v.isActive) ?? null,
      };
    } catch (err) {
      this.logger.error('[SITE_SETTING]: FAILED TO GET IDENTITY & THEME', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
