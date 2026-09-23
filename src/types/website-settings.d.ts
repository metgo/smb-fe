/* ------------------------------------------------------------------ */
/*  Website / Site-Settings – shared TypeScript types                  */
/* ------------------------------------------------------------------ */

interface GeoJsonPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: [number, number][][]; // [ [[lng,lat], ...] ]
}

/*---------------------------------- Dmo Setting ----------------------------------*/

interface IDmoProp {
  name: string;
  description?: string;
  userId: string;
  logoPath?: string;
  isActive: boolean;
  boundary?: GeoJsonPolygon | null;
  center?: GeoJsonPoint | null;
}
type TDmoReqPayload = IDmoProp;
type TDmoEditData = IDmoProp;

interface IDmoRes {
  _id: string;
  name: string;
  isActive: boolean;
  logoPath: string;
  authorityCount: number;
}

/*---------------------------------- Authority Setting ----------------------------------*/

interface IAuthorityProp {
  name: string;
  dmoId: string;
  description?: string;
  userId: string;
  isActive: boolean;
  boundary?: GeoJsonPolygon | null;
  center?: GeoJsonPoint | null;
  logoPath?: string;
}
type IAuthorityReqPayload = IAuthorityProp;

interface IAuthorityRes {
  _id: string;
  name: string;
  isActive: boolean;
  logoPath: string;
}

/*---------------------------------- Authority Setting ----------------------------------*/

interface ICampaignRes {
  _id: string;
  name: string;
  description: string;
  code: string;
  type: string;
  logoPath: string;
  imagePath: string;
  externalApiId: string;
  isActive?: boolean;
}

/*---------------------------------- Partners config ----------------------------------*/
interface IPartnerItem {
  _id: string;
  nameEn: string;
  nameHe: string;
  nameAr: string;

  descriptionEn: string;
  descriptionHe: string;
  descriptionAr: string;

  logo: string;
  siteUrl: string;
  websites: string[];
  isActive: boolean;
}
interface IPartnersRes {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  logo: string;
  siteUrl: string;
  websites: string[];
}

/*---------------------------------- Website config ----------------------------------*/

interface VideoItem {
  _id: string;
  url: string;
  name: string;
  isActive: boolean;
}

interface ThumnailItem {
  _id: string;
  url: string;
  name: string;
  isActive: boolean;
}

interface IWebsiteRes {
  _id: string;
  dmoId: string;
  authorityId: string;
  websiteName: string;
  logoUrl: string;
  websiteUrl: string;
  isActive: boolean;
}

interface IWebsiteListRes {
  _id: string;
  websiteName: string;
  slogan: string;
  logo: string;
  url: string;
  score: number;
  identifierId: string;
  purpose: "MARKETPLACE" | "TRAVELING" | "DISCOUNT" | "OTHER";
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
}

interface ISiteSettingsFormData {
  /* Step 1 - General Config */
  websiteNameEn: string;
  websiteNameHe: string;
  websiteNameAr: string;
  sloganEn: string;
  sloganHe: string;
  sloganAr: string;
  websiteUrl: string;
  identifierId: string;
  purpose: "MARKETPLACE" | "TRAVELING" | "OTHER";
  isActive: boolean;
  isPunchpassEligible: boolean;
  // Content Manager toggle: participate in the AI auto-connect (auto Active-View
  // assignment of approved businesses/products). Undefined is treated as true.
  autoAssignEnabled?: boolean;
  platformCharge: number;

  /* Step 2 – Branding & Media */
  logoUrl: string;
  faviconUrl: string;
  specialSymbolUrl: string;
  bgImageUrl: string;

  /* Step 3 – Home Page Videos */
  desktopVideos: VideoItem[];
  mobileVideos: VideoItem[];
  desktopVideoThumbnails: ThumnailItem[];
  mobileVideoThumbnails: ThumnailItem[];

  /* Step 4 – Theme & Appearance */
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  fontSourceUrl: string;
  buttonStyle: "rounded" | "square" | "custom";
  buttonRadius: string;
  darkModeEnabled: boolean;

  /* Step 5 – Social Media */
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
  showSocialIcons: boolean;
  socialLinksNewTab: boolean;

  /* Step 6 – Contact Details */
  phoneNumber: string;
  whatsappNumber: string;
  whatsappMessageEn: string;
  whatsappMessageHe: string;
  whatsappMessageAr: string;
  email: string;
  supportEmail: string;
  physicalAddress: string;
  googleMapsEmbed: string;
  enableClickToCall: boolean;
  enableWhatsappChat: boolean;

  /* Step 7 – SEO & Meta */
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterCardTitle: string;
  twitterCardDescription: string;
  twitterCardImageUrl: string;
  canonicalUrl: string;
  robotsTxt: string;
  sitemapUrl: string;

  /* Step 8 – Analytics & Tracking */
  googleAnalyticsId: string;
  googleAdsConvTrackId: string;
  enableWidgetId: string;
  hotjarId: string;
  facebookPixelId: string;
  headerScripts: string;
  footerScripts: string;

  /* Step 9 – Localization */
  defaultLanguage: string;
  multiLanguageEnabled: boolean;
  timezone: string;
  currency: string;
  dateFormat: string;

  /* Step 10 – Campaigns */
  primaryCampIds: string[];
  campIds: string[];
}

type SiteSettingsErrors = Partial<Record<keyof SiteSettingsFormData, string>>;

interface IWebsiteConfigRes {
  _id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  deletedAt: string | null;
  isDeleted: boolean;
  externalApiId: string;

  isActive: boolean;
  isPunchpassEligible: boolean;
  // Content Manager toggle for the AI auto-connect. Undefined ⇒ treated as true.
  autoAssignEnabled?: boolean;
  websiteNameEn: string;
  websiteNameHe: string;
  websiteNameAr: string;
  sloganEn: string;
  sloganHe: string;
  sloganAr: string;
  websiteUrl: string;
  purpose: "MARKETPLACE" | "TRAVELING" | "OTHER";
  identifierId: string;
  platformCharge: number;

  logoUrl: string;
  faviconUrl: string;
  specialSymbolUrl: string;
  bgImageUrl: string;

  desktopVideos: VideoItem[];
  mobileVideos: VideoItem[];
  desktopVideoThumbnails: ThumnailItem[];
  mobileVideoThumbnails: ThumnailItem[];

  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;

  fontFamily: string;
  fontSourceUrl: string;

  buttonStyle: "rounded" | "square" | "custom";
  buttonRadius: string;

  darkModeEnabled: boolean;

  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;

  showSocialIcons: boolean;
  socialLinksNewTab: boolean;

  phoneNumber: string;
  whatsappNumber: string;
  whatsappMessageEn: string;
  whatsappMessageHe: string;
  whatsappMessageAr: string;

  email: string;
  supportEmail: string;

  physicalAddress: string;
  googleMapsEmbed: string;

  enableClickToCall: boolean;
  enableWhatsappChat: boolean;

  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;

  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;

  twitterCardTitle: string;
  twitterCardDescription: string;
  twitterCardImageUrl: string;

  canonicalUrl: string;
  robotsTxt: string;
  sitemapUrl: string;

  googleAnalyticsId: string;
  googleAdsConvTrackId: string;
  enableWidgetId: string;
  hotjarId: string;
  facebookPixelId: string;

  headerScripts: string;
  footerScripts: string;

  defaultLanguage: string;
  multiLanguageEnabled: boolean;
  timezone: string;
  currency: string;
  dateFormat: string;

  primaryCampIds: string[];
  campIds: string[];

  partners: PartnerItem[];

  __v: number;
}
