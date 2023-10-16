import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business } from './schema/business.schema';
import { createBusinessDto } from './dto';

@Injectable()
export class BusinessService {
  constructor(@InjectModel('Business') private BusinessModel: Model<Business>) { }

  async createBusiness(dto: createBusinessDto): Promise<Business> {
    const newBusiness = new this.BusinessModel(dto);
    await newBusiness.save();
    return newBusiness;
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
