import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Locale } from 'src/common/enum';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { BussSubCategory } from './schema/buss-subCategory.schema';
import { GetAllSubCategoriesQuery } from 'src/modules/buss-subcategories/queries/get-all-subcategories.query';
import { GetSubCategoryQuery } from 'src/modules/buss-subcategories/queries/get-subcategory.query';
import { CampaignService } from 'src/modules/campaign/campaign.service';

@Injectable()
export class BussSubCategoriesService {
  constructor(
    @InjectModel('BussSubCategory')
    private readonly BussSubCategoryModel: Model<BussSubCategory>,
    private campaignService: CampaignService,
  ) {}

  async getAll(
    queries: GetAllSubCategoriesQuery,
  ): Promise<BussSubCategory & any> {
    const {
      page, limit, search, locale, campCode, bussCategoryId,
    } = queries;

    const campDetails = await this.campaignService.findCampaignAndReturn(
      'code',
      campCode,
    );

    if (!campDetails?.categoryIds?.length) {
      return [];
    }

    let categoryIds = campDetails?.categoryIds;

    if (bussCategoryId) {
      if (
        !campDetails.categoryIds.includes(
          new mongoose.Types.ObjectId(bussCategoryId),
        )
      ) {
        return [];
      }
      categoryIds = [new mongoose.Types.ObjectId(bussCategoryId)];
    }

    const queryPage = page ? Number(page) : null;
    const queryLimit = limit ? Number(limit) : null;

    let findQuery: any = { bussCategoryId: { $in: categoryIds } };
    const select = '_id name hebrewName';

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }

    // eslint-disable-next-line prefer-const
    const populate = {
      path: 'bussCategoryId',
      select,
      match: { delatedAt: { $in: [false, null] } },
    };

    const bussSubCategory = await queryhandler<BussSubCategory>(
      this.BussSubCategoryModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        sort: 'name',
        languageQuery: locale || Locale.HEBREW,
      },
    );

    bussSubCategory.data = await Promise.all(
      bussSubCategory?.data?.map(async subCat => {
        const parent = subCat?.bussCategoryId?.length
          ? await Promise.all(
            subCat.bussCategoryId.map(cat => (locale === Locale.ENGLISH ? cat.name : cat.hebrewName)),
          )
          : [];
        return {
          id: subCat.id,
          name: subCat.name,
          parent,
        };
      }),
    );
    return bussSubCategory;
  }

  async getOne(id: string, query: GetSubCategoryQuery) {
    const campDetails = await this.campaignService.findCampaignAndReturn(
      'code',
      query.campCode,
    );

    if (!campDetails?.categoryIds?.length) {
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

    if (
      bussCategory?.bussCategoryId?.some(
        catId => !campDetails.categoryIds.includes(new mongoose.Types.ObjectId(catId)),
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
