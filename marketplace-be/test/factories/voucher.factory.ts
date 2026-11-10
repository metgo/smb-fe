import { range } from 'lodash';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import { BaseFactory } from 'test/factories/base.factory';
import {
  Voucher,
  VoucherSchema,
} from 'src/modules/vouchers/schema/voucher.schema';

const VoucherModel = mongoose.model(Voucher.name, VoucherSchema);
export class VouchersFactory implements BaseFactory<Voucher> {
  static new() {
    return new VouchersFactory();
  }

  async create(voucher: Partial<Voucher> = {}): Promise<any> {
    const defaultVoucher = {
      _id: new mongoose.Types.ObjectId(),
      name: faker.person.firstName(),
      createdByEmail: faker.internet.email(),
      amount: 1,
      code: faker.internet.password(),
    };
    const newVoucher = await VoucherModel.create({
      ...defaultVoucher,
      ...voucher,
    });
    return newVoucher;
  }

  async createMany(times: number, voucher: Partial<Voucher> = {}) {
    return await Promise.all(range(times).map(() => this.create(voucher)));
  }
}
