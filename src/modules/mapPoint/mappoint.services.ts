import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MapPoint } from './schema/mappoint.schema';
import { findOneByFieldName, queryhandler, updateById } from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { createMapPointDto } from './dto';
import { updateMapPointDto } from './dto/updateMapPoint.dto';
import { disSelect } from 'src/common/utils/select.handling';

@Injectable()
export class MapPointServices {
  constructor(
    @InjectModel('MapPoint') private MapPointModel: Model<MapPoint>,
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
    let populate: {};
    let populate1: string;

    // eslint-disable-next-line prefer-const
    populate = {
      path: 'icon',
      select: disSelect,
    };
    // eslint-disable-next-line prefer-const
    select = disSelect;
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

  async updateMapPoint(id: string, dto: updateMapPointDto): Promise<MapPoint> {
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
    *  global functions
    *
  */
  async findByName(name: string): Promise<MapPoint | undefined> {
    const fieldName = 'name';
    const mapPoint = await findOneByFieldName<MapPoint>(this.MapPointModel, fieldName, name);
    if (!mapPoint) {
      return undefined;
    }
    throw new BadRequestException(ServerErrors.MAP_POINT_EXISTS);
  }
}
