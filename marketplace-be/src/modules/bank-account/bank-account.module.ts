import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BankAccount, BankAccountSchema } from './bank-account.schema';
import { BankAccountServices } from './bank-account.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BankAccount.name, schema: BankAccountSchema },
    ]),
  ],
  providers: [BankAccountServices],
  exports: [BankAccountServices],
})
export class BankAccountModule {}
