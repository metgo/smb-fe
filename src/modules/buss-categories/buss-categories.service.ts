import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Locale } from 'src/common/enum';
import { disSelect } from 'src/common/utils/select.handling';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetCategoryQuery } from 'src/modules/buss-categories/queries/get-category-query';

@Injectable()
export class BussCategoriesService {
  constructor(
    @InjectModel('BussCategory')
    private BussCategoryModel: Model<BussCategory>,
    private campaignService: CampaignService,
  ) {}

  async getOne(id: string, query: GetCategoryQuery) {
    const campDetails = await this.campaignService.findCampaignAndReturn(
      'code',
      query.campCode,
    );

    if (!campDetails?.categoryIds?.length) {
      return {};
    }

    if (!campDetails.categoryIds.includes(new mongoose.Types.ObjectId(id))) {
      return {};
    }

    const select = `${disSelect}`;
    const populate = {
      path: 'icon iconBnW',
      select: disSelect,
    };
    const bussCategory = await this.BussCategoryModel.findById(id)
      .select(select)
      .populate(populate)
      .exec();

    if (!query.locale || query.locale === Locale.HEBREW) {
      bussCategory.name = bussCategory?.hebrewName || bussCategory.name;
    }

    return {
      id: bussCategory?.id,
      name: bussCategory?.name,
      icon: bussCategory?.icon,
    };
  }
}
