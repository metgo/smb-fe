import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { Locale } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName,
  findOneByFieldNameExcludeId,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { UpdateBussCategoryDto } from './dto/updateBussCategoryDto';
import { createBussCategoryDto } from './dto/createBussCategoryDto';
import { BussCategory } from './schema/buss.category.schema';
import { BussSubCategory } from '../buss-subcategories/schema/buss-subCategory.schema';

@Injectable()
export class BussCategoriesService {
  constructor(
    @InjectModel('BussCategory')
    private BussCategoryModel: Model<BussCategory>,
    @InjectModel(BussSubCategory.name)
    private BussSubCategoryModel: Model<BussSubCategory>,
  ) {}

  async create(dto: createBussCategoryDto, userId: string) {
    const newBussCategories = new this.BussCategoryModel({
      ...dto,
      createdBy: userId,
    });
    await newBussCategories.save();
    return newBussCategories;
  }

  async getAll(queries: LocaleFilterQuery) {
    const {
      page, limit, search, locale, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit
      ? Number(limit)
      : paginationConfig.MAX_ASPECT_LIMIT;

    let findQuery: any = query;
    const select = `${disSelect}`;

    const populate = {
      path: 'icon iconBnW',
      select: disSelect,
    };

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }

    const bussCategoriesList = await queryhandler<BussCategory>(
      this.BussCategoryModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        sort: 'createdAt',
        populate,
        languageQuery: locale,
      },
    );

    return bussCategoriesList;
  }

  async getOne(id: string, locale: Locale) {
    const select = `${disSelect}`;
    const populate = {
      path: 'icon iconBnW',
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

  async update(dto: UpdateBussCategoryDto, id: string, userId: string) {
    const updatedBussCategory = await updateById<BussCategory>(
      this.BussCategoryModel,
      id,
      { ...dto, updatedBy: userId },
    );

    if (!updatedBussCategory) {
      throw new NotFoundException(ServerErrors.BUSS_CATEGORY.NOT_FOUND); // need to change
    }
    return updatedBussCategory;
  }

  async softDelete(id: string, userId: string) {
    const updateField = {
      isDeleted: true,
      deleteAt: new Date(),
      updateBy: userId,
      deletedBy: userId,
    };
    const bussCategory = await updateById<BussCategory>(
      this.BussCategoryModel,
      id,
      updateField,
    );
    if (!bussCategory) {
      throw new NotFoundException(ServerErrors.BUSS_CATEGORY.NOT_FOUND); // need to change
    }
    return bussCategory;
  }

  async findByFieldName(
    fieldName: keyof BussCategory,
    items: string,
  ): Promise<boolean> {
    const bussCategory = await findOneByFieldName<BussCategory>(
      this.BussCategoryModel,
      fieldName,
      items,
    );
    if (bussCategory) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(
    fieldName: keyof BussCategory,
    items: string,
    id: string,
  ): Promise<boolean> {
    const bussCategory = await findOneByFieldNameExcludeId<BussCategory>(
      this.BussCategoryModel,
      fieldName,
      items,
      id,
    );
    if (bussCategory) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
