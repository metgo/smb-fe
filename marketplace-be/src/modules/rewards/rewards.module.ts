import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import {
  Rewards,
  RewardsSchema,
} from 'src/modules/rewards/schema/rewards.schema';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import { RewardController } from 'src/modules/rewards/rewards.controller';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rewards.name, schema: RewardsSchema }]),
    forwardRef(() => AuthorityModule),
    forwardRef(() => DMOModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [RewardController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
