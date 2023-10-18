import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business } from './schema/business.schema';
import { createBusinessDto, updateBusinessDto } from './dto';
import { queryhandler } from 'src/core/helper/query-helper';

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

  async updateBusiness(id: string, dto: updateBusinessDto) {
    console.log(id);
    const updateBusiness = await this.BusinessModel.findOneAndUpdate({ _id: id }, dto, { new: true });
    if (!updateBusiness) {
      throw new NotFoundException('Business not found');
    }
    return updateBusiness;
  }

  async findBusinessEmail(email: string): Promise<boolean> {
    console.log({ email });
    const bussEmail = await this.BusinessModel.findOne({ busiEmail: email });
    if (bussEmail) {
      return true;
    }
    return false;
  }
}
