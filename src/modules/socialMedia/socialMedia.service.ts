/* eslint-disable prefer-const */
import {
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { disSelect } from 'src/common/utils/select.handling';
import {
  queryhandler,
} from 'src/core/helper/query-helper';
import { SocialMedia } from './schema/socialMedia.schema';

import { FilterQuery } from './dto/query.dto';

@Injectable()
export class SocialMediaService {
  constructor(
    @InjectModel('SocialMedia')
    private SocialMediaModel: Model<SocialMedia>,
  ) {}

  async getAll(queries: FilterQuery) {
    const { page, limit, search } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: {};
    let select: string;
    let populate: {};
    let populate1: string;

    if (search) {
      findQuery = {
        name: { $regex: search, $options: 'i' },
      };
    }
    populate = {
      path: 'icon',
      select: `${disSelect}`,
    };
    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const socialMedia = await queryhandler<SocialMedia>(this.SocialMediaModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      sort: 'createdAt',
      sortOrder: SortOrder.DESC,
      populate,
      populate1,
    });
    return socialMedia;
  }
}
