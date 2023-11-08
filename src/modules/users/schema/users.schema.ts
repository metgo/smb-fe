import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { UserType } from 'src/modules/users/users.type';

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
    fullName: string;

  @Prop()
    countryCode: string;

  @Prop()
    phoneNumber: string;

  @Prop()
    address: string;

  @Prop({ required: true, unique: true })
    email: string;

  @Prop({ required: true })
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

  @Prop({ default: Date.now })
    createdAt: Date;

  @Prop({ default: Date.now })
    updatedAt: Date;

  @Prop({ default: null })
    deletedAt: Date;
}

export type Users = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
