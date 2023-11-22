/* eslint-disable prefer-const */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { GroupType } from './schema/group-type.schema';
import { disSelect } from 'src/common/utils/select.handling';
import { FilterQuery, createGroupTypeDto, updateGroupTypeDto } from './dto';
import {
  findOneByFieldName, findOneByFieldNameExcludeId, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class GroupTypeService {
  constructor(
       @InjectModel('GroupType')
        private readonly GroupTypeModel: Model<GroupType>,
  ) { }

  async create(dto: createGroupTypeDto, userId: string) {
    const newGroupType = new this.GroupTypeModel({ ...dto, createdBy: userId });
    return newGroupType.save();
  }

  async getAll(query:FilterQuery) {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: {};
    let populate1: {};
    if (query.search) {
      findQuery = {
        name: { $regex: query.search, $options: 'i' },
      };
    }
    populate = {
      path: 'icon',
      select: disSelect,
    };

    select = `${disSelect}`;
    const groupType = await queryhandler<GroupType>(
      this.GroupTypeModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return groupType;
  }

  async getOne(id: string) {
    const select = `${disSelect}`;
    const populate = {
      path: 'icon',
      select: disSelect,
    };
    const groupType = await this.GroupTypeModel.findById(id)
      .select(select)
      .populate(populate)
      .exec();
    return groupType;
  }

  async update(id: string, dto: updateGroupTypeDto, userId: string) {
    const groupType = await updateById<GroupType>(this.GroupTypeModel, id, { ...dto, updatedBy: userId });

    if (!groupType) {
      throw new NotFoundException(ServerErrors.GROUP_TYPE.NOT_FOUND);
    }
    return groupType;
  }

  async softDelete(id:string, userId: string) {
    const updateField = {
      isDeleted: true, deleteAt: new Date(), updatedBy: userId, deletedBy: userId,
    };
    const groupType = await updateById<GroupType>(
      this.GroupTypeModel,
      id,
      updateField,
    );
    if (!groupType) {
      throw new NotFoundException(ServerErrors.GROUP_TYPE.NOT_FOUND);
    }
    return groupType;
  }

  // find  by field name

  async findByFieldName(fieldName: keyof GroupType, items: string): Promise<boolean> {
    const groupType = await findOneByFieldName<GroupType>(this.GroupTypeModel, fieldName, items);
    if (groupType) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(fieldName: keyof GroupType, items: string, id:string): Promise<boolean> {
    const groupType = await findOneByFieldNameExcludeId<GroupType>(
      this.GroupTypeModel,
      fieldName,
      items,
      id,
    );
    if (groupType) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
