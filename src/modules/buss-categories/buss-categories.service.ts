import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Locale, SortOrder } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { BussCategory } from './schema/buss.category.schema';

@Injectable()
export class BussCategoriesService {
  constructor(
    @InjectModel('BussCategory')
    private BussCategoryModel: Model<BussCategory>,
  ) {}

  async getAll(queries: LocaleFilterQuery) {
    const {
      page, limit, search, locale, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit
      ? Number(limit)
      : paginationConfig.MAX_ASPECT_LIMIT;

    let findQuery: any = query;
    const select = `${disSelect}`;

    const populate = {
      path: 'icon iconBnW',
      select: disSelect,
    };

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }

    const bussCategoriesList = await queryhandler<BussCategory>(
      this.BussCategoryModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        sort: 'createdAt',
        sortOrder: SortOrder.DESC,
        populate,
        languageQuery: locale,
      },
    );

    return bussCategoriesList;
  }

  async getOne(id: string, locale: Locale) {
    const select = `${disSelect}`;
    const populate = {
      path: 'icon iconBnW',
      select: disSelect,
    };
    const bussCategory = await this.BussCategoryModel.findById(id)
      .select(select)
      .populate(populate)
      .exec();

    if (locale === Locale.HEBREW) {
      bussCategory.name = bussCategory?.hebrewName || bussCategory.name;
    }
    return bussCategory;
  }
}
