import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SuperTest } from 'supertest';
import mongoose from 'mongoose';

import { authToken } from 'test/factories/auth.factory';
import { appFactory } from 'test/factories/app';
import { UsersFactory } from 'test/factories/users.factory';
import { BusinessesFactory } from 'test/factories/business.factory';

describe('Users e2e Test', () => {
  let app: INestApplication;
  let superTest: SuperTest<any>;
  let usersFactory: UsersFactory;
  let businessesFactory: BusinessesFactory;

  beforeAll(async () => {
    app = await appFactory();
    usersFactory = await app.get(UsersFactory);
    businessesFactory = await app.get(BusinessesFactory);
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

  it('[POST] /businesses/:businessId/products should create product of business', async () => {
    const user = await usersFactory.create();
    const business = await businessesFactory.create({ userId: user.id });

    const dto = {
      price: {
        markedPrice: 30,
      },
      quantity: {
        initial: 5,
      },
    };

    await superTest
      .post(`/businesses/${business.id}/products`)
      .set({ Authorization: `Bearer ${authToken(user)}` })
      .send(dto)
      .expect(HttpStatus.CREATED);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });
});
