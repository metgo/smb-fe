import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { GetCombinedSearchHandler } from './query/handler/get-combined-search.handler';
import { SearchController } from './search.controller';
import {
  Business,
  BusinessSchema,
} from '../business/shared/schema/business.schema';
import { EventSchema } from '../events/schema/events.schema';
import { CampaignModule } from '../campaign/campaign.module';
import { Product, ProductSchema } from '../products/schema/products.schema';

@Module({
  imports: [
    CampaignModule,
    CqrsModule,
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: Event.name, schema: EventSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [GetCombinedSearchHandler],
})
export class SearchModule {}
