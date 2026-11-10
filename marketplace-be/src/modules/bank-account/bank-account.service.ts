/* eslint-disable no-undef */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'typeorm';

import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { BankAccount } from './bank-account.schema';
import { BankAccountDTO } from './bank-account.dto';

@Injectable()
export class BankAccountServices {
  constructor(
    @InjectModel(BankAccount.name)
    private BankAccountModel: Model<BankAccount>,
  ) {}

  async create(loggedInUser: LoggedInUserInterface, body: BankAccountDTO) {
    const newAccount = new this.BankAccountModel({
      ...body,
      createdBy: loggedInUser.id,
      createdAt: new Date(),
    });

    const bankAccount = await newAccount.save();
    return bankAccount;
  }

  async update(
    loggedInUser: LoggedInUserInterface,
    id: ObjectId,
    body: BankAccountDTO,
  ) {
    const updateAccount = {
      ...body,
      updatedBy: loggedInUser.id,
      updatedAt: new Date(),
    };

    const updatedBankAccount = await this.BankAccountModel.updateOne(
      { _id: id },
      {
        $set: updateAccount,
      },
    );
    return updatedBankAccount;
  }
}
