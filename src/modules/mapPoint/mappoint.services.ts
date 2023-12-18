import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { disSelect } from 'src/common/utils/select.handling';

import { MapPoint } from './schema/mappoint.schema';
import {
  findOneByFieldName, findOneByFieldNameExcludeId, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { FilterQuery, createMapPointDto, updateMapPointDto } from './dto';

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

  async getAllMapPoint(queries: FilterQuery): Promise<MapPoint & any> {
    const {
      page, limit, search,
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: {};
    let select: {};
    let populate: {};
    let populate1: string;

    if (search) {
      findQuery = {
        $text: { $search: search, $caseSensitive: false, $diacriticSensitive: false },
      };
    }

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
      queryPage,
      queryLimit,
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

  async findByFieldNameExcludeId(fieldName: keyof MapPoint, items: string, id:string): Promise<boolean> {
    const mapPoint = await findOneByFieldNameExcludeId<MapPoint>(
      this.MapPointModel,
      fieldName,
      items,
      id,
    );
    if (mapPoint) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
