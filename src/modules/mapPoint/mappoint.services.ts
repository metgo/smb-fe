import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  createMapPointCategoriesDto, createMapPointDto, createMapPointSubCategoriesDto, createMapPointSubCategoriesItemDto,
} from './dto';
import { MapPoint } from './schema/mappoint.schema';
import { MapPointCategories } from './schema/mappoint-categories.schema';
import { findAll, findOneByFieldName } from 'src/core/helper/query-helper';
import { MapPointSubCategories } from './schema/mappoint-sub-categories.schema';
import { MapPointSubCategoriesItem } from './schema/mappoint-sub-categories.item.schema';

@Injectable()
export class MapPointServices {
  constructor(
    @InjectModel('MapPoint') private MapPointModel: Model<MapPoint>,
    @InjectModel('MapPointCategories') private MapPointCategoriesModel: Model<MapPointCategories>,
    @InjectModel('MapPointSubCategories') private MapPointSubCategoriesModel: Model<MapPointSubCategories>,
     @InjectModel('MapPointSubCategoriesItems') private MapPointSubCategoriesItemsModel: Model<MapPointSubCategoriesItem>,
  ) { }

  // mappoint details
  async createMapPoint(dto: createMapPointDto): Promise<MapPoint> {
    const newMapPoint = new this.MapPointModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPoint(): Promise<MapPoint & any> {
    const mapPoint = await findAll<MapPoint>(this.MapPointModel);
    if (mapPoint.length === 0) {
      throw new NotFoundException('Map Point Not Found');
    }

    return mapPoint;
  }

  async createMapPointCategories(dto: createMapPointCategoriesDto): Promise<MapPointCategories> {
    const newMapPoint = new this.MapPointCategoriesModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPointCategories(): Promise<MapPointCategories & any> {
    const mapPoint = await findAll<MapPointCategories>(this.MapPointCategoriesModel);
    if (mapPoint.length === 0) {
      throw new NotFoundException('Map Point Categories Not Found');
    }

    return mapPoint;
  }

  async createMapPointSubCategories(dto: createMapPointSubCategoriesDto): Promise<MapPointSubCategories> {
    const newMapPoint = new this.MapPointSubCategoriesModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPointSubCategories(): Promise<MapPointSubCategories & any> {
    const mapPoint = await findAll<MapPointSubCategories>(this.MapPointSubCategoriesModel);
    if (mapPoint.length === 0) {
      throw new NotFoundException('Map Point Sub Categories Not Found');
    }

    return mapPoint;
  }

  async createMapPointSubCategoriesItems(dto: createMapPointSubCategoriesItemDto): Promise<MapPointSubCategoriesItem> {
    const newMapPoint = new this.MapPointSubCategoriesItemsModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPointSubCategoriesItems(): Promise<MapPointSubCategoriesItem & any> {
    const mapPoint = await findAll<MapPointSubCategoriesItem>(this.MapPointSubCategoriesItemsModel);
    if (mapPoint.length === 0) {
      throw new NotFoundException('Map Point Sub Categories items Not Found');
    }
    return mapPoint;
  }

  async findByName(name: string): Promise<MapPoint | undefined> {
    const fieldName = 'name';
    const mapPoint = await findOneByFieldName<MapPoint>(this.MapPointModel, fieldName, name);
    if (!mapPoint) {
      return undefined;
    }
    throw new BadRequestException('Map Point with this name alread exists');
  }
}
