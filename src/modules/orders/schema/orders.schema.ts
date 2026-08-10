import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { PaymentStatus } from 'src/common/enum';
import { normalizePhone } from 'src/common/utils/normalise-phone';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { OrderStatus, PaymentMode } from 'src/modules/orders/orders.type';
import { Product } from 'src/modules/products/schema/products.schema';
import { User } from 'src/modules/users/schema/users.schema';

@Schema()
export class Order extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: Product.name },
      },
    ],
    _id: false,
    default: null,
  })
    products: {
    id: mongoose.Types.ObjectId;
  }[];

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    default: null,
  })
    vendorId: mongoose.Types.ObjectId;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  })
    parentOrderId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
    status: OrderStatus;

  @Prop({
    enum: PaymentStatus,
  })
    paymentStatus: PaymentStatus;

  @Prop({ default: null })
    email: string;

  @Prop({ default: null })
    countryCode: string;

  @Prop({ default: null })
    phone: string;

  @Prop({ default: null })
    address: string;

  @Prop({ default: null })
    firstName: string;

  @Prop({ default: null })
    lastName: string;

  @Prop()
    paymentMode: PaymentMode[];

  @Prop()
    voucher: [
    {
      id: string;
      redeemedAmount: number;
    }
  ];

  @Prop({ type: Number, default: 0 })
    totalAmount: number;

  @Prop({ type: Number, default: 0 })
    creditCardPayment: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
    deliveryFee: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Campaign.name,
    required: false,
  })
    campId: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    default: null,
  })
    qrCodeUrl: string;

  @Prop({ default: null })
    paymentDate: Date;

  @Prop({
    type: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      date: { type: Date },
      additional_information: { type: String },
      isAutomatic: { type: Boolean, default: false },
    },
  })
    shipped: {
    by: mongoose.Types.ObjectId;
    date: Date;
    additional_information: string;
    isAutomatic: boolean;
  };

  @Prop({
    type: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      date: { type: Date, required: true },
      additional_information: { type: String },
      isAutomatic: { type: Boolean, default: false },
    },
  })
    completed: {
    by: mongoose.Types.ObjectId;
    date: Date;
    additional_information: String;
    isAutomatic: boolean;
  };

  @Prop({
    type: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      date: { type: Date },
      canceled_reason: { type: String },
      isAutomatic: { type: Boolean, default: false },
    },
  })
    cancelled: {
    by: mongoose.Types.ObjectId;
    date: Date;
    canceled_reason: string;
    isAutomatic: boolean;
  };

  @Prop({
    type: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      initiatedAt: { type: Date },
      completedAt: { type: Date },
      isAutomatic: { type: Boolean, default: false },
    },
  })
    refunded: {
    by: mongoose.Types.ObjectId;
    isAutomatic: boolean;
    initiatedAt: Date;
    completedAt: Date;
  };
}

export type OrderDocument = HydratedDocument<Order>;

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ name: 'text', description: 'text' });
OrderSchema.index({ userId: 1, isDeleted: 1 });
OrderSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
OrderSchema.index({ parentOrderId: 1 }, { sparse: true });

OrderSchema.pre('save', function (next) {
  if (this?.phone) {
    this.phone = normalizePhone(this.phone);
  }
  next();
});

OrderSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();

  if (update?.phone) {
    update.phone = normalizePhone(update.phone);
  }

  next();
});
