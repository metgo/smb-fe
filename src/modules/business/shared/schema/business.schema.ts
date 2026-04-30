import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { normalizePhone } from 'src/common/utils/normalise-phone';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Accessibility } from 'src/modules/accessibility/schema/accessibility.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { BankAccount } from 'src/modules/bank-account/bank-account.schema';
import {
  BusinessStatus,
  GeoServicesTypes,
} from 'src/modules/business/business.type';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
import { GroupType } from 'src/modules/group-type/schema/group-type.schema';
import { SocialMedia } from 'src/modules/socialMedia/schema/socialMedia.schema';
import { Tags } from 'src/modules/tags/schema/tags.schema';
import { User } from 'src/modules/users/schema/users.schema';

export class DeliveryArea {
  area: string;
  price: string;
  pickUpLocation: {
    address: string;
    isAlwaysOpen: boolean;
    openingHrs: {
      days: string;
      open: Date;
      close: Date;
      isHoliday: {
        type: BooleanConstructor;
        default: boolean;
      };
    }[];
  }[];
}
export class Image {
  image: string;
  caption: string;
  alt: string;
  isPrimary: boolean;
  subCoordinates: {
    xMax: number;
    xMin: number;
    yMax: number;
    yMin: number;
  };
}

@Schema()
export class Business extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: false, default: null })
    name: string;

  @Prop({ required: false, default: null })
    nameHe: string;

  @Prop({ required: false, default: null })
    nameAr: string;

  @Prop()
    internalNotes: string;

  @Prop({
    type: {
      country: String,
      city: String,
      location: String,
      additional_information: String,
    },
    default: null,
    _id: false,
  })
    address: {
    country: { type: string; default: null };
    city: { type: string; default: null };
    location: { type: string; default: null };
    additional_information: { type: string; default: null };
  };

  @Prop()
    countryCode: string;

  @Prop({ default: null })
    phoneNumber: string;

  @Prop({ default: null })
    busiEmail: string;

  @Prop()
    shortDescription: string;

  @Prop()
    description: string;

  @Prop()
    shortDescriptionHe: string;

  @Prop()
    descriptionHe: string;

  @Prop()
    shortDescriptionAr: string;

  @Prop()
    descriptionAr: string;

  @Prop({ enum: BusinessStatus, default: BusinessStatus.PENDING })
    status: BusinessStatus;

  @Prop()
    rejected_reason: string;

  @Prop({ default: true })
    isPreview: boolean;

  @Prop({
    type: {
      name: String,
      countryCode: String,
      phone: String,
      address: String,
      email: String,
      whatsAppCountryCode: String,
      whatsAppNumber: String,
      prefferedChannel: String,
    },
    default: null,
    _id: false,
  })
    contactDetails: {
    name: string;
    countryCode: string;
    phone: string;
    address: string;
    email: string;
    whatsAppCountryCode: string;
    whatsAppNumber: string;
    prefferedChannel: string;
  };

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    ref: User.name,
    required: false,
  })
    collabrationUser: mongoose.Types.ObjectId[];

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

  @Prop({
    type: {
      lat: { type: String, default: null },
      long: { type: String, default: null },
    },
    default: null,
    _id: false,
  })
    geoLocation: {
    lat: { type: string; default: null };
    long: { type: string; default: null };
  };

  @Prop()
    images: Image[];

  @Prop()
    logo: Image;

  @Prop({
    required: false,
    type: [
      {
        socialMediaId: {
          type: mongoose.Types.ObjectId,
          ref: SocialMedia.name,
          _id: false,
        },
        url: String,
      },
    ],
    default: null,
    _id: false,
  })
    socialMedia: [
    {
      socialMediaId: {
        type: mongoose.Types.ObjectId;
      };
      url: { type: string };
    }
  ];

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
    type: mongoose.Schema.Types.ObjectId,
    ref: BussCategory.name,
    required: false,
    default: null,
  })
    primaryCategoryId: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussCategory.name }],
    required: false,
  })
    bussCategoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussSubCategory.name }],
    required: false,
  })
    bussSubCategoriesId: mongoose.Types.ObjectId[]; // migrate to tags

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Tags.name,
      },
    ],
    required: false,
  })
    tagsId: mongoose.Schema.Types.ObjectId[];

  @Prop({ required: false })
    openingHrs: [
    {
      days: string;
      open: Date;
      close: Date;
      isHoliday: {
        type: Boolean;
        default: false;
      };
    }
  ];

  @Prop({ type: Boolean, default: false })
    isAlwaysOpen: boolean;

  @Prop()
    slug: string;

  @Prop({ enum: GeoServicesTypes, default: GeoServicesTypes.BUSINESS })
    serviceType: GeoServicesTypes;

  @Prop({ required: false })
    deliveryArea: DeliveryArea[];

  @Prop({ required: false, type: [String] })
    deliverySpecificSellerInfo: string[];

  @Prop({ required: false, type: [String] })
    deliveryReturnExchange: string[];

  @Prop({ required: false })
    deliveryAdditionalInfo: string;

  @Prop({ type: Boolean, default: false })
    isPickUpAvailable: boolean;

  @Prop({ default: 200, required: false })
    impact: number;

  @Prop({ default: 0 })
    completionPercent: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: BankAccount.name,
    required: false,
  })
    bankAccountId: mongoose.Types.ObjectId; // migrate all to user Id
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
BusinessSchema.index({ name: 'text', description: 'text', tags: 'text' });
BusinessSchema.index({ location: '2dsphere' });
BusinessSchema.index({ isDeleted: 1, status: 1 });
BusinessSchema.index({ userId: 1, isDeleted: 1 });
BusinessSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });

export type BusinessDocument = HydratedDocument<Business>;

BusinessSchema.pre('save', function (next) {
  if (this?.phoneNumber) {
    this.phoneNumber = normalizePhone(this.phoneNumber);
  }

  if (this?.contactDetails?.phone) {
    this.contactDetails.phone = normalizePhone(this.contactDetails.phone);
  }

  if (this?.contactDetails?.whatsAppNumber) {
    this.contactDetails.whatsAppNumber = normalizePhone(
      this.contactDetails.whatsAppNumber,
    );
  }
  next();
});

BusinessSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();
  if (!update) return next();

  const $set = update.$set ?? update;

  if ($set.phoneNumber) {
    $set.phoneNumber = normalizePhone($set.phoneNumber);
  }

  if ($set.contactDetails?.phone) {
    $set.contactDetails.phone = normalizePhone($set.contactDetails.phone);
  }

  if ($set.contactDetails?.whatsAppNumber) {
    $set.contactDetails.whatsAppNumber = normalizePhone(
      $set.contactDetails.whatsAppNumber,
    );
  }

  if (!update.$set) {
    Object.assign(update, $set);
  } else {
    update.$set = $set;
  }

  next();
});
