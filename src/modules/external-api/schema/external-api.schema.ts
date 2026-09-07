import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Theme } from 'src/modules/themes/schema/theme.schema';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { ExternalApiPurpose } from '../external-api.types';

@Schema({ _id: false })
export class PromotionalItem {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BussCategory' }],
    required: false,
  })
  categoryIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BussSubCategory' }],
    required: false,
  })
  subCategoryIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GroupType' }],
    required: false,
  })
  groupTypesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accessibility' }],
    required: false,
  })
  accesibilitiesId: mongoose.Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isAll: boolean;
}

@Schema()
export class MediaItem {
  @Prop()
  url: string;

  @Prop()
  name: string;

  @Prop({ default: false })
  isActive: boolean;
}

export const MediaItemSchema = SchemaFactory.createForClass(MediaItem);

@Schema()
export class ExternalApi extends AuditableSchema {
  @Prop({ default: null })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Theme.name,
    required: false,
  })
  themeId: mongoose.Types.ObjectId;

  @Prop({ type: PromotionalItem, required: false })
  promotionalBusinesses: PromotionalItem;

  @Prop({ type: PromotionalItem, required: false })
  promotionalEvents: PromotionalItem;

  @Prop({ type: PromotionalItem, required: false })
  promotionalTrips: PromotionalItem;

  @Prop({ default: 0 })
  score: number;

  /* Step 1 – General Config */
  @Prop({ unique: true, type: String, required: true })
  identifierId: string;

  @Prop()
  platformCharge: number;

  @Prop()
  websiteNameEn: string;

  @Prop()
  websiteNameHe: string;

  @Prop()
  websiteNameAr: string;

  @Prop()
  sloganEn: string;

  @Prop()
  sloganHe: string;

  @Prop()
  sloganAr: string;

  @Prop()
  websiteUrl: string;

  @Prop({ default: ExternalApiPurpose.MARKETPLACE })
  purpose: ExternalApiPurpose;

  @Prop({ default: true })
  isActive: boolean;

  /* Step 2 - Campaign Selection */
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
    required: false,
  })
  campIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
    required: false,
  })
  primaryCampIds: mongoose.Types.ObjectId[];

  /* Step 2 – Branding & Media */
  @Prop()
  logoUrl: string;

  @Prop()
  faviconUrl: string;

  @Prop()
  specialSymbolUrl: string;

  @Prop()
  bgImageUrl: string;

  /* Step 3 – Home Page Videos */
  @Prop({ type: [MediaItemSchema], default: [] })
  desktopVideos: MediaItem[];

  @Prop({ type: [MediaItemSchema], default: [] })
  mobileVideos: MediaItem[];

  @Prop({ type: [MediaItemSchema], default: [] })
  desktopVideoThumbnails: MediaItem[];

  @Prop({ type: [MediaItemSchema], default: [] })
  mobileVideoThumbnails: MediaItem[];

  /* Step 4 – Theme & Appearance */
  @Prop({ default: '#0d9488' })
  primaryColor: string;

  @Prop({ default: '#6366f1' })
  secondaryColor: string;

  @Prop({ default: '#ffffff' })
  backgroundColor: string;

  @Prop({ default: 'Inter' })
  fontFamily: string;

  @Prop()
  fontSourceUrl: string;

  @Prop({ default: 'rounded' })
  buttonStyle: string;

  @Prop({ default: '8' })
  buttonRadius: string;

  @Prop({ default: false })
  darkModeEnabled: boolean;

  /* Step 5 – Social Media */
  @Prop()
  facebookUrl: string;

  @Prop()
  instagramUrl: string;

  @Prop()
  twitterUrl: string;

  @Prop()
  youtubeUrl: string;

  @Prop()
  linkedinUrl: string;

  @Prop()
  tiktokUrl: string;

  @Prop({ default: true })
  showSocialIcons: boolean;

  @Prop({ default: true })
  socialLinksNewTab: boolean;

  /* Step 6 – Contact Details */
  @Prop()
  phoneNumber: string;

  @Prop()
  whatsappNumber: string;

  @Prop()
  whatsappMessageEn: string;

  @Prop()
  whatsappMessageHe: string;

  @Prop()
  whatsappMessageAr: string;

  @Prop()
  email: string;

  @Prop()
  supportEmail: string;

  @Prop()
  physicalAddress: string;

  @Prop()
  googleMapsEmbed: string;

  @Prop({ default: true })
  enableClickToCall: boolean;

  @Prop({ default: false })
  enableWhatsappChat: boolean;

  /* Step 7 – SEO & Meta */
  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;

  @Prop()
  metaKeywords: string;

  @Prop()
  ogTitle: string;

  @Prop()
  ogDescription: string;

  @Prop()
  ogImageUrl: string;

  @Prop()
  twitterCardTitle: string;

  @Prop()
  twitterCardDescription: string;

  @Prop()
  twitterCardImageUrl: string;

  @Prop()
  canonicalUrl: string;

  @Prop({ default: 'User-agent: *\nAllow: /' })
  robotsTxt: string;

  @Prop()
  sitemapUrl: string;

  /* Step 8 – Analytics & Tracking */
  @Prop()
  googleAnalyticsId: string;

  @Prop()
  googleAdsConvTrackId: string;

  @Prop()
  enableWidgetId: string;

  @Prop()
  hotjarId: string;

  @Prop()
  facebookPixelId: string;

  @Prop()
  headerScripts: string;

  @Prop()
  footerScripts: string;

  /* Step 9 – Localization */
  @Prop({ default: 'English' })
  defaultLanguage: string;

  @Prop({ default: false })
  multiLanguageEnabled: boolean;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop()
  dateFormat: string;
}

export type ExternalApiDocument = HydratedDocument<ExternalApi>;

export const ExternalApiSchema = SchemaFactory.createForClass(ExternalApi);
