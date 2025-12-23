import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Locale } from 'src/common/enum';
import { normalizePhone } from 'src/common/utils/normalise-phone';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { UserType } from 'src/modules/users/users.type';

@Schema({})
export class User extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ default: null })
    firstName: string;

  @Prop({ default: null })
    lastName: string;

  @Prop()
    countryCode: string;

  @Prop()
    phoneNumber: string;

  @Prop()
    address: string;

  @Prop({ default: null })
    dob: Date;

  @Prop({ required: true })
    email: string;

  @Prop({ default: Locale.ENGLISH })
    languagePreference: Locale;

  @Prop({ required: false, default: '' })
    password: string;

  @Prop({ type: Date })
    lastLogin: Date;

  @Prop({ default: false })
    isPhoneVerify: boolean;

  @Prop({ default: false })
    isEmailVerify: boolean;

  @Prop({ default: 0, max: 5 })
    loginAttempts: number;

  @Prop({ enum: UserType, default: UserType.TRAVELLER })
    role: UserType;

  @Prop({ default: false })
    hasBusiness: boolean;

  @Prop({
    default: null,
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;
}

export type Users = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1, externalApiId: 1 }, { unique: true });

UserSchema.pre('save', function (next) {
  if (this?.phoneNumber) {
    this.phoneNumber = normalizePhone(this.phoneNumber);
  }
  next();
});

UserSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();

  if (update?.phoneNumber) {
    update.phoneNumber = normalizePhone(update.phoneNumber);
  }

  next();
});
