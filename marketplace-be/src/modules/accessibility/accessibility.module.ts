import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AccessibilityController } from 'src/modules/accessibility/accessibility.controller';
import { AccessibilityService } from 'src/modules/accessibility/accessibility.service';
import {
  Accessibility,
  AccessibilitySchema,
} from 'src/modules/accessibility/schema/accessibility.schema';
import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { UsersModule } from 'src/modules/users/users.module';
import { GetAllAccessibilityHandler } from './queries/handler/get-all-accessibility.handler';

import { Trip, TripSchema } from '../trips/schema/trips.schema';
import { CampaignModule } from '../campaign/campaign.module';
import {
  BusinessesAudit,
  BusinessesAuditSchema,
} from '../business/shared/schema/businesses-audit.schema';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Accessibility.name, schema: AccessibilitySchema },
      { name: BusinessesAudit.name, schema: BusinessesAuditSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
    AuthorityModule,
    DMOModule,
    UsersModule,
    CampaignModule,
  ],
  controllers: [AccessibilityController],
  providers: [AccessibilityService, GetAllAccessibilityHandler],
})
export class AccessibilityModule {}
