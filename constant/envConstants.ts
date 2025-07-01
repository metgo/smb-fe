const CODE = process.env.NEXT_PUBLIC_CAMP_CODE;
const IdentifierId = process.env.NEXT_PUBLIC_IDENTIFIER_ID;
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const BUCKET = process.env.NEXT_PUBLIC_BUCKET_URL;
const THEME = process.env.NEXT_PUBLIC_THEME;
const EMAIL_HOST = process.env.EMAIL_HOST;
const FROM_NAME = process.env.FROM_NAME;
const FROM_EMAIL = process.env.FROM_EMAIL;
const PASSWORD = process.env.PASSWORD;
const GOOGLE_TAG_MANAGER_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER;
const GOOGLE_ANALYTIC_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTIC;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

const CONSOLE_URL =
  process.env.NEXT_PUBLIC_ENV === "prod"
    ? "https://console.metgo.app"
    : "https://stg.console.metgo.app";

export {
  CODE,
  IdentifierId,
  GOOGLE_API_KEY,
  BASE_URL,
  EMAIL_HOST,
  FROM_EMAIL,
  FROM_NAME,
  PASSWORD,
  BUCKET,
  THEME,
  GOOGLE_ANALYTIC_ID,
  GOOGLE_TAG_MANAGER_ID,
  SITE_URL,
  CONSOLE_URL,
};
