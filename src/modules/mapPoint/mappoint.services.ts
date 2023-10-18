import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  createMapPointCategoriesDto, createMapPointDto, createMapPointSubCategoriesDto, createMapPointSubCategoriesItemDto,
} from './dto';
import { MapPoint } from './schema/mappoint.schema';
import { MapPointCategories } from './schema/mappoint-categories.schema';
import { findOneByFieldName, queryhandler, updateById } from 'src/core/helper/query-helper';
import { MapPointSubCategories } from './schema/mappoint-sub-categories.schema';
import { MapPointSubCategoriesItem } from './schema/mappoint-sub-categories.item.schema';
import { ServerErrors } from 'src/common/constant';

@Injectable()
export class MapPointServices {
  constructor(
    @InjectModel('MapPoint') private MapPointModel: Model<MapPoint>,
    @InjectModel('MapPointCategories') private MapPointCategoriesModel: Model<MapPointCategories>,
    @InjectModel('MapPointSubCategories') private MapPointSubCategoriesModel: Model<MapPointSubCategories>,
     @InjectModel('MapPointSubCategoriesItems') private MapPointSubCategoriesItemsModel: Model<MapPointSubCategoriesItem>,
  ) { }

  /*
    *  map point function
    * create
    * list
    * update
    * delete
  */
  async createMapPoint(dto: createMapPointDto): Promise<MapPoint> {
    const newMapPoint = new this.MapPointModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPoint(): Promise<MapPoint & any> {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: string;
    let populate1: string;
    const mapPoint = await queryhandler<MapPoint>(
      this.MapPointModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );

    return mapPoint;
  }

  async updateMapPoint(id: string, dto): Promise<MapPoint> {
    const mapPoint = await updateById<MapPoint>(this.MapPointModel, id, dto);
    if (!mapPoint) {
      throw new NotFoundException(ServerErrors.MAP_POINT_NOT_FOUND);
    }
    return mapPoint;
  }

  async softDeleteMapPoint(id: string): Promise<MapPoint> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const mapPoint = await updateById<MapPoint>(this.MapPointModel, id, updateField);
    if (!mapPoint) {
      throw new NotFoundException(ServerErrors.MAP_POINT_NOT_FOUND);
    }
    return mapPoint;
  }

  /*
    *  map point categories function
    * create
    * list
    * update
    * delete
  */
  async createMapPointCategories(dto: createMapPointCategoriesDto): Promise<MapPointCategories> {
    const newMapPoint = new this.MapPointCategoriesModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPointCategories(): Promise<MapPointCategories & any> {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: string;
    let populate1: string;
    const mapPoint = await queryhandler<MapPointCategories>(
      this.MapPointCategoriesModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    if (mapPoint.length === 0) {
      throw new NotFoundException('Map Point Categories Not Found');
    }

    return mapPoint;
  }

  async updateMapPointCategories(id: string, dto): Promise<MapPointCategories> {
    const mapPointCategories = await updateById<MapPointCategories>(this.MapPointCategoriesModel, id, dto);
    if (!mapPointCategories) {
      throw new NotFoundException(ServerErrors.MAP_POINT_CATEGORIES_NOT_FOUND);
    }
    return mapPointCategories;
  }

  async softDeleteMapPointCategories(id: string): Promise<MapPointCategories> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const mapPointCategories = await updateById<MapPointCategories>(this.MapPointCategoriesModel, id, updateField);
    if (!mapPointCategories) {
      throw new NotFoundException(ServerErrors.MAP_POINT_CATEGORIES_NOT_FOUND);
    }
    return mapPointCategories;
  }

  /*
    *  map point sub categories function
    * create
    * list
    * update
    * delete
  */
  async createMapPointSubCategories(dto: createMapPointSubCategoriesDto): Promise<MapPointSubCategories> {
    const newMapPoint = new this.MapPointSubCategoriesModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPointSubCategories(): Promise<MapPointSubCategories & any> {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: string;
    let populate1: string;
    const mapPoint = await queryhandler<MapPointSubCategories>(
      this.MapPointSubCategoriesModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );

    return mapPoint;
  }

  async updateMapPointSubCategories(id: string, dto): Promise<MapPointCategories> {
    const mapPointCategories = await updateById<MapPointCategories>(this.MapPointCategoriesModel, id, dto);
    if (!mapPointCategories) {
      throw new NotFoundException(ServerErrors.MAP_POINT_CATEGORIES_NOT_FOUND);
    }
    return mapPointCategories;
  }

  async softDeleteMapPointSubCategories(id: string): Promise<MapPointSubCategories> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const mapPointSubCategories = await updateById<MapPointSubCategories>(this.MapPointSubCategoriesModel, id, updateField);
    if (!mapPointSubCategories) {
      throw new NotFoundException(ServerErrors.MAP_POINT_SUB_CATEGORIES_NOT_FOUND);
    }
    return mapPointSubCategories;
  }

  /*
    *  map point sub categories items function
    * create
    * list
    * update
    * delete
  */
  async createMapPointSubCategoriesItems(dto: createMapPointSubCategoriesItemDto): Promise<MapPointSubCategoriesItem> {
    const newMapPoint = new this.MapPointSubCategoriesItemsModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPointSubCategoriesItems(): Promise<MapPointSubCategoriesItem & any> {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: string;
    let populate1: string;
    const mapPoint = await queryhandler<MapPointSubCategoriesItem>(
      this.MapPointSubCategoriesItemsModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return mapPoint;
  }

  async updateMapPointSubCategoriesItems(id: string, dto): Promise<MapPointSubCategoriesItem> {
    const mapPointSubCategoriesItems = await updateById<MapPointSubCategoriesItem>(
      this.MapPointSubCategoriesItemsModel,
      id,
      dto,
    );
    if (!mapPointSubCategoriesItems) {
      throw new NotFoundException(ServerErrors.MAP_POINT_SUB_CATEGORIES_ITEMS_NOT_FOUND);
    }
    return mapPointSubCategoriesItems;
  }

  async softDeleteMapPointSubCategoriesItems(id: string): Promise<MapPointSubCategoriesItem> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const mapPointSubCategoriesItems = await updateById<MapPointSubCategoriesItem>(
      this.MapPointSubCategoriesItemsModel,
      id,
      updateField,
    );
    if (!mapPointSubCategoriesItems) {
      throw new NotFoundException(ServerErrors.MAP_POINT_SUB_CATEGORIES_ITEMS_NOT_FOUND);
    }
    return mapPointSubCategoriesItems;
  }

  /*
    *  global functions
    *
  */
  async findByName(name: string): Promise<MapPoint | undefined> {
    const fieldName = 'name';
    const mapPoint = await findOneByFieldName<MapPoint>(this.MapPointModel, fieldName, name);
    if (!mapPoint) {
      return undefined;
    }
    throw new BadRequestException('Map Point with this name alread exists');
  }
}
