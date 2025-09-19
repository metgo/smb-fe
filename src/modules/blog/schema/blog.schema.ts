import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { BlogStatus } from '../blog.type';

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
export class Image {
  @Prop({ required: true })
    image: string;

  @Prop({ required: true })
    caption: string;

  @Prop({ required: true })
    alt: string;

  @Prop({ default: false })
    isPrimary: boolean;

  @Prop({ type: SubCoordinatesSchema, required: false })
    subCoordinates?: SubCoordinates;
}
const ImageSchema = SchemaFactory.createForClass(Image);

@Schema()
export class Blog extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ enum: BlogStatus, required: true, default: BlogStatus.DRAFT })
    status: BlogStatus;

  @Prop({ required: true })
    title: string;

  @Prop()
    subTitle: string;

  @Prop({ required: true })
    content: string;

  @Prop({ type: [ImageSchema], default: [] })
    images: Image[];
}

export type Blogs = HydratedDocument<Blog>;

export const BlogSchema = SchemaFactory.createForClass(Blog);
