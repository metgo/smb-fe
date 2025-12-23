import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { GroupType } from 'src/modules/group-type/schema/group-type.schema';
import { Accessibility } from 'src/modules/accessibility/schema/accessibility.schema';
import { Marketing } from 'src/modules/marketing/schema/marketing.schema';
import { Blog } from 'src/modules/blog/schema/blog.schema';
import { Theme } from 'src/modules/themes/schema/theme.schema';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { ExternalApiPurpose } from '../external-api.types';
import { normalizePhone } from 'src/common/utils/normalise-phone';

@Schema({ _id: false })
export class PromotionalItem {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussCategory.name }],
    required: false,
  })
    categoryIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussSubCategory.name }],
    required: false,
  })
    subCategoryIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: GroupType.name }],
    required: false,
  })
    groupTypesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Accessibility.name }],
    required: false,
  })
    accesibilitiesId: mongoose.Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
    isAll: boolean;
}

@Schema()
export class ExternalApi extends AuditableSchema {
  @Prop({
    unique: true,
    required: true,
    type: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },
  })
    companyDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };

  @Prop({ default: null })
    name: string;

  @Prop({ unique: true, type: String, required: true })
    identifierId: string;

  @Prop({ default: null })
    ipAddress: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'dmos',
    required: false,
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'authorities',
    required: false,
  })
    authorityId: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
    required: false,
  })
    campIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
    required: false,
  })
    primaryCampIds: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Theme.name,
    required: false,
  })
    themeId: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Marketing.name }],
    required: false,
  })
    marketingIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Blog.name }],
    required: false,
  })
    blogIds: mongoose.Types.ObjectId[];

  @Prop({ default: null })
    welcomeBanner: string;

  @Prop({ default: null })
    privacyPolicy: string;

  @Prop({ default: ExternalApiPurpose.MARKETPLACE })
    purpose: ExternalApiPurpose;

  @Prop({ type: PromotionalItem, required: false })
    promotionalBusinesses: PromotionalItem;

  @Prop({ type: PromotionalItem, required: false })
    promotionalEvents: PromotionalItem;

  @Prop({ type: PromotionalItem, required: false })
    promotionalTrips: PromotionalItem;

  @Prop({ type: Boolean, default: false })
    displayBusinesses: boolean;

  @Prop({ type: Boolean, default: false })
    displayEvents: boolean;

  @Prop({ type: Boolean, required: false })
    displayTrips: boolean;

  @Prop({ type: Boolean, required: false })
    displayPOI: boolean;

  @Prop({ type: Boolean, required: false })
    displayFunday: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussCategory.name }],
    required: false,
  })
    categoryIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussSubCategory.name }],
    required: false,
  })
    subCategoryIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: GroupType.name }],
    required: false,
  })
    groupTypesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Accessibility.name }],
    required: false,
  })
    accesibilitiesId: mongoose.Types.ObjectId[];
}

export type ExternalApiDocument = HydratedDocument<ExternalApi>;

export const ExternalApiSchema = SchemaFactory.createForClass(ExternalApi);

ExternalApiSchema.pre('save', function (next) {
  if (this?.companyDetails?.phone) {
    this.companyDetails.phone = normalizePhone(this.companyDetails.phone);
  }
  next();
});

ExternalApiSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();

  if (update?.companyDetails?.phone) {
    update.companyDetails.phone = normalizePhone(update.companyDetails.phone);
  }

  next();
});
