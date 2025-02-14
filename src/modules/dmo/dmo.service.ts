/* eslint-disable no-undef */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ObjectId } from 'typeorm';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldNames,
  findOneByOrCase,
  queryhandler,
  updateOneByManyFields,
} from 'src/core/helper/query-helper';
import { DMO } from './schema/dmo.schema';
import { FilterQuery } from './dto';

@Injectable()
export class DMOService {
  constructor(@InjectModel('DMO') private DMOModel: Model<DMO>) {}

  async getAllDMO(queries: FilterQuery) {
    const { page, limit, search } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: {};
    let populate: string;
    let populate1: string;
    const select = `${disSelect}`;

    if (search) {
      findQuery = {
        $text: {
          $search: search,
          $caseSensitive: false,
          $diacriticSensitive: false,
        },
      };
    }
    const dmoList = await queryhandler<DMO>(this.DMOModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      sort: 'name',
      populate,
      populate1,
    });

    return dmoList;
  }

  async addCollaborators(dmoId: string, collaboratedUserId: string) {
    const dmo = await updateOneByManyFields<DMO>(
      this.DMOModel,
      {
        _id: new mongoose.Types.ObjectId(dmoId),
      },
      {
        $push: { collaboratorsUser: { $each: [collaboratedUserId] } },
      },
    );

    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return dmo;
  }

  async addAdmin(dmoId: string, userId: string) {
    const dmo = await updateOneByManyFields<DMO>(
      this.DMOModel,
      {
        _id: new mongoose.Types.ObjectId(dmoId),
      },
      {
        $push: { adminIds: { $each: [userId] } },
      },
    );

    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return dmo;
  }

  async findDMOByUserID(id: string) {
    const findQuery = {
      $or: [{ adminIds: { $in: [id] } }, { collaboratorsUser: { $in: [id] } }],
    };
    const dmo = await findOneByOrCase<DMO>(this.DMOModel, findQuery);
    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return dmo;
  }

  async getById(id: ObjectId) {
    const items = await findOneByFieldNames<DMO>(this.DMOModel, {
      _id: id,
    });

    return items;
  }
}
