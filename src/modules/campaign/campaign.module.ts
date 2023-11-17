import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignSchema } from './schema/campaign.schema';
import { CampaignController } from './campaign.controller';
import { UserSchema } from '../users/schema/users.schema';
import { UsersService } from '../users/users.services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Campaign', schema: CampaignSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [CampaignService, UsersService],
  controllers: [CampaignController],
})
export class CampaignModule {}
