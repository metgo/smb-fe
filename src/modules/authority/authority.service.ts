/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { paginationConfig } from 'src/common/pagination.config';
import { PaginationFilterQuery } from 'src/common/query-handler/pagination.query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { AuthorityDTO } from 'src/modules/authority/dto/authority.dto';
import { Authority } from 'src/modules/authority/schema/authority.schema';

@Injectable()
export class AuthorityService {
  constructor(
    @InjectModel('Authority')
    private readonly AuthorityModel: Model<Authority>,
  ) {}

  async create(dto: AuthorityDTO, userId: string) {
    const newAuthority = new this.AuthorityModel({
      ...dto,
      createdBy: userId,
    });

    const authority = await newAuthority.save();
    return authority;
  }

  async getAll(query: PaginationFilterQuery) {
    const { page, limit } = query;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;
    const select = `${disSelect}`;

    let findQuery: {} = query;
    let populate1: {};

    const populate = {
      path: 'dmoId',
      select: `${disSelect}`,
    };

    const authorities = await queryhandler<Authority>(
      this.AuthorityModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        populate1,
      },
    );

    return authorities;
  }

  // eslint-disable-next-line consistent-return
  async getOne(id: string) {
    try {
      const select = `${disSelect}`;
      const populate = {
        path: 'dmoId',
        select: `${disSelect}`,
      };

      const authority = await this.AuthorityModel.findById(id)
        .select(select)
        .populate(populate)
        .exec();

      return authority;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
