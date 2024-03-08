/* eslint-disable prefer-const */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MPSubCategoriesItems } from './schema/subcategoriesitems.schema';
import {
  findOneByFieldName,
  findOneByFieldNameExcludeId,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import {
  createMPSubCategoriesItemsDto,
  FilterQuery,
  updateMPSubCategoriesItemsDto,
} from './dto';
import { ServerErrors } from 'src/common/constant';
import { disSelect } from 'src/common/utils/select.handling';

@Injectable()
export class MPSubCategoriesItemsService {
  constructor(
    @InjectModel('MPSubCategoriesItems')
    private MPSubCategoriesItemsModel: Model<MPSubCategoriesItems>,
  ) {}

  async createMPSubCategoriesItems(
    dto: createMPSubCategoriesItemsDto,
  ): Promise<MPSubCategoriesItems> {
    const newMapPoint = new this.MPSubCategoriesItemsModel(dto);
    return newMapPoint.save();
  }

  async getAllMPSubCategoriesItems(
    query: FilterQuery,
  ): Promise<MPSubCategoriesItems & any> {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: any;
    let populate1: {};

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
    if (query.mapPointSubCategoriesId) {
      const mapPointSubCat = JSON.parse(query.mapPointSubCategoriesId);
      findQuery = {
        ...findQuery,
        mapPointSubCategoriesId: { $in: mapPointSubCat },
      };
    }
    populate = {
      path: 'mapPointId mapPointCategoriesId mapPointSubCategoriesId',
      select: '_id, name',
      match: { delatedAt: { $in: [false, null] } },
    };
    populate1 = {
      path: 'icon',
      select: disSelect,
    };
    select = `${disSelect}`;
    const mapPoint = await queryhandler<MPSubCategoriesItems>(
      this.MPSubCategoriesItemsModel,
      {
        findQuery,
        select,
        page,
        limit,
        populate,
        populate1,
      },
    );
    return mapPoint;
  }

  async updateMPSubCategoriesItems(
    id: string,
    dto: updateMPSubCategoriesItemsDto,
  ): Promise<MPSubCategoriesItems> {
    const mpSubCategoriesItems = await updateById<MPSubCategoriesItems>(
      this.MPSubCategoriesItemsModel,
      id,
      dto,
    );
    if (!mpSubCategoriesItems) {
      throw new NotFoundException(
        ServerErrors.MAP_POINT_SUB_CATEGORIES_ITEMS_NOT_FOUND,
      );
    }
    return mpSubCategoriesItems;
  }

  async softDeleteMPSubCategoriesItems(
    id: string,
  ): Promise<MPSubCategoriesItems> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const mpSubCategoriesItems = await updateById<MPSubCategoriesItems>(
      this.MPSubCategoriesItemsModel,
      id,
      updateField,
    );
    if (!mpSubCategoriesItems) {
      throw new NotFoundException(
        ServerErrors.MAP_POINT_SUB_CATEGORIES_ITEMS_NOT_FOUND,
      );
    }
    return mpSubCategoriesItems;
  }

  async findByFieldName(
    fieldName: keyof MPSubCategoriesItems,
    items: string,
  ): Promise<boolean> {
    const mpSubCategoriesItems = await findOneByFieldName<MPSubCategoriesItems>(
      this.MPSubCategoriesItemsModel,
      fieldName,
      items,
    );
    if (mpSubCategoriesItems) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(
    fieldName: keyof MPSubCategoriesItems,
    items: string,
    id: string,
  ): Promise<boolean> {
    const mpSubCategoriesItems
      = await findOneByFieldNameExcludeId<MPSubCategoriesItems>(
        this.MPSubCategoriesItemsModel,
        fieldName,
        items,
        id,
      );
    if (mpSubCategoriesItems) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
