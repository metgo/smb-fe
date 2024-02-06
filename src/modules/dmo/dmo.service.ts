/* eslint-disable no-underscore-dangle */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findByFieldName,
  findOneByFieldName,
  findOneById,
  findOneByOrCase,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { DMO } from './schema/dmo.schema';
import { CreateDMODto, FilterQuery, UpdateDMODto } from './dto';

import { UsersService } from '../users/users.services';

@Injectable()
export class DMOService {
  constructor(
    @InjectModel('DMO') private DMOModel: Model<DMO>,
    private userService: UsersService,
  ) { }

  async createDMO(dto: CreateDMODto) {
    const dmo = await findOneByFieldName<DMO>(
      this.DMOModel,
      'name',
      dto.name,
    );
    if (dmo) {
      throw new BadRequestException(ServerErrors.DMO_EXISTS);
    }
    await this.userService.findDMOUser(dto.userId);
    const newDMO = new this.DMOModel(dto);
    return newDMO.save();
  }

  async getAllDMO(queries: FilterQuery) {
    const {
      page, limit, search,
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: {};
    let populate: string;
    let populate1: string;
    const select = `${disSelect}`;

    if (search) {
      findQuery = {
        $text: { $search: search, $caseSensitive: false, $diacriticSensitive: false },
      };
    }
    const dmoList = await queryhandler<DMO>(
      this.DMOModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        populate1,
      },
    );

    return dmoList;
  }

  async updateDMO(id: string, dto:UpdateDMODto) {
    const dmo = await updateById<DMO>(this.DMOModel, id, dto);

    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return dmo;
  }

  async softDeleteDMO(id: string): Promise<DMO> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const dmo = await updateById<DMO>(
      this.DMOModel,
      id,
      updateField,
    );
    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return dmo;
  }

  async findDMO(id: string) {
    const dmo = await findOneById<DMO>(this.DMOModel, id);
    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return true;
  }

  async findDMOByUserID(id: string) {
    const findQuery = {
      $or: [
        { userId: id },
        { collaboratorsUser: { $in: [id] } },
      ],
    };
    const dmo = await findOneByOrCase<DMO>(this.DMOModel, findQuery);
    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return dmo._id;
  }

  async getAllDMOById(userId: string) {
    const items = await findByFieldName<DMO>(this.DMOModel, 'userId', userId);
    return items.map(item => item._id);
  }
}
