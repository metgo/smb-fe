import { HttpStatus, INestApplication } from '@nestjs/common';
import { addDays, subDays } from 'date-fns';
import mongoose from 'mongoose';
import * as request from 'supertest';
import { SuperTest } from 'supertest';

import { VoucherPaymentStatus } from 'src/common/enum';
import { UserType } from 'src/modules/users/users.type';
import { appFactory } from 'test/factories/app';
import { authToken } from 'test/factories/auth.factory';
import { CampaignFactory } from 'test/factories/campaign.factory';
import { DMOFactory } from 'test/factories/dmo.factory';
import { ProductFactory } from 'test/factories/products.factory';
import { ProductStatus } from 'src/modules/products/products.type';
import { UsersFactory } from 'test/factories/users.factory';
import { VouchersFactory } from 'test/factories/voucher.factory';

describe('Users e2e Test', () => {
  let app: INestApplication;
  let superTest: SuperTest<any>;
  let campaignFactory: CampaignFactory;
  let dmoFactory: DMOFactory;
  let productFactory: ProductFactory;
  let usersFactory: UsersFactory;
  let voucherFactory: VouchersFactory;

  beforeAll(async () => {
    app = await appFactory();
    superTest = request(app.getHttpServer());
    campaignFactory = await app.get(CampaignFactory);
    dmoFactory = await app.get(DMOFactory);
    productFactory = await app.get(ProductFactory);
    usersFactory = await app.get(UsersFactory);
    voucherFactory = await app.get(VouchersFactory);
  });

  beforeEach(async () => {
    const { collections } = mongoose.connection;
    const deleteOperations = Object.values(collections).map(
      async collection => await collection.deleteMany({}),
    );

    await Promise.all(deleteOperations);
    jest.restoreAllMocks();
  });

  it('[POST] /buy-voucher should buy voucher', async () => {
    const campaign = await campaignFactory.create({ code: 'TEST' });
    await superTest
      .post('/buy-voucher')
      .send({
        name: 'test',
        campCode: campaign.code,
        amount: 1,
        noOfVoucher: 1,
        email: 'abc@metgo.app',
        languagePreference: 'en',
      })
      .expect(HttpStatus.CREATED);
  });

  it('[POST] /buy-voucher should use correct campaign code', async () => {
    await superTest
      .post('/buy-voucher')
      .send({
        name: 'test',
        campCode: 'TEST',
        amount: 1,
        noOfVoucher: 1,
        email: 'abc@metgo.app',
        languagePreference: 'en',
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('[POST] /admin/vouchers should create vouchers with paid status', async () => {
    const superadmin = await usersFactory.create({ role: UserType.SUPERADMIN });
    const campaign = await campaignFactory.create({ code: 'TEST' });

    const { body } = await superTest
      .post('/admin/vouchers')
      .set({ Authorization: `Bearer ${authToken(superadmin)}` })
      .send({
        name: 'test',
        campCode: campaign.code,
        amount: 1,
        noOfVoucher: 1,
        email: 'abc@metgo.app',
        languagePreference: 'en',
      })
      .expect(HttpStatus.CREATED);

    expect(body.datas[0].paymentStatus).toBe(VoucherPaymentStatus.PAID);
  });

  it('[POST] /admin/vouchers should not create vouchers if not superadmin', async () => {
    const traveller = await usersFactory.create({ role: UserType.TRAVELLER });
    const campaign = await campaignFactory.create({ code: 'TEST' });

    await superTest
      .post('/admin/vouchers')
      .set({ Authorization: `Bearer ${authToken(traveller)}` })
      .send({
        name: 'test',
        campCode: campaign.code,
        amount: 1,
        noOfVoucher: 1,
        email: 'abc@metgo.app',
        languagePreference: 'en',
      })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('[GET] /voucher-code/:code should not return voucher details if productId is not sent', async () => {
    const campaign = await campaignFactory.create({ code: 'TEST' });

    const expireDate = addDays(new Date(), 5);

    const voucher = await voucherFactory.create({
      campId: campaign.id,
      paymentStatus: VoucherPaymentStatus.PAID,
      expireDate,
    });

    const { body } = await superTest
      .get(`/voucher-code/${voucher.code}`)
      .expect(HttpStatus.BAD_REQUEST);

    expect(body.message).toContain('productId should not be empty');
  });

  it('[GET] /voucher-code/:code should return paid voucher details', async () => {
    const dmo = await dmoFactory.create();

    const [product, campaign] = await Promise.all([
      productFactory.create({ status: ProductStatus.ACTIVE, dmoId: dmo._id }),
      campaignFactory.create({ code: 'TEST', dmoIds: [dmo._id] }),
    ]);

    const expireDate = addDays(new Date(), 5);

    const voucher = await voucherFactory.create({
      campId: campaign.id,
      paymentStatus: VoucherPaymentStatus.PAID,
      expireDate,
    });

    superTest
      .get(`/voucher-code/${voucher.code}`)
      .query({ productId: product._id.toString() })
      .expect(HttpStatus.OK);
  });

  it('[GET] /voucher-code/:code should not return if voucher is not paid', async () => {
    const dmo = await dmoFactory.create();

    const [product, campaign] = await Promise.all([
      productFactory.create({ status: ProductStatus.ACTIVE, dmoId: dmo._id }),
      campaignFactory.create({ code: 'TEST', dmoIds: [dmo._id] }),
    ]);

    const voucher = await voucherFactory.create({ campId: campaign.id });

    await superTest
      .get(`/voucher-code/${voucher.code}`)
      .query({ productId: product._id.toString() })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('[GET] /voucher-code/:code should not return if voucher is expired', async () => {
    const dmo = await dmoFactory.create();

    const [product, campaign] = await Promise.all([
      productFactory.create({ status: ProductStatus.ACTIVE, dmoId: dmo._id }),
      campaignFactory.create({ code: 'TEST', dmoIds: [dmo._id] }),
    ]);

    const expireDate = subDays(new Date(), 1);
    const voucher = await voucherFactory.create({
      campId: campaign.id,
      expireDate,
    });

    await superTest
      .get(`/voucher-code/${voucher.code}`)
      .query({ productId: product._id.toString() })
      .expect(HttpStatus.GONE);
  });

  it('[GET] /voucher-id/:id should return paid voucher details irrespective of payment status', async () => {
    const user = await usersFactory.create();
    const campaign = await campaignFactory.create({ code: 'TEST' });
    const expireDate = addDays(new Date(), 5);

    const voucher = await voucherFactory.create({
      campId: campaign.id,
      expireDate,
    });

    await superTest
      .get(`/voucher-id/${voucher.id}`)
      .set({ Authorization: `Bearer ${authToken(user)}` })
      .expect(HttpStatus.OK);
  });

  it('[GET] /voucher-id/:id should not return if voucher is expired', async () => {
    const user = await usersFactory.create();
    const campaign = await campaignFactory.create({ code: 'TEST' });
    const expireDate = subDays(new Date(), 1);
    const voucher = await voucherFactory.create({
      campId: campaign.id,
      expireDate,
    });

    await superTest
      .get(`/voucher-id/${voucher.id}`)
      .set({ Authorization: `Bearer ${authToken(user)}` })
      .expect(HttpStatus.GONE);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });
});
