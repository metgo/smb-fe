import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { CommonStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { SettingType } from '../settings.type';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';

@Schema()
export class Setting extends AuditableSchema {
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
    description: string;

  @Prop()
    descriptionHe: string;

  @Prop()
    descriptionAr: string;

  @Prop()
    slug: string;

  @Prop()
    docUrl: string;

  @Prop()
    docType: string;

  @Prop()
    docSize: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({ enum: SettingType, default: SettingType.PRIVACY })
    type: SettingType;

  @Prop({ enum: CommonStatus, default: CommonStatus.PENDING })
    status: CommonStatus;
}

export type Settings = HydratedDocument<Setting>;

export const SettingSchema = SchemaFactory.createForClass(Setting);
