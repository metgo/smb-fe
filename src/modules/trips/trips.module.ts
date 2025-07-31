import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { GetTripBySlugHandler } from './queries/handlers/get-trip-by-slug.handler';
import { GetAllTripsHandler } from './queries/handlers/get-all-trips.handler';
import { TripController } from './controllers/trips.controller';
import { Trip, TripSchema } from './schema/trips.schema';
import { UsersModule } from '../users/users.module';
import { AuthorityModule } from '../authority/authority.module';
import { DMOModule } from '../dmo/dmo.module';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    CqrsModule,
    CampaignModule,
    UsersModule,
    AuthorityModule,
    DMOModule,
  ],
  controllers: [TripController],
  providers: [GetTripBySlugHandler, GetAllTripsHandler],
})
export class TripModule {}
