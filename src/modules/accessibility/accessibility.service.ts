/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Locale } from 'src/common/enum';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { disSelect } from 'src/common/utils/select.handling';
import { Accessibility } from './schema/accessibility.schema';
import { queryhandler } from 'src/core/helper/query-helper';
import { Model } from 'mongoose';
import { LocaleQuery } from './dto/locale-query.dto';
import { exceptionHandling } from 'src/common/utils/exception-handling';

@Injectable()
export class AccessibilityService {
  constructor(
    @InjectModel('Accessibility')
    private readonly AccessibilityModel: Model<Accessibility>,
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

    const accessibility = await queryhandler<Accessibility>(
      this.AccessibilityModel,
      {
        findQuery,
        select,
        page: Number(page),
        limit: Number(limit),
        sort: 'name',
        languageQuery: locale,
      },
    );

    return accessibility;
  }

  async getOne(id: string, query: LocaleQuery) {
    try {
      const select = disSelect;

      const accessibility = await this.AccessibilityModel.findById(id)
        .select(select)
        .exec();

      if (!query?.locale || query.locale === Locale.HEBREW) {
        accessibility.name = accessibility?.hebrewName || accessibility.name;
      }
      return accessibility;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
