import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignSchema } from './schema/campaign.schema';
import { CampaignController } from './campaign.controller';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { UsersModule } from '../users/users.module';
import { EncryptionModule } from 'src/services/encryption/encryption.module';
import { ConfigModule } from 'src/services/config/config.module';
import { DMOModule } from '../dmo/dmo.module';
import { CampaignSegmentModule } from '../campaign-segments/campaignSegment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Campaign', schema: CampaignSchema },
    ]),
    GcpBucketModule,
    UsersModule,
    EncryptionModule,
    ConfigModule,
    DMOModule,
    CampaignSegmentModule,
  ],
  providers: [
    CampaignService,
  ],
  controllers: [CampaignController],
  exports: [CampaignService],
})
export class CampaignModule {}
