import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { twoYearExpireDate } from 'src/common/expireDate';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class VoucherTemplate extends AuditableSchema {
  @Prop()
    name: string;

  @Prop()
    amount: number;

  @Prop()
    campCode: string;

  @Prop()
    description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  })
    campId: string;

  @Prop()
    imagePath: string;

  @Prop()
    imageAlt: string;

  @Prop({ default: twoYearExpireDate() })
    expireDate: Date;
}

export type VoucherTemplateDocument = HydratedDocument<VoucherTemplate>;
export const VoucherTemplateSchema
  = SchemaFactory.createForClass(VoucherTemplate);
