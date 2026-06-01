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
  @Prop({ default: '' })
    url: string;

  @Prop({ default: '' })
    name: string;

  @Prop({ default: false })
    isActive: boolean;
}

export const MediaItemSchema = SchemaFactory.createForClass(MediaItem);

@Schema()
export class ExternalApi extends AuditableSchema {
  @Prop({ default: null })
    name: string;

  @Prop({ default: null })
    ipAddress: string;

  @Prop({ default: null })
    gaPropertyId: string;

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

  @Prop({ default: '' })
    platformCharge: number;

  @Prop({ default: '' })
    websiteNameEn: string;

  @Prop({ default: '' })
    websiteNameHe: string;

  @Prop({ default: '' })
    websiteNameAr: string;

  @Prop({ default: '' })
    sloganEn: string;

  @Prop({ default: '' })
    sloganHe: string;

  @Prop({ default: '' })
    sloganAr: string;

  @Prop({ default: '' })
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
  @Prop({ default: '' })
    logoUrl: string;

  @Prop({ default: '' })
    faviconUrl: string;

  @Prop({ default: '' })
    specialSymbolUrl: string;

  @Prop({ default: '' })
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

  @Prop({ default: '' })
    fontSourceUrl: string;

  @Prop({ default: 'rounded' })
    buttonStyle: string;

  @Prop({ default: '8' })
    buttonRadius: string;

  @Prop({ default: false })
    darkModeEnabled: boolean;

  /* Step 5 – Social Media */
  @Prop({ default: '' })
    facebookUrl: string;

  @Prop({ default: '' })
    instagramUrl: string;

  @Prop({ default: '' })
    twitterUrl: string;

  @Prop({ default: '' })
    youtubeUrl: string;

  @Prop({ default: '' })
    linkedinUrl: string;

  @Prop({ default: '' })
    tiktokUrl: string;

  @Prop({ default: true })
    showSocialIcons: boolean;

  @Prop({ default: true })
    socialLinksNewTab: boolean;

  /* Step 6 – Contact Details */
  @Prop({ default: '' })
    phoneNumber: string;

  @Prop({ default: '' })
    whatsappNumber: string;

  @Prop({ default: '' })
    whatsappMessageEn: string;

  @Prop({ default: '' })
    whatsappMessageHe: string;

  @Prop({ default: '' })
    whatsappMessageAr: string;

  @Prop({ default: '' })
    email: string;

  @Prop({ default: '' })
    supportEmail: string;

  @Prop({ default: '' })
    physicalAddress: string;

  @Prop({ default: '' })
    googleMapsEmbed: string;

  @Prop({ default: true })
    enableClickToCall: boolean;

  @Prop({ default: false })
    enableWhatsappChat: boolean;

  /* Step 7 – SEO & Meta */
  @Prop({ default: '' })
    metaTitle: string;

  @Prop({ default: '' })
    metaDescription: string;

  @Prop({ default: '' })
    metaKeywords: string;

  @Prop({ default: '' })
    ogTitle: string;

  @Prop({ default: '' })
    ogDescription: string;

  @Prop({ default: '' })
    ogImageUrl: string;

  @Prop({ default: '' })
    twitterCardTitle: string;

  @Prop({ default: '' })
    twitterCardDescription: string;

  @Prop({ default: '' })
    twitterCardImageUrl: string;

  @Prop({ default: '' })
    canonicalUrl: string;

  @Prop({ default: 'User-agent: *\nAllow: /' })
    robotsTxt: string;

  @Prop({ default: '' })
    sitemapUrl: string;

  /* Step 8 – Analytics & Tracking */
  @Prop({ default: '' })
    googleAnalyticsId: string;

  @Prop({ default: '' })
    googleTagManagerId: string;

  @Prop({ default: '' })
    facebookPixelId: string;

  @Prop({ default: '' })
    headerScripts: string;

  @Prop({ default: '' })
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

  @Prop({ default: '' })
    dateFormat: string;
}

export type ExternalApiDocument = HydratedDocument<ExternalApi>;

export const ExternalApiSchema = SchemaFactory.createForClass(ExternalApi);
