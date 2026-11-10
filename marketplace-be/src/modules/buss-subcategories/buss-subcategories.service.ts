import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Locale } from 'src/common/enum';
import { disSelect } from 'src/common/utils/select.handling';
import { BussSubCategory } from './schema/buss-subCategory.schema';
import { GetSubCategoryQuery } from 'src/modules/buss-subcategories/queries/get-subcategory.query';
import { CampaignService } from 'src/modules/campaign/campaign.service';

@Injectable()
export class BussSubCategoriesService {
  constructor(
    @InjectModel('BussSubCategory')
    private readonly BussSubCategoryModel: Model<BussSubCategory>,
    private campaignService: CampaignService,
  ) {}

  async getOne(id: string, query: GetSubCategoryQuery) {
    const campDetails = await this.campaignService.findCampaignAndReturn(
      'code',
      query.campCode,
    );

    if (!campDetails?.category?.length) {
      return {};
    }

    const select = `${disSelect}`;
    const populate = {
      path: 'bussCategoryId',
      select,
    };
    const populate1 = {
      path: 'icon',
      select: disSelect,
    };
    const bussCategory = await this.BussSubCategoryModel.findById(id)
      .select(select)
      .populate(populate)
      .populate(populate1)
      .exec();

    const categoryIds = campDetails.category.map(cat => cat.id.toString());

    if (
      bussCategory?.bussCategoryId?.some(
        catId => !categoryIds.includes(catId.toString()),
      )
    ) {
      return {};
    }

    if (!query.locale || query.locale === Locale.HEBREW) {
      bussCategory.name = bussCategory?.hebrewName || bussCategory.name;
    }

    let parent;
    if (bussCategory?.bussCategoryId?.length) {
      const parentCat: any = bussCategory?.bussCategoryId[0];
      parent
        = !query.locale || query.locale === Locale.HEBREW
          ? parentCat?.hebrewName || parentCat?.name || ''
          : parentCat?.name || '';
    }

    return {
      id: bussCategory.id,
      name: bussCategory.name,
      parent,
    };
  }
}
