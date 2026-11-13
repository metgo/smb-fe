import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { updateById } from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CreateRewardCommand } from 'src/modules/rewards/interface/rewards.interface';
import { UpdateRewardDto } from 'src/modules/rewards/dto/update-reward.dto';
import { Rewards } from 'src/modules/rewards/schema/rewards.schema';

@Injectable()
export class RewardsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Rewards.name)
    private RewardModel: Model<Rewards>,
  ) {}

  async create(command: CreateRewardCommand): Promise<Rewards> {
    try {
      const newReward = new this.RewardModel({
        ...command,
        createdAt: new Date(),
      });

      const reward = await newReward.save();

      this.logger.info('[REWARD]: CREATED', { message: reward });

      return reward;
    } catch (err) {
      this.logger.error('[REWARD]: FAILED TO CREATED', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async update(
    id: string,
    command: UpdateRewardDto,
    loggedInUser: LoggedInUserInterface,
  ) {
    try {
      const updatedDTO = {
        ...command,
        updatedBy: loggedInUser.id,
      };

      const updatedReward = await updateById<Rewards>(
        this.RewardModel,
        id,
        updatedDTO,
      );

      this.logger.info('[REWARD]: UPDATED', { message: updatedReward });

      return updatedReward;
    } catch (err) {
      this.logger.error('[REWARD]: FAILED TO UPDATE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async updateUsage(id: string, noOfVoucherBought: number) {
    try {
      const updatedDto = { $inc: { totalVoucherCreated: noOfVoucherBought } };
      const updatedReward = await updateById<Rewards>(
        this.RewardModel,
        id,
        updatedDto,
      );

      this.logger.info('[REWARD]: UPDATED TOTAL NO OF VOUCHER CREATED', {
        message: updatedReward,
      });

      return updatedReward;
    } catch (err) {
      this.logger.error(
        '[REWARD]: FAILED TO UPDATE TOTAL NO OF VOUCHER CREATED',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }
}
