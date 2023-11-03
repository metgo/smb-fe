import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import dbConfig from './core/dbConfig';
import { ConfigModule } from './services/config/config.module';
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

@Module({
  imports: [
    MongooseModule.forRoot(dbConfig.uri),
    AuthModule,
    JwtAuthModule,
    ConfigModule,
    MapPointModule,
    MPCategoriesModule,
    MPSubCategoriesModule,
    MPSubCategoriesItemsModule,
    BusinessModule,
    UsersModule,
    DMOModule,
    SocialMediaModule,
    IconsModule,
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
