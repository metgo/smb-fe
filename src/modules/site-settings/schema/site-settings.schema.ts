import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';

@Schema({ _id: false })
export class VideoItem {
  @Prop({ default: '' })
    id: string;

  @Prop({ default: '' })
    url: string;

  @Prop({ default: '' })
    name: string;

  @Prop({ default: false })
    isActive: boolean;
}

export const VideoItemSchema = SchemaFactory.createForClass(VideoItem);

@Schema({ _id: false })
export class PartnerItem {
  @Prop({ default: '' })
    id: string;

  @Prop({ default: '' })
    name: string;

  @Prop({ default: '' })
    description: string;

  @Prop({ default: '' })
    logo: string;

  @Prop({ default: '' })
    website: string;
}

export const PartnerItemSchema = SchemaFactory.createForClass(PartnerItem);

@Schema()
export class SiteSetting extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  /* Step 1 – Identity */
  @Prop({ default: '' })
    websiteName: string;

  @Prop({ default: '' })
    slogan: string;

  @Prop({ default: '' })
    logoUrl: string;

  @Prop({ default: '' })
    faviconUrl: string;

  @Prop({ default: '' })
    splashLogoUrl: string;

  /* Step 2 – Media */
  @Prop({ type: [VideoItemSchema], default: [] })
    desktopVideos: VideoItem[];

  @Prop({ type: [VideoItemSchema], default: [] })
    mobileVideos: VideoItem[];

  /* Step 3 – Theme */
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

  /* Step 4 – Social */
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

  /* Step 5 – Contact */
  @Prop({ default: '' })
    phoneNumber: string;

  @Prop({ default: '' })
    whatsappNumber: string;

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

  /* Step 6 – SEO */
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

  /* Step 7 – Analytics */
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

  /* Step 8 – Localization */
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

  /* Step 9 – Partners */
  @Prop({ type: [PartnerItemSchema], default: [] })
    partners: PartnerItem[];
}

export type SiteSettingDocument = HydratedDocument<SiteSetting>;

export const SiteSettingSchema = SchemaFactory.createForClass(SiteSetting);
