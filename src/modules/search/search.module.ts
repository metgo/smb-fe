import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { GetCombinedSearchHandler } from './query/handler/get-combined-search.handler';
import { NotifyNoResultHandler } from './command/handler/notify-no-result.handler';
import { SearchController } from './search.controller';
import { CampaignModule } from '../campaign/campaign.module';
import { ConfigModule } from 'src/services/config/config.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
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
import { Tags, TagsSchema } from 'src/modules/tags/schema/tags.schema';
import {
  BussCategory,
  BussCategorySchema,
} from 'src/modules/buss-categories/schema/buss.category.schema';
import {
  SearchDictionary,
  SearchDictionarySchema,
} from './schema/search-dictionary.schema';

@Module({
  imports: [
    CampaignModule,
    ConfigModule,
    CqrsModule,
    MailChimpModule,
    MongooseModule.forFeature([
      { name: BusinessesAudit.name, schema: BusinessesAuditSchema },
      { name: EventsAudit.name, schema: EventsAuditSchema },
      { name: ProductsAudit.name, schema: ProductsAuditSchema },
      { name: Tags.name, schema: TagsSchema },
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: SearchDictionary.name, schema: SearchDictionarySchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [GetCombinedSearchHandler, NotifyNoResultHandler],
})
export class SearchModule {}
