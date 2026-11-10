import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { CommonStatus } from 'src/common/enum';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';

@Schema({ _id: false })
export class Image {
  @Prop({ required: true })
    image: string;

  @Prop()
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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({ enum: CommonStatus, required: true, default: CommonStatus.DRAFT })
    status: CommonStatus;

  @Prop()
    title: string;

  @Prop()
    titleHe: string;

  @Prop()
    titleAr: string;

  @Prop()
    subTitle: string;

  @Prop()
    subTitleHe: string;

  @Prop()
    subTitleAr: string;

  @Prop()
    shortDescription: string;

  @Prop()
    shortDescriptionHe: string;

  @Prop()
    shortDescriptionAr: string;

  @Prop()
    content: string;

  @Prop()
    contentHe: string;

  @Prop()
    contentAr: string;

  @Prop()
    summary: string;

  @Prop()
    summaryHe: string;

  @Prop()
    summaryAr: string;

  @Prop()
    slug: string;

  @Prop()
    metaTitle: string;

  @Prop()
    metaTitleHe: string;

  @Prop()
    metaTitleAr: string;

  @Prop()
    metaDescription: string;

  @Prop()
    metaDescriptionHe: string;

  @Prop()
    metaDescriptionAr: string;

  @Prop({ type: [String], default: [] })
    tags: string[];

  @Prop({ type: [String], default: [] })
    tagsHe: string[];

  @Prop({ type: [String], default: [] })
    tagsAr: string[];

  @Prop({ type: [ImageSchema], default: [] })
    images: Image[];
}

export type Blogs = HydratedDocument<Blog>;

export const BlogSchema = SchemaFactory.createForClass(Blog);
