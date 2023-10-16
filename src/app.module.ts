import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import dbConfig from './core/dbConfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './services/config/config.module';
import { MapPointModule } from './modules/mapPoint/mappoint.module';
import { BusinessModule } from './modules/business/business.module';

@Module({
  imports: [
    MongooseModule.forRoot(dbConfig.uri),
    ConfigModule,
    MapPointModule,
    BusinessModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
