import type { IUtmCampaignPayload } from "@/store/api/utmCampaignApi";
import { EMPTY_FORM, UTM_PARAM_FIELDS } from "../constants";
import type { IInfluencerContact, IUtmForm } from "../types";

const withScheme = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

export const getHost = (value: string): string => {
  try {
    return new URL(withScheme(value)).host.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

// Client-side preview of the URL the backend will build on save.
export const buildUtmUrl = (form: IUtmForm): string => {
  const trimmedBase = form.baseUrl.trim();
  if (!trimmedBase) return "";

  let url: URL;
  try {
    url = new URL(withScheme(trimmedBase));
  } catch {
    return "";
  }

  Object.entries(UTM_PARAM_FIELDS).forEach(([param, field]) => {
    const value = form[field].trim();
    if (value) url.searchParams.set(param, value);
    else url.searchParams.delete(param);
  });

  return url.toString();
};

// Reverse of buildUtmUrl: splits a full UTM link into the destination URL (with
// any non-UTM query params kept) and the form fields. Returns null when the text
// is not a URL or carries no UTM params.
export const parseUtmUrl = (value: string): IUtmForm | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(withScheme(trimmed));
  } catch {
    return null;
  }

  const form: IUtmForm = { ...EMPTY_FORM };
  let hasUtm = false;
  Object.entries(UTM_PARAM_FIELDS).forEach(([param, field]) => {
    const paramValue = url.searchParams.get(param);
    if (paramValue !== null) {
      form[field] = paramValue;
      hasUtm = true;
    }
    url.searchParams.delete(param);
  });
  if (!hasUtm) return null;

  form.baseUrl = url.toString();
  return form;
};

// Human-readable version of a URL: percent-encoded non-ASCII bytes (e.g. Hebrew
// slugs like %D7%98%D7%A2...) are shown as real characters. Used for display
// only — the copied / stored value keeps the valid encoded form.
export const toReadableUrl = (rawUrl: string): string => {
  if (!rawUrl) return "";
  try {
    return decodeURI(rawUrl);
  } catch {
    return rawUrl;
  }
};

// Turn whatever the user typed/pasted (encoded or decoded, with or without a
// scheme) into a canonical percent-encoded URL string. Falls back to a trimmed
// string if it cannot be parsed.
export const normalizeUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return new URL(withScheme(trimmed)).toString();
  } catch {
    return trimmed;
  }
};

export const randomIdSuffix = () => Math.random().toString(36).slice(2, 6);

// Builds a utm_id from the influencer name, e.g. "Dana Cohen" -> "dana_cohen_k3f9".
// Non-Latin names (e.g. Hebrew) fall back to "infl" so the ID stays URL-friendly.
export const generateCampaignId = (influencerName: string, suffix: string) => {
  const slug =
    influencerName
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 24) || "infl";
  return `${slug}_${suffix}`;
};

export const buildPayload = (
  form: IUtmForm,
  contact: IInfluencerContact,
): IUtmCampaignPayload => ({
  // Normalise the destination to a valid, percent-encoded URL for storage,
  // regardless of whether the user pasted encoded or decoded (e.g. Hebrew) text.
  baseUrl: normalizeUrl(form.baseUrl),
  source: form.source.trim(),
  medium: form.medium.trim(),
  campaign: form.campaign.trim(),
  campaignId: form.campaignId.trim() || undefined,
  term: form.term.trim() || undefined,
  content: form.content.trim() || undefined,
  influencer: contact.influencer.trim() || undefined,
  influencerEmail: contact.influencerEmail.trim() || undefined,
  influencerPhone: contact.influencerPhone.trim() || undefined,
});
