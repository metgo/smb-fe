import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema({ _id: false })
export class Video {
  @Prop({ required: true })
    url: string;

  @Prop({ default: true })
    isActive: boolean;
}
const VideoSchema = SchemaFactory.createForClass(Video);

@Schema()
export class Theme extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop()
    primaryColor: string;

  @Prop()
    secondaryColor: string;

  @Prop()
    homeHeader: string;

  @Prop()
    homeDescription: string;

  @Prop()
    faceBookUrl: string;

  @Prop()
    instagramUrl: string;

  @Prop()
    twitterUrl: string;

  @Prop()
    threadsUrl: string;

  @Prop()
    websiteUrl: string;

  @Prop()
    youtubeUrl: string;

  @Prop()
    whatsappNo: string;

  @Prop()
    metaTitle: string;

  @Prop()
    metaDescription: string;

  @Prop()
    metaKeywords: string;

  @Prop()
    logo: string;

  @Prop()
    ogName: string;

  @Prop({ type: [VideoSchema], default: [] })
    homeVideos: Video[];

  @Prop({ type: [VideoSchema], default: [] })
    mobileHomeVideos: Video[];
}

export type Themes = HydratedDocument<Theme>;

export const ThemeSchema = SchemaFactory.createForClass(Theme);
