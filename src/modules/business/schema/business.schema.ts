import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// eslint-disable-next-line no-use-before-define
export type BusinessDocument = HydratedDocument<Business>;

@Schema()
export class Business {
  @Prop()
    name: string;

  @Prop()
    address: number;

  @Prop()
    phoneNumber: string;

  @Prop()
    bussEmail: string;

  @Prop()
    description: string;

  @Prop()
    contactDetails: {
        name: string,
        phone: string,
        address: string,
  };

  @Prop()
    collabrationUser: [];

  @Prop()
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

export const BusinessSchema = SchemaFactory.createForClass(Business);
