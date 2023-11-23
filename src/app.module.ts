import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import dbConfig from './core/dbConfig';
import { AuthModule } from 'src/modules/auth/auth.module';
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
import { BusinessMediaModule } from 'src/modules/business-media/business-media.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { ConfigModule } from 'src/services/config/config.module';
import { EncryptionModule } from './services/encryption/encryption.module';
import { BussCategoriesModule } from './modules/buss-categories/buss-categories.module';
import { BussSubCategoriesModule } from './modules/buss-subcategories/buss-subcategories.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { AccessibilityModule } from './modules/accessibility/accessibility.module';
import { GroupTypeModule } from './modules/group-type/group-type.module';
import { VoucherTemplateModule } from './modules/voucher-template/voucher-template.module';

@Module({
  imports: [
    MongooseModule.forRoot(dbConfig.uri),
    AuthModule,
    JwtAuthModule,
    ConfigModule,
    GcpBucketModule,
    MapPointModule,
    MPCategoriesModule,
    MPSubCategoriesModule,
    MPSubCategoriesItemsModule,
    BusinessModule,
    UsersModule,
    DMOModule,
    SocialMediaModule,
    IconsModule,
    BusinessMediaModule,
    EncryptionModule,
    BussCategoriesModule,
    BussSubCategoriesModule,
    ProductsModule,
    AccessibilityModule,
    GroupTypeModule,
    VoucherTemplateModule,
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
