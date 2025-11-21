import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { GroupType, GroupTypeSchema } from './schema/group-type.schema';
import { GroupTypeController } from './group-type.controller';
import { GroupTypeService } from './group-type.service';
import { UsersModule } from '../users/users.module';
import { GetAllGroupTypesHandler } from './queries/handler/get-all-grouptypes.handler';
import { CampaignModule } from '../campaign/campaign.module';
import {
  Business,
  BusinessSchema,
} from '../business/shared/schema/business.schema';
import { Trip, TripSchema } from '../trips/schema/trips.schema';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: GroupType.name, schema: GroupTypeSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
    AuthorityModule,
    DMOModule,
    UsersModule,
    CampaignModule,
  ],
  controllers: [GroupTypeController],
  providers: [GroupTypeService, GetAllGroupTypesHandler],
})
export class GroupTypeModule {}
