/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Locale } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GroupType } from './schema/group-type.schema';

@Injectable()
export class GroupTypeService {
  constructor(
    @InjectModel('GroupType')
    private readonly GroupTypeModel: Model<GroupType>,
  ) {}

  async getAll(queries: LocaleFilterQuery) {
    const {
      page, limit, search, locale, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit
      ? Number(limit)
      : paginationConfig.MAX_ASPECT_LIMIT;
    const select = `${disSelect}`;

    let findQuery: {} = query;
    let populate1: {};

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }
    const populate = {
      path: 'icon',
      select: disSelect,
    };

    const groupType = await queryhandler<GroupType>(this.GroupTypeModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
      languageQuery: locale,
    });

    return groupType;
  }

  async getOne(id: string, locale: Locale) {
    const select = `${disSelect}`;
    const populate = {
      path: 'icon',
      select: disSelect,
    };
    const groupType = await this.GroupTypeModel.findById(id)
      .select(select)
      .populate(populate)
      .exec();

    if (locale === Locale.HEBREW) {
      groupType.name = groupType?.hebrewName || groupType.name;
    }
    return groupType;
  }
}
