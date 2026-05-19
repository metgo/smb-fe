import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { CampaignStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { Rewards } from 'src/modules/rewards/schema/rewards.schema';
import { Theme } from 'src/modules/themes/schema/theme.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { CampaignType } from '../campaign.type';
import { PointOfInterest } from 'src/modules/point-of-interests/schema/point-of-interest.schema';

@Schema({ _id: false })
class Category {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: BussCategory.name,
  })
    id: mongoose.Types.ObjectId;

  @Prop({ required: false })
    name: string;

  @Prop({ required: false })
    icon: string;

  @Prop({ required: false })
    color: string;

  @Prop({ required: false })
    description: string;

  @Prop({ required: true })
    order: number;
}
const CategorySchema = SchemaFactory.createForClass(Category);

@Schema({})
export class Campaign extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop()
    name: string;

  @Prop()
    description: string;

  @Prop()
    slogan: string;

  @Prop({ default: CampaignStatus.DRAFT })
    status: CampaignStatus;

  @Prop({ default: CampaignType.CASH_BACK })
    type: CampaignType;

  @Prop()
    code: string;

  @Prop()
    logoPath: string;

  @Prop()
    imagePath: string;

  @Prop()
    link: string;

  @Prop({ required: false })
    startDate: Date;

  @Prop({ required: false })
    endDate: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Authority.name }],
    ref: Authority.name,
    required: false,
  })
    authorityIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: DMO.name }],
    ref: DMO.name,
    required: false,
  })
    dmoIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Business.name }],
    ref: Business.name,
    required: false,
  })
    businessIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: PointOfInterest.name }],
    ref: PointOfInterest.name,
    required: false,
  })
    poiIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Product.name }],
    ref: Product.name,
    required: false,
  })
    productIds: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Rewards.name,
    required: false,
  })
    rewardId: mongoose.Types.ObjectId;

  @Prop({ type: [CategorySchema], default: [] })
    category: Category[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Theme.name,
    required: false,
  })
    themeId: mongoose.Types.ObjectId;

  @Prop({
    type: {
      name: String,
      contactPerson: String,
      countryCode: String,
      phoneNumber: String,
      email: String,
    },
    default: null,
    _id: false,
  })
    companyInfo: {
    name: string;
    contactPerson: string;
    countryCode: string;
    phoneNumber: string;
    email: string;
  };

  @Prop({
    type: {
      title: String,
      subTitle: String,
      greeting: String,
      deliveryAddress: String,
      isDeliveredToHome: Boolean,
      amount: Number,
    },
    default: null,
    _id: false,
  })
    miniSite: {
    title: string;
    subTitle: string;
    greeting: string;
    deliveryAddress?: string;
    isDeliveredToHome?: boolean;
    amount: number;
  };

  @Prop({
    type: {
      business: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
      poi: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
      product: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      event: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
      trip: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
      funday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
    },
    default: {
      business: [],
      poi: [],
      product: [],
      event: [],
      trip: [],
      funday: [],
    },
  })
    blacklist: {
    business: mongoose.Types.ObjectId[];
    poi: mongoose.Types.ObjectId[];
    product: mongoose.Types.ObjectId[];
    event: mongoose.Types.ObjectId[];
    trip: mongoose.Types.ObjectId[];
    funday: mongoose.Types.ObjectId[];
  };

  @Prop({
    type: {
      business: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
      poi: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
      product: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      event: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
      trip: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
      funday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
    },
    default: {
      business: [],
      poi: [],
      product: [],
      event: [],
      trip: [],
      funday: [],
    },
  })
    whitelist: {
    business: mongoose.Types.ObjectId[];
    poi: mongoose.Types.ObjectId[];
    product: mongoose.Types.ObjectId[];
    event: mongoose.Types.ObjectId[];
    trip: mongoose.Types.ObjectId[];
    funday: mongoose.Types.ObjectId[];
  };
}
export type CampaignDocument = HydratedDocument<Campaign>;
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
