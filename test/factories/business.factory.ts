import { range } from 'lodash';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import {
  Business,
  BusinessSchema,
} from 'src/modules/business/shared/schema/business.schema';
import { BaseFactory } from 'test/factories/base.factory';
import { CommonStatus } from 'src/common/enum';

const BusinessModel = mongoose.model(Business.name, BusinessSchema);
export class BusinessesFactory implements BaseFactory<Business> {
  static new() {
    return new BusinessesFactory();
  }

  async create(business: Partial<Business> = {}): Promise<any> {
    const defaultBusiness = {
      name: faker.person.firstName(),
      busiEmail: faker.internet.email(),
      status: CommonStatus.APPROVED,
      userId: new mongoose.Types.ObjectId(),
      authorityId: new mongoose.Types.ObjectId(),
      dmoId: new mongoose.Types.ObjectId(),
    };
    const newBusiness = await BusinessModel.create({
      ...defaultBusiness,
      ...business,
    });
    return newBusiness;
  }

  async createMany(times: number, business: Partial<Business> = {}) {
    return await Promise.all(range(times).map(() => this.create(business)));
  }
}
