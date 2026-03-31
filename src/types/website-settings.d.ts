/* ------------------------------------------------------------------ */
/*  Website / Site-Settings – shared TypeScript types                  */
/* ------------------------------------------------------------------ */

interface VideoItem {
  id: string;
  url: string;
  name: string;
  isActive: boolean;
}

interface SiteSettingsFormData {
  /* Step 1 – Branding & Media */
  logoUrl: string;
  faviconUrl: string;
  splashLogoUrl: string;

  /* Step 2 – Home Page Videos */
  desktopVideos: VideoItem[];
  mobileVideos: VideoItem[];

  /* Step 3 – Theme & Appearance */
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
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
