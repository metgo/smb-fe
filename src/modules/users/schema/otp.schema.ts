import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './users.schema';

@Schema()
export class OTP {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
    code: string;

  @Prop({ required: true })
    expireDate: Date;

  @Prop({ default: false, required: true })
    isVerify: Boolean;

  @Prop(
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: User.name,
    },
  )
    userId: mongoose.Types.ObjectId;
}

export type OTPs = HydratedDocument<OTP>;

export const OTPSchema = SchemaFactory.createForClass(OTP);
