import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { AuthorityModule } from '../authority/authority.module';
import { DMOModule } from '../dmo/dmo.module';
import {
  SiteFiltersConfig,
  SiteFiltersConfigSchema,
} from './schema/site-filters-config.schema';
import { SiteSettingsController } from './controller/site-filters-config.controller';
import { GetSiteFiltersConfigByIdentifierIdHandler } from './queries/handler/get-site-filters-config-by-identifierId.handler';
import {
  ExternalApi,
  ExternalApiSchema,
} from '../external-api/schema/external-api.schema';
import {
  ProductsAudit,
  ProductsAuditSchema,
} from '../products/schema/products-audit.schema';
import {
  BusinessesAudit,
  BusinessesAuditSchema,
} from '../business/shared/schema/businesses-audit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SiteFiltersConfig.name, schema: SiteFiltersConfigSchema },
      { name: ExternalApi.name, schema: ExternalApiSchema },
      { name: ProductsAudit.name, schema: ProductsAuditSchema },
      { name: BusinessesAudit.name, schema: BusinessesAuditSchema },
    ]),
    UsersModule,
    AuthorityModule,
    DMOModule,
  ],
  providers: [GetSiteFiltersConfigByIdentifierIdHandler],
  controllers: [SiteSettingsController],
})
export class SiteFiltersConfigModule {}
