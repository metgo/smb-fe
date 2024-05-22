import { range } from 'lodash';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import { BaseFactory } from 'test/factories/base.factory';
import { DMO, DMOSchema } from 'src/modules/dmo/schema/dmo.schema';

const DMOModel = mongoose.model(DMO.name, DMOSchema);
export class DMOFactory implements BaseFactory<DMO> {
  static new() {
    return new DMOFactory();
  }

  async create(dmo: Partial<DMO> = {}): Promise<any> {
    const defaultDMO = {
      _id: new mongoose.Types.ObjectId(),
      name: faker.person.firstName(),
    };
    const newDMO = await DMOModel.create({
      ...defaultDMO,
      ...dmo,
    });
    return newDMO;
  }

  async createMany(times: number, dmo: Partial<DMO> = {}) {
    return await Promise.all(range(times).map(() => this.create(dmo)));
  }
}
