import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  RecurringEventCustomUnit,
  RecurringEventEndUnit,
  RecurringEventMonthlyType,
  RecurringEventPattern,
} from '../events.type';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class RecurringEventRule extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Event.name,
    required: true,
  })
    eventId: mongoose.Types.ObjectId;

  @Prop({ enum: RecurringEventPattern, default: RecurringEventPattern.DAILY })
    pattern: RecurringEventPattern;

  @Prop({ type: [String], default: [] })
    daysOfWeek?: string[]; // ['Mon', 'Tue', ...] for Weekly

  @Prop({
    enum: RecurringEventMonthlyType,
    default: RecurringEventMonthlyType.SPECIFIC_DATE,
  })
    monthlyType: RecurringEventMonthlyType;

  @Prop({ type: Number })
    specificDate?: number;

  @Prop({ type: Number })
    relativeDate?: number; // e.g., 15 or 2

  @Prop({ type: String })
    relativeDay?: string; // e.g., 'Tuesday'

  @Prop({ type: Number, default: 1 })
    customInterval: number; // For "every X days/weeks/months"

  @Prop({
    enum: RecurringEventCustomUnit,
    default: RecurringEventCustomUnit.DAY,
  })
    customUnit: RecurringEventCustomUnit;

  @Prop({
    enum: RecurringEventEndUnit,
    default: RecurringEventEndUnit.END_DATE,
  })
    endType: RecurringEventEndUnit;

  @Prop({ type: Number })
    occurrenceLimit?: number; // For "After X occurrences"

  @Prop({ type: Date })
    endDate?: Date;
}

export const RecurringEventRuleSchema
  = SchemaFactory.createForClass(RecurringEventRule);
export type RecurringEventRuleDocument = HydratedDocument<RecurringEventRule>;
