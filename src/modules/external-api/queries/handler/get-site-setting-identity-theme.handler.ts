import { Logger } from 'winston';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetSiteSettingIdentityThemeQuery } from '../get-site-setting-identity-theme.query';
import { ExternalApi } from '../../schema/external-api.schema';

const IDENTITY_THEME_FIELDS = {
  // Identity
  identifierId: 1,
  websiteNameEn: 1,
  websiteNameHe: 1,
  websiteNameAr: 1,
  sloganEn: 1,
  sloganHe: 1,
  sloganAr: 1,
  websiteUrl: 1,
  purpose: 1,
  isActive: 1,
  platformCharge: 1,

  // Branding
  logoUrl: 1,
  faviconUrl: 1,
  specialSymbolUrl: 1,
  bgImageUrl: 1,

  // Media
  desktopVideos: 1,
  mobileVideos: 1,
  desktopVideoThumbnails: 1,
  mobileVideoThumbnails: 1,

  // Theme
  primaryColor: 1,
  secondaryColor: 1,
  backgroundColor: 1,
  fontFamily: 1,
  fontSourceUrl: 1,
  buttonStyle: 1,
  buttonRadius: 1,
  darkModeEnabled: 1,

  // Analytics
  googleAnalyticsId: 1,
  googleTagManagerId: 1,
  facebookPixelId: 1,
  headerScripts: 1,
  footerScripts: 1,

  // Localization
  defaultLanguage: 1,
  multiLanguageEnabled: 1,
  timezone: 1,
  currency: 1,
  dateFormat: 1,
} as const;

const LOCALE_SUFFIX_MAP: Record<string, string> = {
  en: 'En',
  he: 'He',
  ar: 'Ar',
};

const getActiveItem = <T extends { isActive?: boolean }>(
  items?: T[],
): T | null => items?.find(item => item.isActive) ?? null;

@QueryHandler(GetSiteSettingIdentityThemeQuery)
export class GetSiteSettingIdentityThemeHandler
implements IQueryHandler<GetSiteSettingIdentityThemeQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    @InjectModel(ExternalApi.name)
    private readonly externalApiModel: Model<ExternalApi>,
  ) {}

  async execute(query: GetSiteSettingIdentityThemeQuery) {
    try {
      const siteSetting = await this.externalApiModel
        .findOne(
          {
            identifierId: query.identifierId,
            isDeleted: { $ne: true },
          },
          IDENTITY_THEME_FIELDS,
        )
        .lean();

      if (!siteSetting) {
        throw new NotFoundException(`Site Setting ${ServerErrors.NOT_FOUND}`);
      }

      this.logger.info('[SITE_SETTING]: IDENTITY & THEME FETCHED', {
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
        desktopVideos,
        mobileVideos,
        desktopVideoThumbnails,
        mobileVideoThumbnails,
        ...rest
      } = siteSetting;

      return {
        ...rest,
        websiteName: siteSetting[`websiteName${suffix}`] || websiteNameEn || '',
        slogan: siteSetting[`slogan${suffix}`] || sloganEn || '',
        desktopVideos: getActiveItem(desktopVideos),
        mobileVideos: getActiveItem(mobileVideos),
        desktopVideoThumbnails: getActiveItem(desktopVideoThumbnails),
        mobileVideoThumbnails: getActiveItem(mobileVideoThumbnails),
      };
    } catch (err) {
      this.logger.error('[SITE_SETTING]: FAILED TO GET IDENTITY & THEME', {
        err: err.message,
      });

      exceptionHandling(err);
    }
  }
}
