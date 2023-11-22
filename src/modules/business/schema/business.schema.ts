import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { BusinessStatus } from 'src/modules/business/business.type';

@Schema({})
export class Business extends AuditableSchema {
  @Prop({ required: false, default: null })
    name: string;

  @Prop({ required: false, default: null })
    address: string;

  @Prop()
    countryCode: string;

  @Prop({ unique: true, default: null })
    phoneNumber: string;

  @Prop({ unique: true, default: null })
    busiEmail: string;

  @Prop({ required: false, default: null })
    description: string;

  @Prop({ enum: BusinessStatus, default: BusinessStatus.PENDING })
    status: BusinessStatus;

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
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    ref: 'Users',
    required: false,
  })
    collabrationUser: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: false,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DMO',
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

  @Prop()
    images: [
        {
          image: { type: string, default: null}
          caption: { type: string, default: null}
          alt:{ type: string, default: null}
        }
    ];

  @Prop({
    required: false,
    type: mongoose.Types.ObjectId,
    ref: 'SocialMedia',
    default: null,
  })
    socialMedia: [
        {
        socialMediaId: {
            type: mongoose.Types.ObjectId,
            ref: 'SocialMedia'
          }
          url: { type: string}
        }
  ];

  @Prop(
    {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MapPoint' }],
      required: false,
    },
  )
    mapPointId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MPCategories' }],
    required: false,
  })
    mapPointCategoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MPSubCategories' }],
    required: false,
  })
    mapPointSubCategoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MPSubCategoriesItems' }],
    required: false,
  })
    mapPointSubCategoriesItemsId: mongoose.Types.ObjectId[];

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
}
export type BusinessDocument = HydratedDocument<Business>;

export const BusinessSchema = SchemaFactory.createForClass(Business);
BusinessSchema.index({ name: 'text', description: 'text' });
