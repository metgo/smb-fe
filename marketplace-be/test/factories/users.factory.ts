import { range } from 'lodash';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import { User, UserSchema } from 'src/modules/users/schema/users.schema';
import { UserType } from 'src/modules/users/users.type';
import { BaseFactory } from 'test/factories/base.factory';

const UserModel = mongoose.model(User.name, UserSchema);
export class UsersFactory implements BaseFactory<User> {
  static new() {
    return new UsersFactory();
  }

  async create(user: Partial<User> = {}): Promise<any> {
    const defaultUser = {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserType.TRAVELLER,
    };
    const newUser = await UserModel.create({
      ...defaultUser,
      ...user,
    });
    return newUser;
  }

  async createMany(times: number, user: Partial<User> = {}) {
    return await Promise.all(range(times).map(() => this.create(user)));
  }
}
