import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MPSubCategoriesItems } from './schema/subcategoriesitems.schema';
import { queryhandler, updateById } from 'src/core/helper/query-helper';
import { createMPSubCategoriesItemsDto, updateMPSubCategoriesItemsDto } from './dto';
import { ServerErrors } from 'src/common/constant';

@Injectable()
export class MPSubCategoriesItemsService {
  constructor(@InjectModel('MPSubCategoriesItems') private MPSubCategoriesItemsModel: Model<MPSubCategoriesItems>) { }

  async createMPSubCategoriesItems(dto: createMPSubCategoriesItemsDto): Promise<MPSubCategoriesItems> {
    const newMapPoint = new this.MPSubCategoriesItemsModel(dto);
    return newMapPoint.save();
  }

  async getAllMPSubCategoriesItems(): Promise<MPSubCategoriesItems & any> {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: any;
    let populate1: string;

    // eslint-disable-next-line prefer-const
    populate = {
      path: 'mapPointId mapPointCategoriesId mapPointSubCategoriesId',
      select: '_id, name',
      match: { delatedAt: { $in: [false, null] } },
    };
    // eslint-disable-next-line prefer-const
    select = '-createdAt -updatedAt -createdBy -updatedBy -deletedBy -deletedAt -isDelete';
    const mapPoint = await queryhandler<MPSubCategoriesItems>(
      this.MPSubCategoriesItemsModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return mapPoint;
  }

  async updateMPSubCategoriesItems(id: string, dto: updateMPSubCategoriesItemsDto)
    : Promise<MPSubCategoriesItems> {
    const mpSubCategoriesItems = await updateById<MPSubCategoriesItems>(
      this.MPSubCategoriesItemsModel,
      id,
      dto,
    );
    if (!mpSubCategoriesItems) {
      throw new NotFoundException(ServerErrors.MAP_POINT_SUB_CATEGORIES_ITEMS_NOT_FOUND);
    }
    return mpSubCategoriesItems;
  }

  async softDeleteMPSubCategoriesItems(id: string): Promise<MPSubCategoriesItems> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const mpSubCategoriesItems = await updateById<MPSubCategoriesItems>(
      this.MPSubCategoriesItemsModel,
      id,
      updateField,
    );
    if (!mpSubCategoriesItems) {
      throw new NotFoundException(ServerErrors.MAP_POINT_SUB_CATEGORIES_ITEMS_NOT_FOUND);
    }
    return mpSubCategoriesItems;
  }
}
