import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createMPCategoriesDto, updateMPCategoriesDto } from './dto';
import { MPCategories } from './schema/categories.schema';
import { Model } from 'mongoose';
import { queryhandler, updateById } from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';

@Injectable()
export class MPCategoiresService {
  constructor(@InjectModel('MPCategories') private MPCategoriesModel: Model<MPCategories>) { }

  async createMPCategories(dto: createMPCategoriesDto): Promise<MPCategories> {
    const newMapPoint = new this.MPCategoriesModel(dto);
    return newMapPoint.save();
  }

  async getAllMPCategories(): Promise<MPCategories & any> {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: any;
    let populate1: string;

    // eslint-disable-next-line prefer-const
    populate = {
      path: 'mapPointId',
      select: '_id, name',
      match: { delatedAt: { $in: [false, null] } },
    };
    // eslint-disable-next-line prefer-const
    select = '-createdAt -updatedAt -createdBy -updatedBy -deletedBy -deletedAt -isDelete';
    const mapPoint = await queryhandler<MPCategories>(
      this.MPCategoriesModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );

    return mapPoint;
  }

  async updateMPCategories(id: string, dto:updateMPCategoriesDto): Promise<MPCategories> {
    const mpCategories = await updateById<MPCategories>(this.MPCategoriesModel, id, dto);
    if (!mpCategories) {
      throw new NotFoundException(ServerErrors.MAP_POINT_CATEGORIES_NOT_FOUND);
    }
    return mpCategories;
  }

  async softDeleteMPCategories(id: string): Promise<MPCategories> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const mpCategories = await updateById<MPCategories>(this.MPCategoriesModel, id, updateField);
    if (!mpCategories) {
      throw new NotFoundException(ServerErrors.MAP_POINT_SUB_CATEGORIES_NOT_FOUND);
    }
    return mpCategories;
  }
}
