import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthorityModule } from 'src/modules/authority/authority.module';
import { Business } from 'src/modules/business/schema/business.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { CampaignSegment } from 'src/modules/campaign-segments/schema/campaignSegment.schema';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiController } from 'src/modules/external-api/controllers/external-api.controller';
import { ExternalAPIServiceController } from 'src/modules/external-api/controllers/external-api-services.controller';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import {
  ExternalApi,
  ExternalApiSchema,
} from 'src/modules/external-api/schema/external-api.schema';
import { Order } from 'src/modules/orders/schema/orders.schema';
import {
  OrderProduct,
  OrderProductSchema,
} from 'src/modules/order-product/schema/order-product.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { UsersModule } from 'src/modules/users/users.module';
import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';
import { ConfigModule } from 'src/services/config/config.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { PaymentsModule } from 'src/services/payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: Business },
      { name: BussCategory.name, schema: BussCategory },
      { name: BussSubCategory.name, schema: BussSubCategory },
      { name: Campaign.name, schema: Campaign },
      { name: CampaignSegment.name, schema: CampaignSegment },
      { name: ExternalApi.name, schema: ExternalApiSchema },
      { name: Order.name, schema: Order },
      { name: OrderProduct.name, schema: OrderProductSchema },
      { name: Product.name, schema: Product },
      { name: Voucher.name, schema: Voucher },
    ]),
    AuthModule,
    AuthorityModule,
    DMOModule,
    ConfigModule,
    MailChimpModule,
    PaymentsModule,
    UsersModule,
  ],
  controllers: [ExternalApiController, ExternalAPIServiceController],
  providers: [ExternalApiServices],
})
export class ExternalApiModule {}
