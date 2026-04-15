import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { CommonStatus } from 'src/common/enum';

@Schema({ _id: false })
export class Image {
  @Prop({ required: true })
    image: string;

  @Prop({ required: true })
    alt: string;

  @Prop({ default: false })
    isPrimary: boolean;
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

  @Prop({ enum: CommonStatus, required: true, default: CommonStatus.DRAFT })
    status: CommonStatus;

  @Prop({ required: true })
    title: string;

  @Prop()
    subTitle: string;

  @Prop({ required: true })
    shortDescription: string;

  @Prop({ required: true })
    content: string;

  @Prop()
    summary: string;

  @Prop()
    slug: string;

  @Prop()
    metaTitle: string;

  @Prop()
    metaDescription: string;

  @Prop({ type: [String], default: [] })
    tags: string[];

  @Prop({ type: [ImageSchema], default: [] })
    images: Image[];
}

export type Blogs = HydratedDocument<Blog>;

export const BlogSchema = SchemaFactory.createForClass(Blog);
