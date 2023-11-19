import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignSchema } from './schema/campaign.schema';
import { CampaignController } from './campaign.controller';
import { UserSchema } from '../users/schema/users.schema';
import { UsersService } from '../users/users.services';
import { EncryptionService } from 'src/services/encryption/encryption.service';
import { ConfigService } from 'src/services/config/config.service';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Campaign', schema: CampaignSchema },
      { name: 'User', schema: UserSchema },
    ]),
    GcpBucketModule,
  ],
  providers: [
    CampaignService, UsersService, EncryptionService, ConfigService,
  ],
  controllers: [CampaignController],
})
export class CampaignModule {}
