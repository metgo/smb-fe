import { Injectable, NotFoundException } from '@nestjs/common';
import { createMPSubCategoriesDto, FilterQuery, updateMPSubCategoriesDto } from './dto';
import { MPSubCategories } from './schema/subcategories.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { queryhandler, updateById } from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { disSelect } from 'src/common/utils/select.handling';

@Injectable()
export class MPSubCategoriesService {
  constructor(@InjectModel('MPSubCategories') private MPSubCategoriesModel: Model<MPSubCategories>) { }

  async createMPSubCategories(dto: createMPSubCategoriesDto): Promise<MPSubCategories> {
    const newMPSubCategories = new this.MPSubCategoriesModel(dto);
    return newMPSubCategories.save();
  }

  async getAllMPSubCategories(query: FilterQuery): Promise<MPSubCategories & any> {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: {};
    let populate1: string;

    if (query.mapPointId) {
      const mapPoint = JSON.parse(query.mapPointId);
      findQuery = {
        mapPointId: { $in: mapPoint },
      };
    }
    if (query.mapPointCategoriesId) {
      const mapPointCat = JSON.parse(query.mapPointCategoriesId);
      findQuery = {
        ...findQuery,
        mapPointCategoriesId: { $in: mapPointCat },
      };
    }
    // eslint-disable-next-line prefer-const
    populate = {
      path: 'mapPointId mapPointCategoriesId',
      select: '_id, name',
      match: { delatedAt: { $in: [false, null] } },
    };
    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const newMPSubCategories = await queryhandler<MPSubCategories>(
      this.MPSubCategoriesModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return newMPSubCategories;
  }

  async updateMPSubCategories(id: string, dto:updateMPSubCategoriesDto): Promise<MPSubCategories> {
    const mpSubCategories = await updateById<MPSubCategories>(this.MPSubCategoriesModel, id, dto);
    if (!mpSubCategories) {
      throw new NotFoundException(ServerErrors.MAP_POINT_CATEGORIES_NOT_FOUND);
    }
    return mpSubCategories;
  }

  async softDeleteMPSubCategories(id: string): Promise<MPSubCategories> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const mpSubCategories = await updateById<MPSubCategories>(this.MPSubCategoriesModel, id, updateField);
    if (!mpSubCategories) {
      throw new NotFoundException(ServerErrors.MAP_POINT_SUB_CATEGORIES_NOT_FOUND);
    }
    return mpSubCategories;
  }
}
