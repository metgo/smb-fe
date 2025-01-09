import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class BankAccount extends AuditableSchema {
  @Prop({ required: false })
    bankNumber: string;

  @Prop({ required: false })
    branchNumber: string;

  @Prop({ required: false, default: null })
    accountNumber: string;

  @Prop({ required: false })
    businessNumberByGovt: string;
}

export type BankAccountDocument = HydratedDocument<BankAccount>;

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);
