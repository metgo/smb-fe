import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { updateById } from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CreateRewardCommand } from 'src/modules/rewards/interface/rewards.interface';
import { UpdateRewardDto } from 'src/modules/rewards/dto/update-reward.dto';
import { Rewards } from 'src/modules/rewards/schema/rewards.schema';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Rewards.name)
    private RewardModel: Model<Rewards>,
  ) {}

  async create(command: CreateRewardCommand): Promise<Rewards> {
    const newReward = new this.RewardModel({
      ...command,
    });

    const reward = await newReward.save();

    return reward;
  }

  async update(
    id: string,
    command: UpdateRewardDto,
    loggedInUser: LoggedInUserInterface,
  ) {
    const updatedDTO = {
      ...command,
      updatedBy: loggedInUser.id,
    };

    const updatedReward = await updateById<Rewards>(
      this.RewardModel,
      id,
      updatedDTO,
    );

    return updatedReward;
  }

  async updateUsage(id: string, noOfVoucherBought: number) {
    const updatedDto = { $inc: { totalVoucherCreated: noOfVoucherBought } };
    const updatedReward = await updateById<Rewards>(
      this.RewardModel,
      id,
      updatedDto,
    );

    return updatedReward;
  }
}
