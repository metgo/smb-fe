/* eslint-disable prefer-const */
import {
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Locale } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { disSelect } from 'src/common/utils/select.handling';
import { Accessibility } from './schema/accessibility.schema';
import {
  queryhandler,
} from 'src/core/helper/query-helper';
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

    const accessibility = await queryhandler<Accessibility>(
      this.AccessibilityModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        populate1,
        languageQuery: locale,
      },
    );

    return accessibility;
  }

  async getOne(id: string, query: LocaleQuery) {
    try {
      const select = `${disSelect}`;
      const populate = {
        path: 'icon',
        select: disSelect,
      };
      const accessibility = await this.AccessibilityModel.findById(id)
        .select(select)
        .populate(populate)
        .exec();

      if (query.locale === Locale.HEBREW) {
        accessibility.name = accessibility?.hebrewName || accessibility.name;
      }
      return accessibility;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
