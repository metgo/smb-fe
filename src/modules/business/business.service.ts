import {
  BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business } from './schema/business.schema';
import { createBusinessDto, updateBusinessDto } from './dto';
import {
  findOneByFieldName,
  findOneById, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { FilterQuery } from './interface/FilterQuery.interface';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel('Business') private BusinessModel: Model<Business>,
  ) { }

  async createBusiness(dto: createBusinessDto): Promise<Business> {
    const newBusiness = new this.BusinessModel(dto);
    await newBusiness.save();
    return newBusiness;
  }

  async getAllBusiness(query: FilterQuery) {
    let findQuery: any = {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: any;
    let populate1: string;
    if (query.search) {
      findQuery = {
        ...query,
        $text: { $search: query.search, $caseSensitive: false, $diacriticSensitive: false },
      };

      delete findQuery?.search;
    } else if (query) {
      findQuery = {
        ...query,
      };
    }
    // eslint-disable-next-line prefer-const
    populate = {
      path: 'mapPointId mapPointCategoriesId mapPointSubCategoriesId',
      select: '-createdAt -updatedAt -createdBy -updatedBy -deletedBy -deletedAt -isDeleted',
    };
    // eslint-disable-next-line prefer-const
    select = '-createdAt -updatedAt -createdBy -updatedBy -deletedBy -deletedAt -isDeleted';
    const allBusiness = await queryhandler<Business>(
      this.BusinessModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return allBusiness;
  }

  async getBusiness(id: string) {
    const business = await findOneById<Business>(this.BusinessModel, id);

    if (!business) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return business;
  }

  async updateBusiness(id: string, dto: updateBusinessDto) {
    const updateBusiness = await this.BusinessModel.findOneAndUpdate({ _id: id }, dto, { new: true });
    if (!updateBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updateBusiness;
  }

  async deleteBusiness(id: string): Promise<Business> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const business = await updateById<Business>(this.BusinessModel, id, updateField);
    if (!business) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return business;
  }

  async findByFieldName(fieldName: keyof Business, items: string): Promise<boolean> {
    const bussEmail = await findOneByFieldName<Business>(this.BusinessModel, fieldName, items);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return undefined;
  }
}
