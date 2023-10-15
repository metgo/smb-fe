import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createMapPointCategoriesDto, createMapPointDto } from './dto';
import { MapPoint } from './schema/mappoint.schema';
import { MapPointCategories } from './schema/mappoint-categoires.schema';
import { findAll, findOneByFieldName } from 'src/core/helper/query-helper';

@Injectable()
export class MapPointServices {
  constructor(
    @InjectModel('MapPoint') private MapPointModel: Model<MapPoint>,
    @InjectModel('MapPointCategoires') private MapPointModelCategoires: Model<MapPointCategories>,
  ) { }

  // mappoint details
  async createMapPoint(dto: createMapPointDto): Promise<MapPoint> {
    const newMapPoint = new this.MapPointModel(dto);
    return newMapPoint.save();
  }

  async getAllMapPoint(): Promise<MapPoint & any> {
    const mapPoint = await findAll<MapPoint>(this.MapPointModel);
    console.log(mapPoint);
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
    const newMapPoint = new this.MapPointModelCategoires(dto);
    return newMapPoint.save();
  }
}
