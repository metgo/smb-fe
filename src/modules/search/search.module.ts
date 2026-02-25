import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { GetCombinedSearchHandler } from './query/handler/get-combined-search.handler';
import { SearchController } from './search.controller';
import { CampaignModule } from '../campaign/campaign.module';
import {
  BusinessesAudit,
  BusinessesAuditSchema,
} from '../business/shared/schema/businesses-audit.schema';
import {
  EventsAudit,
  EventsAuditSchema,
} from '../events/schema/events-audit.schema';
import {
  ProductsAudit,
  ProductsAuditSchema,
} from '../products/schema/products-audit.schema';

@Module({
  imports: [
    CampaignModule,
    CqrsModule,
    MongooseModule.forFeature([
      { name: BusinessesAudit.name, schema: BusinessesAuditSchema },
      { name: EventsAudit.name, schema: EventsAuditSchema },
      { name: ProductsAudit.name, schema: ProductsAuditSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [GetCombinedSearchHandler],
})
export class SearchModule {}
