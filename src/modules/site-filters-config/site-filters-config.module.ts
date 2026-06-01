import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from 'src/services/config/config.module';
import { UsersModule } from '../users/users.module';
import { AuthorityModule } from '../authority/authority.module';
import { DMOModule } from '../dmo/dmo.module';
import {
  SiteFiltersConfig,
  SiteFiltersConfigSchema,
} from './schema/site-filters-config.schema';
import { SiteSettingsController } from './controller/site-filters-config.controller';
import { GetSiteFiltersConfigByIdentifierIdHandler } from './queries/handler/get-site-filters-config-by-identifierId.handler';
import { GetProductsByTopicHandler } from './queries/handler/get-products-by-topic.handler';
import { GetProductsGroupedByTopicHandler } from './queries/handler/get-products-grouped-by-topic.handler';

import {
  ProductsAudit,
  ProductsAuditSchema,
} from '../products/schema/products-audit.schema';
import {
  BusinessesAudit,
  BusinessesAuditSchema,
} from '../business/shared/schema/businesses-audit.schema';
import {
  Business,
  BusinessSchema,
} from '../business/shared/schema/business.schema';
import { ProductsModule } from '../products/products.module';
import {
  BussCategory,
  BussCategorySchema,
} from '../buss-categories/schema/buss.category.schema';
import { Tags, TagsSchema } from '../tags/schema/tags.schema';
import { Campaign, CampaignSchema } from '../campaign/schema/campaign.schema';
import { ExternalApi, ExternalApiSchema } from '../external-api/schema/external-api.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SiteFiltersConfig.name, schema: SiteFiltersConfigSchema },
      { name: ExternalApi.name, schema: ExternalApiSchema },
      { name: ProductsAudit.name, schema: ProductsAuditSchema },
      { name: BusinessesAudit.name, schema: BusinessesAuditSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: Tags.name, schema: TagsSchema },
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    ConfigModule,
    UsersModule,
    AuthorityModule,
    DMOModule,
    forwardRef(() => ProductsModule),
  ],
  providers: [
    GetSiteFiltersConfigByIdentifierIdHandler,
    GetProductsByTopicHandler,
    GetProductsGroupedByTopicHandler,
  ],
  controllers: [SiteSettingsController],
})
export class SiteFiltersConfigModule {}
