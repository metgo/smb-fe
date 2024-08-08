import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthorityModule } from 'src/modules/authority/authority.module';
import { Business } from 'src/modules/business/schema/business.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
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
import {
  Rewards,
  RewardsSchema,
} from 'src/modules/rewards/schema/rewards.schema';
import { UsersModule } from 'src/modules/users/users.module';
import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';
import { ConfigModule } from 'src/services/config/config.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { PaymentsModule } from 'src/services/payments/payments.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { JwtAuthModule } from 'src/modules/jwt-auth/jwt-auth.module';
import { User, UserSchema } from 'src/modules/users/schema/users.schema';
import { ConfigService } from 'src/services/config/config.service';
import { HashModule } from 'src/services/hash/hash.module';

const configService = new ConfigService();
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: Business },
      { name: BussCategory.name, schema: BussCategory },
      { name: BussSubCategory.name, schema: BussSubCategory },
      { name: Campaign.name, schema: Campaign },
      { name: ExternalApi.name, schema: ExternalApiSchema },
      { name: Order.name, schema: Order },
      { name: OrderProduct.name, schema: OrderProductSchema },
      { name: Product.name, schema: Product },
      { name: Rewards.name, schema: RewardsSchema },
      { name: User.name, schema: UserSchema },
      { name: Voucher.name, schema: Voucher },
    ]),
    AuthModule,
    AuthorityModule,
    DMOModule,
    ConfigModule,
    HashModule,
    JwtAuthModule,
    JwtModule.register({
      global: true,
      secret: configService.JWT.ACCESS_TOKEN,
      signOptions: { expiresIn: configService.JWT.TOKEN_EXPIRES },
    }),
    MailChimpModule,
    PaymentsModule,
    UsersModule,
    GcpBucketModule,
  ],
  controllers: [ExternalApiController, ExternalAPIServiceController],
  providers: [ExternalApiServices],
})
export class ExternalApiModule {}
