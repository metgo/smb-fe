import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  createMPCategoriesDto,
  FilterQuery,
  updateMPCategoriesDto,
} from './dto';
import { MPCategories } from './schema/categories.schema';
import { Model } from 'mongoose';
import {
  findOneByFieldName,
  findOneByFieldNameExcludeId,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { disSelect } from 'src/common/utils/select.handling';

@Injectable()
export class MPCategoiresService {
  constructor(
    @InjectModel('MPCategories') private MPCategoriesModel: Model<MPCategories>,
  ) {}

  async createMPCategories(dto: createMPCategoriesDto): Promise<MPCategories> {
    const newMapPoint = new this.MPCategoriesModel(dto);
    return newMapPoint.save();
  }

  async getAllMPCategories(query: FilterQuery): Promise<MPCategories & any> {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: any;
    let populate1: {};

    // eslint-disable-next-line prefer-const

    if (query.mapPointId) {
      const mapPoint = JSON.parse(query.mapPointId);
      findQuery = {
        mapPointId: { $in: mapPoint },
      };
    }
    // eslint-disable-next-line prefer-const
    populate = {
      path: 'mapPointId',
      select: '_id, name',
      match: { delatedAt: { $in: [false, null] } },
    };
    // eslint-disable-next-line prefer-const
    populate1 = {
      path: 'icon',
      select: disSelect,
    };
    // eslint-disable-next-line prefer-const
    select = disSelect;
    const mapPoint = await queryhandler<MPCategories>(this.MPCategoriesModel, {
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    });

    return mapPoint;
  }

  async updateMPCategories(
    id: string,
    dto: updateMPCategoriesDto,
  ): Promise<MPCategories> {
    const mpCategories = await updateById<MPCategories>(
      this.MPCategoriesModel,
      id,
      dto,
    );
    if (!mpCategories) {
      throw new NotFoundException(ServerErrors.MAP_POINT_CATEGORIES_NOT_FOUND);
    }
    return mpCategories;
  }

  async softDeleteMPCategories(id: string): Promise<MPCategories> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const mpCategories = await updateById<MPCategories>(
      this.MPCategoriesModel,
      id,
      updateField,
    );
    if (!mpCategories) {
      throw new NotFoundException(
        ServerErrors.MAP_POINT_SUB_CATEGORIES_NOT_FOUND,
      );
    }
    return mpCategories;
  }

  async findByFieldName(
    fieldName: keyof MPCategories,
    items: string,
  ): Promise<boolean> {
    const mpCategories = await findOneByFieldName<MPCategories>(
      this.MPCategoriesModel,
      fieldName,
      items,
    );
    if (mpCategories) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(
    fieldName: keyof MPCategories,
    items: string,
    id: string,
  ): Promise<boolean> {
    const mpCategories = await findOneByFieldNameExcludeId<MPCategories>(
      this.MPCategoriesModel,
      fieldName,
      items,
      id,
    );
    if (mpCategories) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
