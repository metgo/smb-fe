import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Icons } from 'src/modules/icons/schema/icon.schema';

@Schema()
export class GroupType extends AuditableSchema {
  @Prop({ unique: true, required: true })
    name: string;

  @Prop({ default: null })
    description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Icons.name })
    icon: mongoose.Types.ObjectId;

  @Prop({ default: null })
    hebrewName: string;
}

export type GroupTypeDocument = HydratedDocument<GroupType>

export const GroupTypeSchema = SchemaFactory.createForClass(GroupType);
