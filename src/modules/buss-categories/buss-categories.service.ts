/* eslint-disable prefer-const */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BussCategory } from './schema/buss.category.schema';
import { Model } from 'mongoose';
import {
  findOneByFieldName, findOneByFieldNameExcludeId, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { disSelect } from 'src/common/utils/select.handling';
import { UpdateBussCategoryDto } from './dto/updateBussCategoryDto';
import { createBussCategoryDto } from './dto/createBussCategoryDto';
import { ServerErrors } from 'src/common/constant';
import { FilterQuery } from './dto/query.dto';

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

  async getAll(query:FilterQuery) {
    let findQuery: any = {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: any;
    let populate1: {};

    if (query.search) {
      findQuery = {
        name: { $regex: query.search, $options: 'i' },
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
      page,
      limit,
      populate,
      populate1,
    );
    return bussCategoriesList;
  }

  async getOne(id: string) {
    const select = `${disSelect}`;
    const bussCategory = await this.BussCategoryModel.findById(id).select(select).exec();
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
