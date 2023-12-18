/* eslint-disable prefer-const */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { Locale } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName, findOneByFieldNameExcludeId, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { UpdateBussCategoryDto } from './dto/updateBussCategoryDto';
import { createBussCategoryDto } from './dto/createBussCategoryDto';
import { FilterQuery } from './dto/query.dto';
import { BussCategory } from './schema/buss.category.schema';

@Injectable()
export class BussCategoriesService {
  constructor(
    @InjectModel('BussCategory')
    private BussCategoryModel: Model<BussCategory>,
  ) { }

  async create(dto:createBussCategoryDto, userId:string) {
    const newBussCategories = new this.BussCategoryModel({ ...dto, createdBy: userId });
    await newBussCategories.save();
    return newBussCategories;
  }

  async getAll(queries: FilterQuery) {
    const {
      page, limit, search, locale, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: any = query;
    let select: {};

    let populate: any;
    let populate1: {};

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }

    select = `${disSelect}`;

    populate = {
      path: 'icon',
      select: disSelect,
    };

    const bussCategoriesList = await queryhandler<BussCategory>(
      this.BussCategoryModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
      locale,
    );
    return bussCategoriesList;
  }

  async getOne(id: string, locale: Locale) {
    const select = `${disSelect}`;
    const populate = {
      path: 'icon',
      select: disSelect,
    };
    const bussCategory = await this.BussCategoryModel.findById(id)
      .select(select)
      .populate(populate)
      .exec();

    if (locale === Locale.HEBREW) {
      bussCategory.name = bussCategory?.hebrewName || bussCategory.name;
    }
    return bussCategory;
  }

  async update(dto: UpdateBussCategoryDto, id: string, userId:string) {
    const updatedBussCategory = await updateById<BussCategory>(this.BussCategoryModel, id, { ...dto, updatedBy: userId });

    if (!updatedBussCategory) {
      throw new NotFoundException(ServerErrors.BUSS_CATEGORY.NOT_FOUND); // need to change
    }
    return updatedBussCategory;
  }

  async softDelete(id:string, userId:string) {
    const updateField = {
      isDeleted: true, deleteAt: new Date(), updateBy: userId, deletedBy: userId,
    };
    const bussCategory = await updateById<BussCategory>(
      this.BussCategoryModel,
      id,
      updateField,
    );
    if (!bussCategory) {
      throw new NotFoundException(ServerErrors.BUSS_CATEGORY.NOT_FOUND);// need to change
    }
    return bussCategory;
  }

  async findByFieldName(fieldName: keyof BussCategory, items: string): Promise<boolean> {
    const bussCategory = await findOneByFieldName<BussCategory>(this.BussCategoryModel, fieldName, items);
    if (bussCategory) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(fieldName: keyof BussCategory, items: string, id:string): Promise<boolean> {
    const bussCategory = await findOneByFieldNameExcludeId<BussCategory>(this.BussCategoryModel, fieldName, items, id);
    if (bussCategory) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
