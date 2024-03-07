import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Currency } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Accessibility } from 'src/modules/accessibility/schema/accessibility.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { BusinessStatus, GeoServicesTypes } from 'src/modules/business/business.type';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
import { GroupType } from 'src/modules/group-type/schema/group-type.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { SocialMedia } from 'src/modules/socialMedia/schema/socialMedia.schema';
import { User } from 'src/modules/users/schema/users.schema';

@Schema()
export class Business extends AuditableSchema {
  @Prop({ required: false, default: null })
    name: string;

  @Prop({
    type: {
      country: String,
      city: String,
      location: String,
      additional_information: String,
    },
    default: null,
  })
    address: {
      country:{ type: string, default: null},
      city: { type: string, default: null},
      location: { type: string, default: null},
      additional_information: { type: string, default: null},
    };

  @Prop()
    countryCode: string;

  @Prop({ default: null })
    phoneNumber: string;

  @Prop({ default: null })
    busiEmail: string;

  @Prop({ required: false, default: null })
    description: string;

  @Prop({ required: false })
    shortDescription: string;

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
    },
    default: null,
  })
    contactDetails: {
      name: { type: string, default: null},
      countryCode: { type: string, default: null},
      phone: { type: string, default: null},
      address: { type: string, default: null},
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
  })
    geoLocation: {
      lat: { type: string, default: null},
      long: { type: string, default: null},
    };

  @Prop({
    type: {
      type: String,
    },
    coordinates: {
      type: [Number],
      default: null,
    },

  })
    location: {
      type: {
        type: String,
      },
      coordinates: {
        type: number[];
      },
    };

  @Prop()
    images: [{
      image: { type: string, default: null}
      caption: { type: string, default: null}
      alt:{ type: string, default: null}
    }];

  @Prop({
    required: false,
    type: [{
      socialMediaId: {
        type: mongoose.Types.ObjectId,
        ref: SocialMedia.name,
      },
      url: String,
    }],
    default: null,
  })
    socialMedia: [{
      socialMediaId: {
        type: mongoose.Types.ObjectId,
      }
      url: { type: string}
    }];

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
    bussCategoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussSubCategory.name }],
    required: false,
  })
    bussSubCategoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [String],
    validate: {
      validator(value: string[]) {
        return value.length <= 5;
      },
      message: 'Tags should not be more than 5',
    },
  })
    tags: string[];

  @Prop({ required: false })
    openingHrs: [
      {
        days: string
        open: Date
        close: Date
        isHoliday: {
          type: Boolean,
          default: false
        }
      }
    ];

  @Prop({ type: Boolean, default: false })
    isAlwaysOpen: boolean;

  @Prop({ type: Boolean, default: false })
    isOpenOnWeekends: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Product.name }],
    required: false,
  })
    productsId: mongoose.Types.ObjectId[];

  @Prop()
    slug: string;

  @Prop({ enum: GeoServicesTypes, required: false })
    serviceType: GeoServicesTypes;

  @Prop({ required: false, enum: Currency, default: Currency.ILS })
    currency: Currency;

  @Prop({ required: false, default: null })
    price: string;

  @Prop({ required: false, default: null })
    registrationLink: string;

  @Prop({ required: false, default: null })
    meetingLink: string;

  @Prop({ required: false, default: null })
    startDate: Date;

  @Prop({ required: false, default: null })
    endDate: Date;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
BusinessSchema.index({ name: 'text', description: 'text', tags: 'text' });
BusinessSchema.index({ location: '2dsphere' });

export type BusinessDocument = HydratedDocument<Business>;
