import { Module, forwardRef } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignSchema } from './schema/campaign.schema';
import { CampaignController } from './campaign.controller';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { EncryptionModule } from 'src/services/encryption/encryption.module';
import { ConfigModule } from 'src/services/config/config.module';
import { DMOModule } from '../dmo/dmo.module';
import { CampaignSegmentModule } from '../campaign-segments/campaignSegment.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Campaign', schema: CampaignSchema }]),
    GcpBucketModule,
    forwardRef(() => UsersModule),
    EncryptionModule,
    ConfigModule,
    DMOModule,
    CampaignSegmentModule,
  ],
  providers: [CampaignService],
  controllers: [CampaignController],
  exports: [CampaignService],
})
export class CampaignModule {}
