import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { SubmitBusinessRegistrationHandler } from './commands/handler/submit-business-registration.handler';

import {
  BussSubCategory,
  BussSubCategorySchema,
} from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { CampaignModule } from 'src/modules/campaign/campaign.module';

import { Trip, TripSchema } from '../trips/schema/trips.schema';
import { DashboardController } from './dashboard.controller';
import {
  BussCategory,
  BussCategorySchema,
} from '../buss-categories/schema/buss.category.schema';
import {
  ExternalApi,
  ExternalApiSchema,
} from '../external-api/schema/external-api.schema';
import {
  Accessibility,
  AccessibilitySchema,
} from '../accessibility/schema/accessibility.schema';
import {
  GroupType,
  GroupTypeSchema,
} from '../group-type/schema/group-type.schema';
import { ExternalApiModule } from '../external-api/external-api.module';
import { GetDefaultFiltersHandler } from './queries/handler/get-default-filters.handler';
import { GetAllFeedItemsHandler } from './queries/handler/get-all-feed-items.handler';
import { GetFiltersHandler } from './queries/handler/get-filters.handler';
import { GetBusinessRawQueryHandler } from './queries/handler/get-business-raw-query.handler';
import { GetEventRawQueryHandler } from './queries/handler/get-event-raw-query.handler';
import { GetTripRawQueryHandler } from './queries/handler/get-trip-raw-query.handler';
import { GetPOIRawQueryHandler } from './queries/handler/get-poi-raw-query.handler';
import { GetProductRawQueryHandler } from './queries/handler/get-product-raw-query.handler';
import {
  EventsAudit,
  EventsAuditSchema,
} from '../events/schema/events-audit.schema';
import {
  ProductsAudit,
  ProductsAuditSchema,
} from '../products/schema/products-audit.schema';
import {
  BusinessesAudit,
  BusinessesAuditSchema,
} from '../business/shared/schema/businesses-audit.schema';
import { GoogleSheetsModule } from 'src/services/google-sheets/google-sheets.module';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: BussSubCategory.name, schema: BussSubCategorySchema },
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: ExternalApi.name, schema: ExternalApiSchema },
      { name: Accessibility.name, schema: AccessibilitySchema },
      { name: GroupType.name, schema: GroupTypeSchema },
      { name: BusinessesAudit.name, schema: BusinessesAuditSchema },
      { name: EventsAudit.name, schema: EventsAuditSchema },
      { name: ProductsAudit.name, schema: ProductsAuditSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
    ExternalApiModule,
    CampaignModule,
    GoogleSheetsModule,
  ],
  controllers: [DashboardController],
  providers: [
    SubmitBusinessRegistrationHandler,
    GetDefaultFiltersHandler,
    GetAllFeedItemsHandler,
    GetFiltersHandler,
    GetBusinessRawQueryHandler,
    GetPOIRawQueryHandler,
    GetEventRawQueryHandler,
    GetTripRawQueryHandler,
    GetProductRawQueryHandler,
  ],
})
export class DashboardModule {}
