import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BusinessStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class Business extends AuditableSchema {
  @Prop({ required: true })
    name: string;

  @Prop({ required: true })
    address: string;

  @Prop({ unique: true })
    phoneNumber: string;

  @Prop({ unique: true })
    busiEmail: string;

  @Prop({ required: true })
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
    required: true,
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
    required: true,
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

  @Prop()
    socialMedia: [
        {
          name: string
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

  @Prop()
    openingHrs: [
        {
          days: string
          open: Date
          close: Date
          isHoliday: {
            type: Boolean,
            default: false // Default value for isHoliday
          }
        }
    ];
}
export type BusinessDocument = HydratedDocument<Business>;

export const BusinessSchema = SchemaFactory.createForClass(Business);
BusinessSchema.index({ name: 'text', description: 'text' });
