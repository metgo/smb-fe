import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  createMapPointCategoriesDto, createMapPointDto, createMapPointSubCategoriesDto, createMapPointSubCategoriesItemDto,
} from './dto';
import { MapPoint } from './schema/mappoint.schema';
import { MapPointCategories } from './schema/mappoint-categoires.schema';
import { findAll, findOneByFieldName } from 'src/core/helper/query-helper';
import { MapPointSubCategories } from './schema/mappoint-sub-categoires.schema';
import { MapPointSubCategoiresItem } from './schema/mappoint-sub-categories.item.schema';

@Injectable()
export class MapPointServices {
  constructor(
    @InjectModel('MapPoint') private MapPointModel: Model<MapPoint>,
    @InjectModel('MapPointCategoires') private MapPointCategoiresModel: Model<MapPointCategories>,
    @InjectModel('MapPointSubCategoires') private MapPointSubCategoriesModel: Model<MapPointSubCategories>,
     @InjectModel('MapPointSubCategoiresItems') private MapPointSubCategoriesItemsModel: Model<MapPointSubCategoiresItem>,
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

  async findByName(name: string): Promise<MapPoint | undefined> {
    const fieldName = 'name';
    const mapPoint = await findOneByFieldName<MapPoint>(this.MapPointModel, fieldName, name);
    if (!mapPoint) {
      return undefined;
    }
    throw new BadRequestException('Map Point with this name alread exits');
  }

  async createMapPointCategoires(dto: createMapPointCategoriesDto): Promise<MapPointCategories> {
    const newMapPoint = new this.MapPointCategoiresModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPointCategoires(): Promise<MapPointCategories & any> {
    const mapPoint = await findAll<MapPointCategories>(this.MapPointCategoiresModel);
    if (mapPoint.length === 0) {
      throw new NotFoundException('Map Point Not Found');
    }

    return mapPoint;
  }

  async createMapPointSubCategoires(dto: createMapPointSubCategoriesDto): Promise<MapPointSubCategories> {
    const newMapPoint = new this.MapPointSubCategoriesModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPointSubCategoires(): Promise<MapPointSubCategories & any> {
    const mapPoint = await findAll<MapPointSubCategories>(this.MapPointSubCategoriesModel);
    if (mapPoint.length === 0) {
      throw new NotFoundException('Map Point Not Found');
    }

    return mapPoint;
  }

  async createMapPointSubCategoiresItems(dto: createMapPointSubCategoriesItemDto): Promise<MapPointSubCategoiresItem> {
    const newMapPoint = new this.MapPointSubCategoriesItemsModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPointSubCategoiresItems(): Promise<MapPointSubCategoiresItem & any> {
    const mapPoint = await findAll<MapPointSubCategoiresItem>(this.MapPointSubCategoriesItemsModel);
    if (mapPoint.length === 0) {
      throw new NotFoundException('Map Point Not Found');
    }
    return mapPoint;
  }
}
