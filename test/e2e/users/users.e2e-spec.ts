import { HttpStatus, INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import * as request from 'supertest';
import { SuperTest } from 'supertest';
import mongoose from 'mongoose';

import { UserType } from 'src/modules/users/users.type';
import { authToken } from 'test/factories/auth.factory';
import { appFactory } from 'test/factories/app';
import { UsersFactory } from 'test/factories/users.factory';
import { User, UserSchema } from 'src/modules/users/schema/users.schema';

describe('Users e2e Test', () => {
  let app: INestApplication;
  let superTest: SuperTest<any>;
  let usersFactory: UsersFactory;
  const userModel = mongoose.model(User.name, UserSchema);

  beforeAll(async () => {
    app = await appFactory();
    usersFactory = await app.get(UsersFactory);
    superTest = request(app.getHttpServer());
  });

  beforeEach(async () => {
    const { collections } = mongoose.connection;
    const deleteOperations = Object.values(collections).map(
      async collection => await collection.deleteMany({}),
    );

    await Promise.all(deleteOperations);
    jest.restoreAllMocks();
  });

  it('[GET] /users/me should provide my information', async () => {
    const user = await usersFactory.create();
    await superTest
      .get('/users/me')
      .set({ Authorization: `Bearer ${authToken(user)}` })
      .expect(HttpStatus.OK);
  });

  it('[GET] /users/me should throw error if the user is not logged in', async () => {
    await superTest.get('/users/me').expect(HttpStatus.UNAUTHORIZED);
  });

  it('[GET] /users should show list of all users to superadmin', async () => {
    const user = await usersFactory.create({ role: UserType.SUPERADMIN });
    await usersFactory.createMany(5);

    const { body } = await superTest
      .get('/users')
      .set({ Authorization: `Bearer ${authToken(user)}` })
      .expect(HttpStatus.OK);

    expect(body.datas.totalData).toEqual(6);
  });

  it('[GET] /users should show not allow other users to see list of all users', async () => {
    const user = await usersFactory.create({ role: UserType.TRAVELLER });

    await usersFactory.createMany(2);

    await superTest
      .get('/users')
      .set({ Authorization: `Bearer ${authToken(user)}` })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('[PATCH] /users/me should update my information', async () => {
    const user = await usersFactory.create({ firstName: 'MetGo' });
    const firstName = faker.person.firstName();

    const { body } = await superTest
      .patch('/users/me')
      .set({ Authorization: `Bearer ${authToken(user)}` })
      .send({
        firstName,
      })
      .expect(HttpStatus.OK);

    expect(body.datas.firstName).toEqual(firstName);
  });

  it('[PATCH] /users/:userId should update user information by admin', async () => {
    const [user, superadmin] = await Promise.all([
      usersFactory.create({ firstName: 'MetGo' }),
      usersFactory.create({ role: UserType.SUPERADMIN }),
    ]);
    const firstName = faker.person.firstName();

    const { body } = await superTest
      .patch(`/users/${user.id}`)
      .set({ Authorization: `Bearer ${authToken(superadmin)}` })
      .send({
        firstName,
      })
      .expect(HttpStatus.OK);

    expect(body.datas.firstName).toEqual(firstName);
  });

  it('[PATCH] /users/:userId should not update user information if not admin', async () => {
    const [user, traveller] = await Promise.all([
      usersFactory.create({ firstName: 'MetGo' }),
      usersFactory.create({ role: UserType.TRAVELLER }),
    ]);
    const firstName = faker.person.firstName();

    await superTest
      .patch(`/users/${user.id}`)
      .set({ Authorization: `Bearer ${authToken(traveller)}` })
      .send({
        firstName,
      })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('[DELETE] /users/me should delete my information', async () => {
    const user = await usersFactory.create();
    await superTest
      .delete('/users/me')
      .set({ Authorization: `Bearer ${authToken(user)}` })
      .expect(HttpStatus.OK);

    const findUser = await userModel.findOne({
      _id: user._id,
      deletedAt: null,
    });

    expect(findUser).toBeNull();
  });

  it('[DELETE] /users/:userId should delete user information if admin', async () => {
    const [user, superadmin] = await Promise.all([
      usersFactory.create(),
      usersFactory.create({ role: UserType.SUPERADMIN }),
    ]);
    await superTest
      .delete(`/users/${user.id}`)
      .set({ Authorization: `Bearer ${authToken(superadmin)}` })
      .expect(HttpStatus.OK);

    const findUser = await userModel.findOne({
      _id: user._id,
      deletedAt: null,
    });

    expect(findUser).toBeNull();
  });

  it('[DELETE] /users/:userId should not delete user information if not admin', async () => {
    const [user, traveller] = await Promise.all([
      usersFactory.create(),
      usersFactory.create({ role: UserType.TRAVELLER }),
    ]);

    await superTest
      .delete(`/users/${user.id}`)
      .set({ Authorization: `Bearer ${authToken(traveller)}` })
      .expect(HttpStatus.FORBIDDEN);

    const findUser = await userModel.findOne({ _id: user._id });

    expect(findUser).toBeDefined();
  });

  it('[POST] /users/admin should register new traveller by admin', async () => {
    const superadmin = await usersFactory.create({ role: UserType.SUPERADMIN });

    await superTest
      .post('/users/admin')
      .set({ Authorization: `Bearer ${authToken(superadmin)}` })
      .send({
        firstName: 'test',
        lastName: 'test',
        email: 'abc@metgo.app',
        countryCode: '977',
        phoneNumber: '1234567890',
        address: 'test',
        role: UserType.TRAVELLER,
      })
      .expect(HttpStatus.CREATED);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });
});
