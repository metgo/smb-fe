/* eslint-disable prefer-const */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Locale } from 'src/common/enum';
import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName,
  findOneByFieldNameExcludeId,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { GroupType } from './schema/group-type.schema';
import { createGroupTypeDto, updateGroupTypeDto } from './dto';

@Injectable()
export class GroupTypeService {
  constructor(
    @InjectModel('GroupType')
    private readonly GroupTypeModel: Model<GroupType>,
  ) {}

  async create(dto: createGroupTypeDto, userId: string) {
    const newGroupType = new this.GroupTypeModel({
      ...dto,
      createdBy: userId,
      createdAt: new Date(),
    });
    return newGroupType.save();
  }

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

    const groupType = await queryhandler<GroupType>(this.GroupTypeModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
      languageQuery: locale,
    });

    return groupType;
  }

  async getOne(id: string, locale: Locale) {
    const select = `${disSelect}`;
    const populate = {
      path: 'icon',
      select: disSelect,
    };
    const groupType = await this.GroupTypeModel.findById(id)
      .select(select)
      .populate(populate)
      .exec();

    if (locale === Locale.HEBREW) {
      groupType.name = groupType?.hebrewName || groupType.name;
    }
    return groupType;
  }

  async update(id: string, dto: updateGroupTypeDto, userId: string) {
    const groupType = await updateById<GroupType>(this.GroupTypeModel, id, {
      ...dto,
      updatedBy: userId,
    });

    if (!groupType) {
      throw new NotFoundException(ServerErrors.GROUP_TYPE.NOT_FOUND);
    }
    return groupType;
  }

  async softDelete(id: string, userId: string) {
    const updateField = {
      isDeleted: true,
      deleteAt: new Date(),
      updatedBy: userId,
      deletedBy: userId,
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

  async findByFieldName(
    fieldName: keyof GroupType,
    items: string,
  ): Promise<boolean> {
    const groupType = await findOneByFieldName<GroupType>(
      this.GroupTypeModel,
      fieldName,
      items,
    );
    if (groupType) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(
    fieldName: keyof GroupType,
    items: string,
    id: string,
  ): Promise<boolean> {
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
