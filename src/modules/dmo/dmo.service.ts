/* eslint-disable no-underscore-dangle */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DMO } from './schema/dmo.schema';
import { CreateDMODto, UpdateDMODto } from './dto';
import {
  findOneByFieldName,
  findOneById,
  findOneByOrCase,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
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

  async getAllDMO() {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: string;
    let populate1: string;

    // eslint-disable-next-line prefer-const
    select = '-createdAt -updatedAt -createdBy -updatedBy -deletedBy -deletedAt -isDelete';
    const dmoList = await queryhandler<DMO>(
      this.DMOModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
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
}
