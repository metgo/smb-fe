import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';

import dbConfig from './core/dbConfig';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CityModule } from 'src/modules/city/city.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { JwtAuthModule } from 'src/modules/jwt-auth/jwt-auth.module';
import { MapPointModule } from './modules/mapPoint/mappoint.module';
import { BusinessModule } from './modules/business/business.module';
import { UsersModule } from 'src/modules/users/users.module';
import { MPCategoriesModule } from './modules/mpcategories/mpcategories.module';
import { MPSubCategoriesModule } from './modules/mpsubcategories/mpsubcategories.module';
import { MPSubCategoriesItemsModule } from './modules/mpsubcategoriesitems/mpsubcategoriesitems.module';
import { DMOModule } from './modules/dmo/dmo.module';
import { SocialMediaModule } from './modules/socialMedia/socialMedia.module';
import { IconsModule } from './modules/icons/icons.module';
import { MediaModule } from 'src/modules/media/media.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { ConfigModule } from 'src/services/config/config.module';
import { EncryptionModule } from './services/encryption/encryption.module';
import { BussCategoriesModule } from './modules/buss-categories/buss-categories.module';
import { BussSubCategoriesModule } from './modules/buss-subcategories/buss-subcategories.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { AccessibilityModule } from './modules/accessibility/accessibility.module';
import { GroupTypeModule } from './modules/group-type/group-type.module';
import { VoucherTemplateModule } from './modules/voucher-template/voucher-template.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { OrdersModule } from 'src/modules/orders/orders.modules';
import { OrderProductModule } from 'src/modules/order-product/order-product.modules';
import { VoucherModule } from './modules/vouchers/voucher.module';
import { PaymentsModule } from './services/payments/payments.module';
import { CampaignSegmentModule } from './modules/campaign-segments/campaignSegment.module';
import { HashModule } from './services/hash/hash.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { ReadFileModule } from 'src/services/read-file/read-file.module';
import { AuthorityModule } from 'src/modules/authority/authority.module';
import { StatsModule } from 'src/modules/stats/stats.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(dbConfig.uri),
    AuthModule,
    JwtAuthModule,
    ConfigModule,
    CityModule,
    GcpBucketModule,
    MapPointModule,
    MPCategoriesModule,
    MPSubCategoriesModule,
    MPSubCategoriesItemsModule,
    OrdersModule,
    OrderProductModule,
    BusinessModule,
    UsersModule,
    DMOModule,
    SocialMediaModule,
    IconsModule,
    MediaModule,
    EncryptionModule,
    BussCategoriesModule,
    BussSubCategoriesModule,
    ProductsModule,
    AccessibilityModule,
    GroupTypeModule,
    VoucherTemplateModule,
    CampaignModule,
    CampaignSegmentModule,
    VoucherModule,
    PaymentsModule,
    HashModule,
    ExternalApiModule,
    MailChimpModule,
    AuthorityModule,
    ReadFileModule,
    StatsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {}
