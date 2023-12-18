import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Locale } from 'src/common/enum';
import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName, findOneByFieldNameExcludeId, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { BussSubCategory } from './schema/buss-subCategory.schema';
import { FilterQuery, createBussSubCategoryDto, updateBussSubCategoryDto } from './dto';

@Injectable()
export class BussSubCategoriesService {
  constructor(
    @InjectModel('BussSubCategory')
    private readonly BussSubCategoryModel: Model<BussSubCategory>,
  ) {}

  async create(dto: createBussSubCategoryDto, userId: string): Promise<BussSubCategory> {
    const newBussSubCategory = new this.BussSubCategoryModel({ ...dto, createdBy: userId });
    return newBussSubCategory.save();
  }

  async getAll(queries: FilterQuery): Promise<BussSubCategory & any> {
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

    // eslint-disable-next-line prefer-const

    if (query.bussCategoryId) {
      const bussCategory = JSON.parse(query.bussCategoryId);
      findQuery = {
        ...findQuery,
        bussCategoryId: { $in: bussCategory },
      };
    }
    // eslint-disable-next-line prefer-const
    populate = {
      path: 'bussCategoryId',
      select: '_id, name',
      match: { delatedAt: { $in: [false, null] } },
    };
    // eslint-disable-next-line prefer-const
    populate1 = {
      path: 'icon',
      select: disSelect,
    };
    // eslint-disable-next-line prefer-const
    select = disSelect;
    const bussSubCategory = await queryhandler<BussSubCategory>(
      this.BussSubCategoryModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
      locale,
    );

    return bussSubCategory;
  }

  async getOne(id: string, locale: Locale) {
    const select = `${disSelect}`;
    const populate = {
      path: 'bussCategoryId',
      select: '_id , name',
    };
    const populate1 = {
      path: 'icon',
      select: disSelect,
    };
    const bussCategory = await this.BussSubCategoryModel.findById(id)
      .select(select)
      .populate(populate)
      .populate(populate1)
      .exec();

    if (locale === Locale.HEBREW) {
      bussCategory.name = bussCategory?.hebrewName || bussCategory.name;
    }
    return bussCategory;
  }

  async update(id: string, dto: updateBussSubCategoryDto, userId: string): Promise<BussSubCategory> {
    const bussSubCategory = await updateById<BussSubCategory>(this.BussSubCategoryModel, id, { ...dto, updateBy: userId });
    if (!bussSubCategory) {
      throw new NotFoundException(ServerErrors.BUSS_SUB_CATEGORY.NOT_FOUND);
    }
    return bussSubCategory;
  }

  async softDelete(id: string, userId: string): Promise<BussSubCategory> {
    const updateField = {
      isDeleted: true, deleteAt: new Date(), updatedBy: userId, deletedBy: userId,
    };
    const bussSubCategory = await updateById<BussSubCategory>(this.BussSubCategoryModel, id, updateField);
    if (!bussSubCategory) {
      throw new NotFoundException(ServerErrors.BUSS_SUB_CATEGORY.NOT_FOUND);
    }
    return bussSubCategory;
  }

  async findByFieldName(fieldName: keyof BussSubCategory, items: string): Promise<boolean> {
    const bussEmail = await findOneByFieldName<BussSubCategory>(this.BussSubCategoryModel, fieldName, items);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(fieldName: keyof BussSubCategory, items: string, id:string): Promise<boolean> {
    const bussEmail = await findOneByFieldNameExcludeId<BussSubCategory>(this.BussSubCategoryModel, fieldName, items, id);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
