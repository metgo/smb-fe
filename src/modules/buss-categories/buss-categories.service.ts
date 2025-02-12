import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Locale } from 'src/common/enum';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetAllCategoriesQuery } from 'src/modules/buss-categories/queries/get-all-categories.query';
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

  async getAllCategories(query: GetAllCategoriesQuery) {
    const {
      page, limit, search, locale, campCode,
    } = query;

    const campDetails = await this.campaignService.findCampaignAndReturn(
      'code',
      campCode,
    );

    if (!campDetails?.categoryIds?.length) {
      return [];
    }

    const queryPage = page ? Number(page) : null;
    const queryLimit = limit ? Number(limit) : null;

    let findQuery: any = {
      deletedAt: { $in: [null] },
      isDeleted: false,
      deletedBy: null,
      _id: { $in: campDetails.categoryIds },
    };
    const select = '_id name hebrewName';

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }

    const categories = await queryhandler<BussCategory>(
      this.BussCategoryModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        sort: 'createdAt',
        languageQuery: locale || Locale.HEBREW,
      },
    );

    categories.data = await Promise.all(
      categories?.data?.map(cat => ({
        id: cat.id,
        name: cat.name,
      })),
    );

    return categories;
  }

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
