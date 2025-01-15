import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SuperTest } from 'supertest';
import mongoose from 'mongoose';

import { authToken } from 'test/factories/auth.factory';
import { appFactory } from 'test/factories/app';
import { ProductFactory } from 'test/factories/products.factory';
import { UsersFactory } from 'test/factories/users.factory';
import { ProductStatus } from 'src/modules/products/products.type';
import { UserType } from 'src/modules/users/users.type';

describe('Users e2e Test', () => {
  let app: INestApplication;
  let superTest: SuperTest<any>;
  let productFactory: ProductFactory;
  let usersFactory: UsersFactory;

  beforeAll(async () => {
    app = await appFactory();
    productFactory = await app.get(ProductFactory);
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

  it('[GET] /products should list all active products to non-authenticated user', async () => {
    await Promise.all([
      productFactory.createMany(3, { status: ProductStatus.ACTIVE }),
      productFactory.createMany(2, { status: ProductStatus.INACTIVE }),
    ]);

    const { body } = await superTest.get('/products').expect(HttpStatus.OK);

    expect(body.datas.totalData).toEqual(3);
  });

  it('[GET] /admin/products should list all products to admin users', async () => {
    const [superadmin] = await Promise.all([
      usersFactory.create({ role: UserType.SUPERADMIN }),
      productFactory.createMany(3, { status: ProductStatus.ACTIVE }),
      productFactory.createMany(2, { status: ProductStatus.INACTIVE }),
    ]);

    const { body } = await superTest
      .get('/admin/products')
      .set({ Authorization: `Bearer ${authToken(superadmin)}` })
      .expect(HttpStatus.OK);

    expect(body.datas.totalData).toEqual(5);
  });

  it('[GET] /admin/products should not allow to use non-admin users', async () => {
    await Promise.all([
      productFactory.createMany(3, { status: ProductStatus.ACTIVE }),
      productFactory.createMany(2, { status: ProductStatus.INACTIVE }),
    ]);

    await superTest.get('/admin/products').expect(HttpStatus.UNAUTHORIZED);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });
});
