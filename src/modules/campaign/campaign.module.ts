import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignSchema } from './schema/campaign.schema';
import { CampaignController } from './campaign.controller';
import { UserSchema } from '../users/schema/users.schema';
import { EncryptionService } from 'src/services/encryption/encryption.service';
import { ConfigService } from 'src/services/config/config.service';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { UsersModule } from '../users/users.module';
import { DMOSchema } from '../dmo/schema/dmo.schema';
import { DMOService } from '../dmo/dmo.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Campaign', schema: CampaignSchema },
      { name: 'User', schema: UserSchema },
      { name: 'DMO', schema: DMOSchema },
    ]),
    GcpBucketModule,
    UsersModule,
  ],
  providers: [
    CampaignService, EncryptionService, ConfigService, DMOService,
  ],
  controllers: [CampaignController],
})
export class CampaignModule {}
