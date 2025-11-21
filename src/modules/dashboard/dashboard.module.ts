import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import {
  BussSubCategory,
  BussSubCategorySchema,
} from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { Product, ProductSchema } from '../products/schema/products.schema';
import {
  Business,
  BusinessSchema,
} from '../business/shared/schema/business.schema';

import { Trip, TripSchema } from '../trips/schema/trips.schema';
import { Event, EventSchema } from '../events/schema/events.schema';
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

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: BussSubCategory.name, schema: BussSubCategorySchema },
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: ExternalApi.name, schema: ExternalApiSchema },
      { name: Accessibility.name, schema: AccessibilitySchema },
      { name: GroupType.name, schema: GroupTypeSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Event.name, schema: EventSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
    ExternalApiModule,
    CampaignModule,
  ],
  controllers: [DashboardController],
  providers: [
    GetDefaultFiltersHandler,
    GetAllFeedItemsHandler,
    GetFiltersHandler,
    GetBusinessRawQueryHandler,
    GetPOIRawQueryHandler,
    GetEventRawQueryHandler,
    GetTripRawQueryHandler,
  ],
})
export class DashboardModule {}
