import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import {
  ExternalApi,
  ExternalApiSchema,
} from '../external-api/schema/external-api.schema';
import { SiteSettingsController } from './siteSettings.controller';
import { SiteSetting, SiteSettingSchema } from './schema/site-settings.schema';
import { GetSiteSettingByExternalApiIdHandler } from './queries/handler/get-site-setting-by-external-api-id.handler';
import { GetSiteSettingSeoHandler } from './queries/handler/get-site-setting-seo.handler';
import { GetSiteSettingPartnersHandler } from './queries/handler/get-site-setting-partners.handler';
import { GetSiteSettingSocialContactHandler } from './queries/handler/get-site-setting-social-contact.handler';
import { GetSiteSettingIdentityThemeHandler } from './queries/handler/get-site-setting-identity-theme.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: SiteSetting.name,
        schema: SiteSettingSchema,
      },
      {
        name: ExternalApi.name,
        schema: ExternalApiSchema,
      },
    ]),
  ],
  providers: [
    GetSiteSettingByExternalApiIdHandler,
    GetSiteSettingPartnersHandler,
    GetSiteSettingSeoHandler,
    GetSiteSettingSocialContactHandler,
    GetSiteSettingIdentityThemeHandler,
  ],
  controllers: [SiteSettingsController],
})
export class SiteSettingsModule {}
