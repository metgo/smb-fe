import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiController } from 'src/modules/external-api/external-api.controller';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import {
  ExternalApi,
  ExternalApiSchema,
} from 'src/modules/external-api/schema/external-api.schema';

import { UsersModule } from 'src/modules/users/users.module';

import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { PaymentsModule } from 'src/services/payments/payments.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { ConfigModule } from 'src/services/config/config.module';
import { FindByIdAndPopulateHandler } from './queries/handler/find-by-id-and-populate.handler';
import { GetSiteInfoHandler } from './queries/handler/get-site-info.handler';
import { Trip, TripSchema } from '../trips/schema/trips.schema';
import { Campaign, CampaignSchema } from '../campaign/schema/campaign.schema';
import { GetPromotionalItemsHandler } from './queries/handler/get-promotional-items.handler';
import {
  BusinessesAudit,
  BusinessesAuditSchema,
} from '../business/shared/schema/businesses-audit.schema';
import {
  EventsAudit,
  EventsAuditSchema,
} from '../events/schema/events-audit.schema';
import {
  Business,
  BusinessSchema,
} from '../business/shared/schema/business.schema';
import { GetSiteSettingIdentityThemeHandler } from './queries/handler/get-site-setting-identity-theme.handler';
import { GetSiteSettingSeoHandler } from './queries/handler/get-site-setting-seo.handler';
import { GetSiteSettingSocialContactHandler } from './queries/handler/get-site-setting-social-contact.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: ExternalApi.name, schema: ExternalApiSchema },
      { name: BusinessesAudit.name, schema: BusinessesAuditSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: EventsAudit.name, schema: EventsAuditSchema },
      { name: Trip.name, schema: TripSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
    forwardRef(() => AuthorityModule),
    forwardRef(() => DMOModule),
    GcpBucketModule,
    MailChimpModule,
    forwardRef(() => UsersModule),
    PaymentsModule,
    ConfigModule,
  ],
  controllers: [ExternalApiController],
  providers: [
    ExternalApiServices,
    FindByIdAndPopulateHandler,
    GetSiteInfoHandler,
    GetPromotionalItemsHandler,
    GetSiteSettingIdentityThemeHandler,
    GetSiteSettingSeoHandler,
    GetSiteSettingSocialContactHandler,
  ],
  exports: [ExternalApiServices],
})
export class ExternalApiModule {}
