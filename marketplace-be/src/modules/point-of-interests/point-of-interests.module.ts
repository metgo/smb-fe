import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { CampaignModule } from 'src/modules/campaign/campaign.module';
import {
  ExternalApi,
  ExternalApiSchema,
} from 'src/modules/external-api/schema/external-api.schema';
import {
  Campaign,
  CampaignSchema,
} from 'src/modules/campaign/schema/campaign.schema';
import {
  PointOfInterestsAudit,
  PointOfInterestsAuditSchema,
} from './schema/point-of-interest-audit.schema';
import { PointOfInterestsController } from './point-of-interests.controller';
import { GetAllPOIsHandler } from './queries/handler/get-all-pois.handler';
import { GetPOIDetailHandler } from './queries/handler/get-poi-detail.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: PointOfInterestsAudit.name, schema: PointOfInterestsAuditSchema },
      { name: ExternalApi.name, schema: ExternalApiSchema },
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    CampaignModule,
  ],
  controllers: [PointOfInterestsController],
  providers: [GetAllPOIsHandler, GetPOIDetailHandler],
})
export class PointOfInterestsModule {}
