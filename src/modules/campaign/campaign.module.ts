import { Module, forwardRef } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import {
  Campaign,
  CampaignSchema,
} from 'src/modules/campaign/schema/campaign.schema';
import { CampaignController } from 'src/modules/campaign/campaign.controller';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { UsersModule } from 'src/modules/users/users.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { EncryptionModule } from 'src/services/encryption/encryption.module';
import { ConfigModule } from 'src/services/config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    forwardRef(() => AuthorityModule),
    forwardRef(() => ExternalApiModule),
    GcpBucketModule,
    forwardRef(() => UsersModule),
    EncryptionModule,
    ConfigModule,
    forwardRef(() => DMOModule),
    RewardsModule,
  ],
  providers: [CampaignService],
  controllers: [CampaignController],
  exports: [CampaignService],
})
export class CampaignModule {}
