import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';

import dbConfig from 'src/core/dbConfig';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CityModule } from 'src/modules/city/city.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { JwtAuthModule } from 'src/modules/jwt-auth/jwt-auth.module';
import { BankAccountModule } from 'src/modules/bank-account/bank-account.module';
import { BusinessModule } from './modules/business/business.module';
import { UsersModule } from 'src/modules/users/users.module';
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
import { HashModule } from './services/hash/hash.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { ReadFileModule } from 'src/services/read-file/read-file.module';
import { AuthorityModule } from 'src/modules/authority/authority.module';
import { StatsModule } from 'src/modules/stats/stats.module';
import { MockDataModule } from 'src/modules/mock-data/mock-data.modules';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { GAModule } from 'src/services/google-analytics/ga.module';
import winstonConfig from 'src/services/winston/winston';
import { WinstonLoggerModule } from 'src/services/winston/winston.module';
import { LoggingMiddleware } from 'src/services/middleware/logger';
import { CartModule } from 'src/modules/cart/cart.modules';
import { SmsModule } from 'src/services/sms/sms.module';
import { QRCodeModule } from 'src/services/qr-code/qr-code.module';
import { ThemeModule } from './modules/themes/theme.module';
import { EventsModule } from './modules/events/events.module';
import { TicketModule } from './modules/tickets/tickets.module';
import { SearchModule } from './modules/search/search.module';
import { GoogleSheetsModule } from './services/google-sheets/google-sheets.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { TripModule } from './modules/trips/trips.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(dbConfig.uri),
    WinstonModule.forRoot(winstonConfig),
    AuthModule,
    AuthorityModule,
    JwtAuthModule,
    ConfigModule,
    CityModule,
    GcpBucketModule,
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
    VoucherModule,
    PaymentsModule,
    HashModule,
    ExternalApiModule,
    MailChimpModule,
    ReadFileModule,
    StatsModule,
    MockDataModule,
    RewardsModule,
    GAModule,
    WinstonLoggerModule,
    BankAccountModule,
    CartModule,
    SmsModule,
    QRCodeModule,
    ThemeModule,
    EventsModule,
    TicketModule,
    SearchModule,
    GoogleSheetsModule,
    ContactUsModule,
    TripModule,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware) // Apply the logging middleware globally
      .forRoutes('*'); // Log all routes
  }
}
