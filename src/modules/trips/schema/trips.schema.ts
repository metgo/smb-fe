import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { User } from 'src/modules/users/schema/users.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { TripStatus, TripTypes } from '../trips.types';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { Accessibility } from 'src/modules/accessibility/schema/accessibility.schema';
import { GroupType } from 'src/modules/group-type/schema/group-type.schema';
import { normalizePhone } from 'src/common/utils/normalise-phone';

@Schema({ _id: false })
export class Image {
  @Prop() image: string;
  @Prop() caption: string;
  @Prop() alt: string;
  @Prop() isPrimary: boolean;
  @Prop() stationId: string;
  @Prop({
    type: {
      xMax: Number,
      xMin: Number,
      yMax: Number,
      yMin: Number,
    },
  })
    subCoordinates: Record<string, number>;
}
export const ImageSchema = SchemaFactory.createForClass(Image);

@Schema({ _id: false })
class Station {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Business.name,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
    order: number;

  @Prop({ enum: TripTypes, required: true })
    type: TripTypes;
}
const StationSchema = SchemaFactory.createForClass(Station);

@Schema({ _id: false })
export class Itenary {
  @Prop({ required: true })
    title: string;

  @Prop({ required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ })
    startTime: string;

  @Prop({ required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ })
    endTime: string;
}
export const ItenarySchema = SchemaFactory.createForClass(Itenary);

@Schema({ _id: false })
export class ContactDetails {
  @Prop({ required: false })
    name: string;

  @Prop({ required: false })
    phoneNumber: string;

  @Prop({ required: false })
    email: string;
}
export const ContactDetailsSchema
  = SchemaFactory.createForClass(ContactDetails);

@Schema()
export class Trip extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
    name: string;

  @Prop({ enum: TripStatus, default: TripStatus.PENDING })
    status: TripStatus;

  @Prop()
    shortDescription: string;

  @Prop()
    description: string;

  @Prop({ type: ContactDetailsSchema })
    contactDetails: ContactDetails;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Authority.name,
    required: false,
    default: null,
  })
    authorityId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DMO.name,
    required: false,
    default: null,
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop()
    slug: string;

  @Prop({ type: [StationSchema], default: [] })
    stations: Station[];

  @Prop({ type: [ImageSchema], default: [] })
    images: Image[];

  @Prop({ type: [ItenarySchema], default: [] })
    itenary: Itenary[];

  @Prop()
    estimatedDuration?: number;

  @Prop()
    totalDistanceCovered?: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: GroupType.name }],
    required: false,
  })
    groupTypesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Accessibility.name }],
    required: false,
  })
    accessibilitiesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussCategory.name }],
    required: false,
  })
    categoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussSubCategory.name }],
    required: false,
  })
    subCategoriesId: mongoose.Types.ObjectId[];

  @Prop({ default: true })
    isTrip: boolean;
}

export type TripDocument = HydratedDocument<Trip>;
export const TripSchema = SchemaFactory.createForClass(Trip);
TripSchema.index({ name: 'text', description: 'text' });

TripSchema.pre('save', function (next) {
  if (this?.contactDetails?.phoneNumber) {
    this.contactDetails.phoneNumber = normalizePhone(
      this.contactDetails.phoneNumber,
    );
  }
  next();
});

TripSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();

  if (update?.contactDetails?.phoneNumber) {
    update.contactDetails.phoneNumber = normalizePhone(
      update.contactDetails.phoneNumber,
    );
  }

  next();
});
