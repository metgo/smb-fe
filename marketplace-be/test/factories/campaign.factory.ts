import { range } from 'lodash';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import { BaseFactory } from 'test/factories/base.factory';
import {
  Campaign,
  CampaignSchema,
} from 'src/modules/campaign/schema/campaign.schema';
import { CampaignStatus } from 'src/common/enum';

const CampaignModel = mongoose.model(Campaign.name, CampaignSchema);
export class CampaignFactory implements BaseFactory<Campaign> {
  static new() {
    return new CampaignFactory();
  }

  async create(campaign: Partial<Campaign> = {}): Promise<any> {
    const defaultCampaign = {
      _id: new mongoose.Types.ObjectId(),
      name: faker.person.firstName(),
      status: CampaignStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(),
    };
    const newCampaign = await CampaignModel.create({
      ...defaultCampaign,
      ...campaign,
    });
    return newCampaign;
  }

  async createMany(times: number, campaign: Partial<Campaign> = {}) {
    return await Promise.all(range(times).map(() => this.create(campaign)));
  }
}
