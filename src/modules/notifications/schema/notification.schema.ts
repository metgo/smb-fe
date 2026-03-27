import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { NotificationType, ItemType, ItemStatus } from 'src/common/enum';

export class ContentBody {
  title: string;
  msessage: string;
}

export class Content {
  en: ContentBody;
  he: ContentBody;
  ar: ContentBody;
}

export class CreatorInfo {
  _id: string;
  name: string;
}
export class Recepient {
  _id: string;
  email: string;
  role: string;
}

@Schema()
export class Notifications {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop()
    content: Content;

  @Prop({ enum: ItemStatus, default: ItemStatus.PENDING })
    status: ItemStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
    itemId: mongoose.Types.ObjectId;

  @Prop({ enum: NotificationType, default: NotificationType.INFO })
    notifType: NotificationType;

  @Prop({ enum: ItemType })
    itemType: ItemType;

  @Prop({ default: false })
    isRead: boolean;

  @Prop({ default: false })
    isUrgent: boolean;

  @Prop()
    recepients: Recepient[];

  @Prop()
    creatorInfo: CreatorInfo;

  @Prop()
    createdAt?: Date;

  @Prop()
    updatedAt?: Date;
}

export const NotificationsSchema = SchemaFactory.createForClass(Notifications);

export type NotificationDocument = HydratedDocument<Notifications>;
