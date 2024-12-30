import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class BankAccount extends AuditableSchema {
  @Prop({ required: true })
    bankNumber: string;

  @Prop({ required: true })
    branchNumber: string;

  @Prop({ required: false, default: null })
    accountNumber: string;

  @Prop({ required: true })
    businessNumberByGovt: string;
}

export type BankAccountDocument = HydratedDocument<BankAccount>;

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);
