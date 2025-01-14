/* eslint-disable no-undef */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ServerErrors } from 'src/common/constant';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByOrCase,
  queryhandler,
  updateOneByManyFields,
} from 'src/core/helper/query-helper';
import { GetAllAuthoritiesQuery } from 'src/modules/authority/queries/get-all-authorities.query';
import { Authority } from 'src/modules/authority/schema/authority.schema';

@Injectable()
export class AuthorityService {
  constructor(
    @InjectModel('Authority')
    private readonly AuthorityModel: Model<Authority>,
  ) {}

  async getAll(query: GetAllAuthoritiesQuery) {
    try {
      const {
        page, limit, search, dmoId,
      } = query;

      const queryPage = Number(page);
      const queryLimit = Number(limit);
      const select = `${disSelect}`;

      let findQuery: {} = {};

      const populate = {
        path: 'dmoId adminIds',
        select: `${disSelect}`,
      };

      if (search) {
        findQuery = {
          name: { $regex: search, $options: 'i' },
        };
      }

      if (dmoId) {
        const dmoIds = Array.isArray(dmoId) ? dmoId : [dmoId];

        findQuery = {
          ...findQuery,
          dmoId: { $in: dmoIds },
        };
      }

      const authorities = await queryhandler<Authority>(this.AuthorityModel, {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
      });

      return authorities;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getOne(id: string) {
    try {
      const select = `${disSelect}`;
      const populate = {
        path: 'dmoId adminIds',
        select: `${disSelect}`,
      };

      const authority = await this.AuthorityModel.findById(id)
        .select(select)
        .populate(populate)
        .exec();

      if (!authority) {
        throw new NotFoundException(ServerErrors.AUTHORITY.NOT_FOUND);
      }
      return authority;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findAuthorityByUserID(userId: string) {
    const findQuery = {
      $or: [
        { collaboratorsUser: { $in: [userId] } },
        { adminIds: { $in: [userId] } },
      ],
    };

    const populate = {
      path: 'dmoId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };

    const authority = await findOneByOrCase<Authority>(
      this.AuthorityModel,
      findQuery,
      populate,
    );
    if (!authority) {
      throw new NotFoundException(ServerErrors.AUTHORITY.NOT_FOUND);
    }
    return authority;
  }

  async addAdmin(authorityId: string, userId: string) {
    const authority = await updateOneByManyFields<Authority>(
      this.AuthorityModel,
      {
        _id: new mongoose.Types.ObjectId(authorityId),
      },
      {
        $push: { adminIds: { $each: [userId] } },
      },
    );

    if (!authority) {
      throw new NotFoundException(ServerErrors.AUTHORITY.NOT_FOUND);
    }
    return authority;
  }
}
