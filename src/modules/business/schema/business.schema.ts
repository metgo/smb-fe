import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema()
export class Business {
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

  @Prop()
    collabrationUser: [];

  @Prop({
    type: {
      lat: String,
      long: String,
    },
  })
    geoLoaction: {
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MapPoint',
      required: false,
    },
  )
    mapPointId: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MapPointCategoires',
    required: false,
  })
    mapPointCategoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MapPointSubCategoires',
    required: false,
  })
    mapPointSubCategoriesId: mongoose.Types.ObjectId[];

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
