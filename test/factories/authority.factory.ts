import { range } from 'lodash';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import { BaseFactory } from 'test/factories/base.factory';
import {
  Authority,
  AuthoritySchema,
} from 'src/modules/authority/schema/authority.schema';

const AuthorityModel = mongoose.model(Authority.name, AuthoritySchema);
export class AuthorityFactory implements BaseFactory<Authority> {
  static new() {
    return new AuthorityFactory();
  }

  async create(authority: Partial<Authority> = {}): Promise<any> {
    const defaultAuthority = {
      name: faker.person.firstName(),
      dmoId: new mongoose.Types.ObjectId(),
    };
    const newAuthority = await AuthorityModel.create({
      ...defaultAuthority,
      ...authority,
    });
    return newAuthority;
  }

  async createMany(times: number, authority: Partial<Authority> = {}) {
    return await Promise.all(range(times).map(() => this.create(authority)));
  }
}
