/* ------------------------------------------------------------------ */
/*  Website / Site-Settings – shared TypeScript types                  */
/* ------------------------------------------------------------------ */

/*---------------------------------- Dmo Setting ----------------------------------*/
interface IDMOPayload {
  name: string;
  description: string;
  userId: string;
  isActive: boolean;
  boundary: GeoJsonPolygon | null;
  center: GeoJsonPoint | null;
  logoPath: string;
}

/*---------------------------------- Authority Setting ----------------------------------*/

interface IAuthorityPayload {
  name: string;
  dmoId: string;
  description: string;
  userId: string;
  isActive: boolean;
  boundary: GeoJsonPolygon | null;
  center: GeoJsonPoint | null;
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
  /* Step 1 – Branding & Media */
  websiteName: string;
  websiteUrl: string;
  slogan: string;
  identifierId: string;
  campCode: string;
  purpose: "MARKETPLACE" | "TRAVELING" | "OTHER";
  logoUrl: string;
  faviconUrl: string;

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

  websiteName: string;
  websiteUrl: string;
  slogan: string;
  purpose: "MARKETPLACE" | "TRAVELING" | "OTHER";
  identifierId: string;
  campCode: string;

  logoUrl: string;
  faviconUrl: string;
  splashLogoUrl: string;

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
