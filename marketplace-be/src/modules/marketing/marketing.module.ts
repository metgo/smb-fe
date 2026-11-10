import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { Marketing, MarketingSchema } from './schema/marketing.schema';

import { UsersModule } from '../users/users.module';
import { AuthorityModule } from '../authority/authority.module';
import { DMOModule } from '../dmo/dmo.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { MarketingController } from './controlller/marketing.controller';
import { GetMarketingByIdHandler } from './queries/handler/get-marketing-by-id.handler';
import { GetAllMarketingHandler } from './queries/handler/get-all-marketing.handler';
import { ExternalApiModule } from '../external-api/external-api.module';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Marketing.name, schema: MarketingSchema },
    ]),
    AuthorityModule,
    DMOModule,
    UsersModule,
    GcpBucketModule,
    ExternalApiModule,
  ],
  providers: [GetMarketingByIdHandler, GetAllMarketingHandler],
  controllers: [MarketingController],
})
export class MarketingModule {}
