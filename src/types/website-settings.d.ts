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
/*---------------------------------- Website config ----------------------------------*/

interface VideoItem {
  id: string;
  url: string;
  name: string;
  isActive: boolean;
}

interface PartnerItem {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
}

interface ThumnailItem {
  id: string;
  url: string;
  name: string;
  isActive: boolean;
}

interface SiteSettingsFormData {

  /* Step 1 - General Config */
  dmoId: string;
  authorityId: string;
  websiteName: string;
  websiteUrl: string;
  slogan: string;
  identifierId: string;
  campCode: string;
  purpose: "MARKETPLACE" | "TRAVELING" | "OTHER";

  /* Step 2 – Branding & Media */
  logoUrl: string;
  faviconUrl: string;
  specialSymbolUrl: string;
  bgImageUrl: string;

  /* Step 2 – Home Page Videos */
  desktopVideos: VideoItem[];
  mobileVideos: VideoItem[];
  desktopVideoThumbnails: ThumnailItem[];
  mobileVideoThumbnails: ThumnailItem[];

  /* Step 3 – Theme & Appearance */
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  fontSourceUrl: string;
  buttonStyle: "rounded" | "square" | "custom";
  buttonRadius: string;
  darkModeEnabled: boolean;

  /* Step 4 – Social Media */
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
  showSocialIcons: boolean;
  socialLinksNewTab: boolean;

  /* Step 4 – Contact Details */
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  supportEmail: string;
  physicalAddress: string;
  googleMapsEmbed: string;
  enableClickToCall: boolean;
  enableWhatsappChat: boolean;

  /* Step 5 – SEO & Meta */
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

  /* Step 6 – Analytics & Tracking */
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  headerScripts: string;
  footerScripts: string;

  /* Step 7 – Localization */
  defaultLanguage: string;
  multiLanguageEnabled: boolean;
  timezone: string;
  currency: string;
  dateFormat: string;
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

  dmoId: string;
  authorityId: string;
  websiteName: string;
  websiteUrl: string;
  slogan: string;
  purpose: "MARKETPLACE" | "TRAVELING" | "OTHER";
  identifierId: string;
  campCode: string;

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
  googleTagManagerId: string;
  facebookPixelId: string;

  headerScripts: string;
  footerScripts: string;

  defaultLanguage: string;
  multiLanguageEnabled: boolean;
  timezone: string;
  currency: string;
  dateFormat: string;

  partners: PartnerItem[];

  __v: number;
}
