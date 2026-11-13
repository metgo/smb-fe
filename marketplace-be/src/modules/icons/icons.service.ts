/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { paginationConfig } from 'src/common/pagination.config';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { FilterQuery } from './dto';
import { Icons } from './schema/icon.schema';

@Injectable()
export class IconsService {
  constructor(
    @InjectModel('Icons')
    private IconModel: Model<Icons>,
  ) {}

  async getIcons(queries: FilterQuery) {
    const { page, limit, ...query } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;
    const select = `${disSelect}`;

    let findQuery: {};

    let populate: string;
    let populate1: string;
    if (query.search) {
      // findQuery = { $text: { $search: query.search, $caseSensitive: false, $diacriticSensitive: false } };
      findQuery = {
        name: { $regex: query.search, $options: 'i' },
      };
    }

    const iconList = await queryhandler<Icons>(this.IconModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
    });

    return iconList;
  }

  async getIcon(id: string) {
    const select = `${disSelect}`;
    const iconCategory = await this.IconModel.findById(id).select(select);
    return iconCategory;
  }
}
