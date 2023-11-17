import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign } from './schema/campaign.schema';
import { findOneByFieldName, findOneByFieldNameExcludeId } from 'src/core/helper/query-helper';
import { createCampaignDto } from './dto/createCampaign.dto';

@Injectable()
export class CampaignService {
  constructor(
        @InjectModel('Campaign')
    private CampaignModel: Model<Campaign>,
  ) { }

  async createCampaign(dto: createCampaignDto, userId: string): Promise<Campaign> {
    const newCampaign = new this.CampaignModel({ ...dto, createdBy: userId });
    await newCampaign.save();
    return newCampaign;
  }

  async findByFieldName(fieldName: keyof Campaign, items: string): Promise<boolean> {
    const bussEmail = await findOneByFieldName<Campaign>(this.CampaignModel, fieldName, items);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(fieldName: keyof Campaign, items: string, id:string): Promise<boolean> {
    const bussEmail = await findOneByFieldNameExcludeId<Campaign>(this.CampaignModel, fieldName, items, id);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
