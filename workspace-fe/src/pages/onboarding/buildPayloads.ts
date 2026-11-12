import { readSelection, selectionTags } from "./categorySelection";
import type {
  GeneratedProfile,
  OnboardingDraft,
  ResolvedAuthority,
} from "./types";

interface Lookups {
  /** All websites (to pick the ones of the resolved region). */
  websites?: { _id: string; dmoIds?: string[]; authorityIds?: string[] }[];
  /** Social media platforms (name -> id), e.g. Facebook, Instagram, Website. */
  socialMedia?: { _id: string; name: string }[];
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The wizard's description field is rich text: one <p> per paragraph. */
export const toRichText = (text: string) =>
  text
    .split(/\n{1,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");

/**
 * Map the onboarding answers + generated profile onto the same PATCH body the
 * Add business wizard sends (see CreateBusinessWizard stepPayloadMap), so the
 * wizard can open the result in edit mode with every step filled in.
 */
export function buildBusinessPayload(
  draft: OnboardingDraft,
  profile: GeneratedProfile,
  authority: ResolvedAuthority | null,
  { websites = [], socialMedia = [] }: Lookups,
) {
  const authorityId = authority?.authorityId || "";
  const dmoId = authority?.dmoId || "";
  const associatedWebsiteIds = websites
    .filter(
      (w) =>
        (authorityId && w.authorityIds?.includes(authorityId)) ||
        (dmoId && w.dmoIds?.includes(dmoId)),
    )
    .map((w) => w._id);

  const platformId = (platform: string) =>
    socialMedia.find((s) => s.name?.toLowerCase() === platform.toLowerCase())
      ?._id;
  const links = [...profile.socialLinks];
  if (draft.website.trim()) {
    const url = /^https?:\/\//i.test(draft.website.trim())
      ? draft.website.trim()
      : `https://${draft.website.trim()}`;
    const platform = /facebook\./i.test(url)
      ? "facebook"
      : /instagram\./i.test(url)
        ? "instagram"
        : "website";
    links.unshift({ platform, url });
  }
  const seen = new Set<string>();
  const socialMediaPayload = links.flatMap(({ platform, url }) => {
    const id = platformId(platform);
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [{ socialMediaId: id, url }];
  });

  const byDay = new Map(profile.openingHours.map((h) => [h.day, h]));
  const openingHrs = profile.openingHours.length
    ? DAYS.map((day) => {
        const h = byDay.get(day);
        return !h || h.closed
          ? {
              day,
              open: "",
              close: "",
              isHoliday: true,
              byAppointment: false,
            }
          : {
              day,
              open: h.open,
              close: h.close,
              isHoliday: false,
              byAppointment: false,
            };
      })
    : [];

  const phone = draft.phone.trim();
  return {
    authorityId,
    dmoId,
    associatedWebsiteIds,
    name: draft.businessName.trim(),
    shortDescription: profile.shortDescription,
    description: toRichText(profile.description),
    internalNotes: buildInternalNotes(profile),
    busiEmail: draft.email.trim(),
    phoneNumber: phone,
    contactDetails: {
      name: draft.contactName.trim(),
      countryCode: "+972",
      phone,
      email: draft.email.trim(),
      prefferedChannel: "email",
    },
    address: {
      country: draft.addressParts.country,
      city: draft.addressParts.city,
      location: draft.addressParts.location,
    },
    geoLocation: draft.geo,
    primaryCategoryId: profile.primaryCategoryId || "",
    // The vendor's chosen subcategories lead the tags (main first).
    tagsId: mergeTags(selectionTags(readSelection(draft)), profile.tags),
    accessibilitiesId: profile.accessibilityIds,
    groupTypesId: profile.groupTypeIds,
    images: draft.images.map((img, i) => ({ ...img, isPrimary: i === 0 })),
    ...(openingHrs.length && { openingHrs }),
    socialMedia: socialMediaPayload,
  };
}

const MAX_TAGS = 12;

/** Chosen subcategories first, then the generated tags, without repeats. */
export function mergeTags(chosen: string[], generated: string[]) {
  const seen = new Set<string>();
  return [...chosen, ...generated]
    .map((t) => t.trim())
    .filter((t) => {
      const k = t.toLowerCase();
      if (!t || seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, Math.max(MAX_TAGS, chosen.length));
}

/** Facts with no wizard field go to internal notes so nothing is lost. */
function buildInternalNotes(profile: GeneratedProfile) {
  const lines: string[] = [];
  if (profile.businessTypes?.length) {
    lines.push(
      `Business type: ${profile.businessTypes
        .map((b) =>
          b.subcategories.length
            ? `${b.category} (${b.subcategories.join(", ")})`
            : b.category,
        )
        .join("; ")}`,
    );
  }
  if (profile.highlights.length) {
    lines.push("Highlights:", ...profile.highlights.map((h) => `- ${h}`));
  }
  const practical = Object.entries(profile.practical);
  if (practical.length) {
    lines.push("Practical info:", ...practical.map(([k, v]) => `- ${k}: ${v}`));
  }
  if (profile.confidenceFlags.length) {
    lines.push(`Needs review: ${profile.confidenceFlags.join(", ")}`);
  }
  return lines.length
    ? `Created with the onboarding assistant.\n${lines.join("\n")}`
    : "Created with the onboarding assistant.";
}

/** Draft product bodies, same fields as the Add product wizard. */
export function buildProductPayloads(
  businessId: string,
  profile: GeneratedProfile,
) {
  return profile.products.map((p) => ({
    businessId,
    name: p.name,
    shortDescription: p.shortDescription || p.name,
    description: p.shortDescription ? toRichText(p.shortDescription) : "",
    primaryCategoryId: profile.primaryCategoryId || undefined,
    ...(p.price !== null && {
      price: { markedPrice: p.price, sellingPrice: p.price },
    }),
    ...(p.duration && { serviceDuration: p.duration }),
    quantity: { isUnlimited: true },
  }));
}
