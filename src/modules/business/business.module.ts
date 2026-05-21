import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessMarketplaceController } from 'src/modules/business/marketplace/business-marketplace.controller';
import { BusinessService } from 'src/modules/business/shared/services/business.service';
import { Business, BusinessSchema } from './shared/schema/business.schema';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ConfigModule } from 'src/services/config/config.module';
import { HashModule } from 'src/services/hash/hash.module';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { BankAccountModule } from 'src/modules/bank-account/bank-account.module';
import { BusinessAuditSchema } from 'src/modules/business/shared/schema/business-audit.schema';
import { MediaModule } from 'src/modules/media/media.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { UsersModule } from 'src/modules/users/users.module';
import { GetAllBusinessForMapHandler } from './marketplace/queries/handler/get-all-business-for-map.handler';
import { GetAllApprovedBusinessesHandler } from './tourism/queries/handler/get-all-approved-businesses.handler';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { BusinessTourismController } from './tourism/business-tourism.controller';
import { GetAllBusinessForMapTourismHandler } from './tourism/queries/handler/get-all-businesses-for-map.handler';
import { GetBusinessDetailForMapTourismHandler } from './tourism/queries/handler/get-business-detail-for-map.handler';
import { GetBusinessDetailForTourismHandler } from './tourism/queries/handler/get-business-detail.handler';
import { GetSearchRecommendationTourismHandler } from './tourism/queries/handler/get-search-recommendation.handler';
import { GetAllBusinessesRawQueryHandler } from './tourism/queries/handler/get-all-businesses-rawquery.handler';
import {
  BusinessesAudit,
  BusinessesAuditSchema,
} from './shared/schema/businesses-audit.schema';
import {
  ProductsAudit,
  ProductsAuditSchema,
} from '../products/schema/products-audit.schema';
import { BusinessSharedController } from './shared/controllers/business.controller';
import { Tags, TagsSchema } from 'src/modules/tags/schema/tags.schema';
import {
  BussCategory,
  BussCategorySchema,
} from 'src/modules/buss-categories/schema/buss.category.schema';
import {
  ExternalApi,
  ExternalApiSchema,
} from 'src/modules/external-api/schema/external-api.schema';
import {
  Campaign,
  CampaignSchema,
} from 'src/modules/campaign/schema/campaign.schema';
import { CreateBusinessHandler } from './command/handler/create-business.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: ProductsAudit.name, schema: ProductsAuditSchema },
      { name: 'BusinessAudit', schema: BusinessAuditSchema },
      { name: BusinessesAudit.name, schema: BusinessesAuditSchema },
      { name: Tags.name, schema: TagsSchema },
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: ExternalApi.name, schema: ExternalApiSchema },
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    ConfigModule,
    HashModule,
    MediaModule,
    BankAccountModule,
    forwardRef(() => CampaignModule),
    forwardRef(() => VoucherModule),
    forwardRef(() => UsersModule),
    forwardRef(() => DMOModule),
    forwardRef(() => ProductsModule),
  ],
  controllers: [
    BusinessMarketplaceController,
    BusinessTourismController,
    BusinessSharedController,
  ],
  providers: [
    BusinessService,
    CreateBusinessHandler,
    GetAllBusinessForMapHandler,
    GetAllApprovedBusinessesHandler,
    GetAllBusinessForMapTourismHandler,
    GetBusinessDetailForMapTourismHandler,
    GetBusinessDetailForTourismHandler,
    GetSearchRecommendationTourismHandler,
    GetAllBusinessesRawQueryHandler,
  ],
  exports: [BusinessService],
})
export class BusinessModule {}
