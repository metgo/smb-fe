import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BusinessStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class Business extends AuditableSchema {
  @Prop({ required: false })
    name: string;

  @Prop({ required: false })
    address: string;

  @Prop({ unique: false })
    phoneNumber: string;

  @Prop({ unique: false })
    busiEmail: string;

  @Prop({ required: false })
    description: string;

  @Prop({ enum: BusinessStatus, default: BusinessStatus.PENDING })
    status: BusinessStatus;

  @Prop({ default: true })
    isPreview: boolean;

  @Prop({
    type: {
      name: String,
      phone: String,
      address: String,
    },
  })
    contactDetails: {
        name: string,
        phone: string,
        address: string,
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
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop({
    type: {
      lat: String,
      long: String,
    },
  })
    geoLocation: {
      lat: string,
      long: string
    };

  @Prop()
    images: [
        {
          image: string
          caption: string
          alt:string
        }
    ];

  @Prop({
    required: false,
    type: mongoose.Types.ObjectId,
    ref: 'SocialMedia',
  })
    socialMedia: [
        {
        socialMediaId: {
            type: mongoose.Types.ObjectId,
            ref: 'SocialMedia'
          }
          url: string
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
