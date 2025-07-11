import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessMarketplaceController } from 'src/modules/business/marketplace/business-marketplace.controller';
import { BusinessService } from 'src/modules/business/shared/services/business.service';
import { BusinessSchema } from './shared/schema/business.schema';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ConfigModule } from 'src/services/config/config.module';
import { HashModule } from 'src/services/hash/hash.module';
import { Product, ProductSchema } from '../products/schema/products.schema';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { BankAccountModule } from 'src/modules/bank-account/bank-account.module';
import { BusinessAuditSchema } from 'src/modules/business/shared/schema/business-audit.schema';
import { EventsService } from 'src/modules/business/shared/services/event.service';
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

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'Business', schema: BusinessSchema },
      { name: Product.name, schema: ProductSchema },
      { name: 'BusinessAudit', schema: BusinessAuditSchema },
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
  controllers: [BusinessMarketplaceController, BusinessTourismController],
  providers: [
    BusinessService,
    EventsService,
    GetAllBusinessForMapHandler,
    GetAllApprovedBusinessesHandler,
    GetAllBusinessForMapTourismHandler,
    GetBusinessDetailForMapTourismHandler,
    GetBusinessDetailForTourismHandler,
    GetSearchRecommendationTourismHandler,
  ],
  exports: [BusinessService],
})
export class BusinessModule {}
