import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business } from './schema/business.schema';
import { createBusinessDto, updateBusinessDto } from './dto';
import {
  findOneByFieldName,
  findOneById, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';

@Injectable()
export class BusinessService {
  constructor(@InjectModel('Business') private BusinessModel: Model<Business>) { }

  async createBusiness(dto: createBusinessDto): Promise<Business> {
    const newBusiness = new this.BusinessModel(dto);
    await newBusiness.save();
    return newBusiness;
  }

  async getAllBusiness() {
    let findQuery: {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: string;
    let populate1: string;
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

  async findBusinessByFieldName(fieldName: keyof Business, items: string): Promise<boolean> {
    const bussEmail = await findOneByFieldName<Business>(this.BusinessModel, fieldName, items);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName === 'name' ? 'Business Name' : 'Business Email'} already exists`);
    }
    return undefined;
  }
}
