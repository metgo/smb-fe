/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Locale } from 'src/common/enum';
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
      page, limit, search, locale,
    } = queries;

    const select = disSelect;

    let findQuery: {} = {};

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }

    const groupTypes = await queryhandler<GroupType>(this.GroupTypeModel, {
      findQuery,
      select,
      page: Number(page),
      limit: Number(limit),
      languageQuery: locale,
    });

    return groupTypes;
  }

  async getOne(id: string, locale: Locale) {
    const select = `${disSelect}`;

    const groupType = await this.GroupTypeModel.findById(id)
      .select(select)
      .exec();

    if (!locale || locale === Locale.HEBREW) {
      groupType.name = groupType?.hebrewName || groupType.name;
    }
    return groupType;
  }
}
