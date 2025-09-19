import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema({ _id: false })
export class SubCoordinates {
  @Prop({ required: true })
    xMax: number;

  @Prop({ required: true })
    xMin: number;

  @Prop({ required: true })
    yMax: number;

  @Prop({ required: true })
    yMin: number;
}

export const SubCoordinatesSchema
  = SchemaFactory.createForClass(SubCoordinates);

@Schema({ _id: false })
export class ImageUrl {
  @Prop({ required: true })
    url: string;

  @Prop({ type: SubCoordinatesSchema, required: false })
    subCoordinates?: SubCoordinates;

  @Prop({ required: true })
    link: string;

  @Prop({ required: false })
    title: string;

  @Prop({ required: false })
    description: string;

  @Prop({ default: true })
    isActive: boolean;
}
const ImageUrlSchema = SchemaFactory.createForClass(ImageUrl);

@Schema({ _id: false })
export class Image {
  @Prop({ type: [ImageUrlSchema], required: true, _id: false })
    items: ImageUrl[];

  @Prop({ required: true })
    timeInterval: string;

  @Prop({ required: true })
    playType: string;
}

const ImageSchema = SchemaFactory.createForClass(Image);

@Schema()
export class Marketing extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ type: ImageSchema, default: {} })
    images: Image;
}

export type Marketings = HydratedDocument<Marketing>;

export const MarketingSchema = SchemaFactory.createForClass(Marketing);
