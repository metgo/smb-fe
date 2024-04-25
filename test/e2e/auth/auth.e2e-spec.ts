import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import mongoose from 'mongoose';
import { SuperTest } from 'supertest';

import { appFactory } from 'test/factories/app';
import { UsersFactory } from 'test/factories/users.factory';

describe('Auth e2e Test', () => {
  let app: INestApplication;
  let superTest: SuperTest<any>;
  let usersFactory: UsersFactory;

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

  it('[POST] /auth/register should register new user', async () => {
    const req = {
      email: 'abc@metgo.app',
      password: 'qwertyuiop',
      firstName: 'test',
      lastName: 'test',
      phoneNumber: '1234567890',
      address: 'test',
      countryCode: '977',
    };
    await superTest.post('/auth/register').send(req).expect(HttpStatus.CREATED);
  });

  it('[POST] /auth/register should not allow to register with existed email', async () => {
    await usersFactory.create({ email: 'abc@metgo.app' });

    const req = {
      email: 'abc@metgo.app',
      password: 'qwertyuiop',
      firstName: 'test',
      lastName: 'test',
      phoneNumber: '1234567890',
      address: 'test',
      countryCode: '977',
    };
    await superTest
      .post('/auth/register')
      .send(req)
      .expect(HttpStatus.CONFLICT);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });
});
