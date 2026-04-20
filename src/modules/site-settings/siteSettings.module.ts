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
  providers: [GetSiteSettingByExternalApiIdHandler],
  controllers: [SiteSettingsController],
})
export class SiteSettingsModule {}
