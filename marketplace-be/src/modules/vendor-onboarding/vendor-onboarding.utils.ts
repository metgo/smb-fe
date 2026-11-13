import { BUSINESS_TAXONOMY, BusinessTypeGroup } from './business-taxonomy';

/**
 * Pure helpers for vendor onboarding: they hold every rule that does not need
 * the database or the model, so they can be unit tested on their own.
 */

export const SHORT_DESC_MAX = 150;
export const FULL_DESC_MAX = 500;
export const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
export type Day = (typeof DAYS)[number];

export interface TaxonomyItem {
  id: string;
  name: string;
  hebrewName?: string;
}

export interface OnboardingTaxonomy {
  categories: TaxonomyItem[];
  accessibilities: TaxonomyItem[];
  groupTypes: TaxonomyItem[];
  tags: string[];
}

export interface InputProduct {
  name: string;
  description?: string;
  price?: number;
  duration?: string;
  bookingRequired?: boolean;
}

export interface BusinessType {
  category: string;
  subcategories: string[];
}

export interface RawAiProfile {
  businessTypes?: { category?: string; subcategories?: string[] }[];
  primaryCategoryId?: string;
  categoryIds?: string[];
  shortDescription?: string;
  description?: string;
  tags?: string[];
  accessibilityIds?: string[];
  groupTypeIds?: string[];
  openingHours?: { day?: string; open?: string; close?: string; closed?: boolean }[];
  practical?: Record<string, string>;
  highlights?: string[];
  socialLinks?: { platform?: string; url?: string }[];
  products?: { index?: number; shortDescription?: string }[];
  confidenceFlags?: string[];
}

export interface GeneratedProfile {
  /**
   * Groups from the universal business taxonomy (L1 + L2): the vendor's own
   * choice (up to 3), or 1-2 picked by the model when the vendor made none.
   */
  businessTypes: BusinessType[];
  primaryCategoryId: string | null;
  categoryIds: string[];
  shortDescription: string;
  description: string;
  tags: string[];
  accessibilityIds: string[];
  groupTypeIds: string[];
  openingHours: { day: Day; open: string; close: string; closed: boolean }[];
  practical: Record<string, string>;
  highlights: string[];
  socialLinks: { platform: string; url: string }[];
  products: {
    name: string;
    shortDescription: string;
    price: number | null;
    duration: string;
    bookingRequired: boolean;
  }[];
  confidenceFlags: string[];
}

/** Cut text to `max` characters at a word boundary, adding an ellipsis. */
export function clampText(text: string | undefined, max: number): string {
  const clean = (text ?? '').replace(/\s+\n/g, '\n').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function uniq<T>(values: T[]): T[] {
  return [...new Set(values)];
}

/** Keep 1-2 known parent categories, each with up to 3 of its own trades. */
export function normalizeBusinessTypes(
  raw: RawAiProfile['businessTypes'],
  taxonomy: BusinessTypeGroup[] = BUSINESS_TAXONOMY,
): BusinessType[] {
  const seen = new Set<string>();
  return (raw ?? []).flatMap(bt => {
    const group = taxonomy.find(g => g.category === bt?.category);
    if (!group || seen.has(group.category)) return [];
    seen.add(group.category);
    const subs = uniq((bt.subcategories ?? []).filter(s => group.subcategories.includes(s)));
    return [{ category: group.category, subcategories: subs.slice(0, 3) }];
  }).slice(0, 2);
}

/**
 * The vendor's own choice from the category steps: up to 3 known areas, each
 * with any of its own subcategories. The area of the main subcategory comes
 * first, and the main subcategory first within it.
 */
export function normalizeChosenTypes(
  selected: { category?: string; subcategories?: string[] }[] | undefined,
  mainSubcategory?: string,
  taxonomy: BusinessTypeGroup[] = BUSINESS_TAXONOMY,
): BusinessType[] {
  const seen = new Set<string>();
  const types = (selected ?? []).flatMap(bt => {
    const group = taxonomy.find(g => g.category === bt?.category);
    if (!group || seen.has(group.category)) return [];
    seen.add(group.category);
    const subs = uniq((bt.subcategories ?? []).filter(s => group.subcategories.includes(s)));
    if (mainSubcategory && subs.includes(mainSubcategory)) {
      subs.splice(subs.indexOf(mainSubcategory), 1);
      subs.unshift(mainSubcategory);
    }
    return [{ category: group.category, subcategories: subs }];
  }).slice(0, 3);
  const mainIndex = mainSubcategory
    ? types.findIndex(t => t.subcategories[0] === mainSubcategory)
    : -1;
  if (mainIndex > 0) types.unshift(...types.splice(mainIndex, 1));
  return types;
}

const nameKey = (s: string | undefined) => (s ?? '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

/**
 * Database categories whose English or Hebrew name matches one of the
 * taxonomy parents or trades, in taxonomy order (parents first).
 */
export function matchCategoriesByTaxonomy(
  types: BusinessType[],
  categories: TaxonomyItem[],
): string[] {
  const wanted = [
    ...types.map(t => t.category),
    ...types.flatMap(t => t.subcategories),
  ].map(nameKey);
  return uniq(wanted.flatMap(w => categories
    .filter(c => nameKey(c.name) === w || nameKey(c.hebrewName) === w)
    .map(c => c.id)));
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Keep only values that exist in the database lists, enforce the wizard's
 * length limits, and copy vendor facts (product names, prices) from the
 * vendor's own input instead of the model's output.
 */
export function normalizeProfile(
  ai: RawAiProfile,
  taxonomy: OnboardingTaxonomy,
  inputProducts: InputProduct[],
  sourceText: string,
  /** The vendor's own category choice; when given it replaces the model's. */
  chosenTypes: BusinessType[] = [],
): GeneratedProfile {
  const flags = [...(ai.confidenceFlags ?? [])].filter(Boolean);
  const categoryIds = new Set(taxonomy.categories.map(c => c.id));
  const accessIds = new Set(taxonomy.accessibilities.map(c => c.id));
  const groupIds = new Set(taxonomy.groupTypes.map(c => c.id));

  const businessTypes = chosenTypes.length
    ? chosenTypes
    : normalizeBusinessTypes(ai.businessTypes);
  if (!businessTypes.length) flags.push('businessTypes');
  // A database category named like the taxonomy parent wins over the model's pick.
  const taxonomyMatches = matchCategoriesByTaxonomy(businessTypes, taxonomy.categories);

  let primaryCategoryId = taxonomyMatches[0]
    ?? (ai.primaryCategoryId && categoryIds.has(ai.primaryCategoryId) ? ai.primaryCategoryId : null);
  // When the vendor chose and the database has matching categories, the
  // model's extra picks are left out.
  const vendorChoseMatched = chosenTypes.length > 0 && taxonomyMatches.length > 0;
  let cats = uniq([
    ...taxonomyMatches,
    ...(vendorChoseMatched ? [] : (ai.categoryIds ?? []).filter(id => categoryIds.has(id))),
  ]);
  if (!primaryCategoryId && cats.length) [primaryCategoryId] = cats;
  if (primaryCategoryId) cats = uniq([primaryCategoryId, ...cats]);
  cats = cats.slice(0, 3);
  if (!primaryCategoryId) flags.push('category');

  const shortRaw = (ai.shortDescription ?? '').trim();
  const fullRaw = (ai.description ?? '').trim();
  if (shortRaw.length > SHORT_DESC_MAX) flags.push('shortDescription:trimmed');
  if (fullRaw.length > FULL_DESC_MAX) flags.push('description:trimmed');
  if (!shortRaw) flags.push('shortDescription');
  if (!fullRaw) flags.push('description');

  // Opening hours: one row per valid day, well-formed times only.
  const seenDays = new Set<string>();
  const openingHours = (ai.openingHours ?? []).flatMap(h => {
    const day = (h.day ?? '').toUpperCase() as Day;
    if (!DAYS.includes(day) || seenDays.has(day)) return [];
    seenDays.add(day);
    if (h.closed) {
      return [{
        day, open: '', close: '', closed: true,
      }];
    }
    if (!HHMM.test(h.open ?? '') || !HHMM.test(h.close ?? '')) return [];
    return [{
      day, open: h.open as string, close: h.close as string, closed: false,
    }];
  });

  // Social links: only URLs that literally appear in the vendor's input or
  // website text, so the model cannot invent a page.
  const socialLinks = (ai.socialLinks ?? []).filter(
    (s): s is { platform: string; url: string } => !!s.platform
      && !!s.url
      && /^https?:\/\//i.test(s.url)
      && sourceText.includes(s.url.replace(/\/$/, '')),
  );

  const aiProducts = ai.products ?? [];
  const products = inputProducts.map((p, i) => {
    const gen = aiProducts.find(x => x.index === i);
    const price = typeof p.price === 'number' && Number.isFinite(p.price) && p.price >= 0
      ? p.price
      : null;
    if (price === null) flags.push(`products[${i}].price`);
    return {
      name: p.name.trim(),
      shortDescription: clampText(gen?.shortDescription || p.description || '', SHORT_DESC_MAX),
      price,
      duration: (p.duration ?? '').trim(),
      bookingRequired: !!p.bookingRequired,
    };
  });

  return {
    businessTypes,
    primaryCategoryId,
    categoryIds: cats,
    shortDescription: clampText(shortRaw, SHORT_DESC_MAX),
    description: clampText(fullRaw, FULL_DESC_MAX),
    tags: uniq((ai.tags ?? []).map(t => t.trim()).filter(Boolean)).slice(0, 8),
    accessibilityIds: uniq((ai.accessibilityIds ?? []).filter(id => accessIds.has(id))),
    groupTypeIds: uniq((ai.groupTypeIds ?? []).filter(id => groupIds.has(id))),
    openingHours,
    practical: Object.fromEntries(
      Object.entries(ai.practical ?? {}).filter(([, v]) => typeof v === 'string' && v.trim()),
    ),
    highlights: (ai.highlights ?? []).filter(Boolean).slice(0, 4),
    socialLinks,
    products,
    confidenceFlags: uniq(flags),
  };
}

/* ------------------------------------------------------------- website --- */

/** Reject hosts that point at the server's own network (SSRF guard). */
export function isPrivateAddress(ip: string): boolean {
  if (ip.includes(':')) {
    const v6 = ip.toLowerCase();
    if (v6.startsWith('::ffff:')) return isPrivateAddress(v6.slice(7));
    return v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80');
  }
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some(n => Number.isNaN(n))) return true;
  return p[0] === 10
    || p[0] === 127
    || p[0] === 0
    || (p[0] === 169 && p[1] === 254)
    || (p[0] === 172 && p[1] >= 16 && p[1] <= 31)
    || (p[0] === 192 && p[1] === 168)
    || (p[0] === 100 && p[1] >= 64 && p[1] <= 127)
    || p[0] >= 224;
}

/** Turn an HTML page into plain text plus the links found on it. */
export function htmlToText(html: string, maxChars = 8000): string {
  const links = uniq(
    [...html.matchAll(/href=["'](https?:\/\/[^"'\s>]+)["']/gi)]
      .map(m => m[1])
      .filter(u => /facebook|instagram|tiktok|youtube|wa\.me|whatsapp|waze|google\.[a-z.]+\/maps/i.test(u)),
  ).slice(0, 20);
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? '';
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return [metaDesc, text, links.length ? `LINKS: ${links.join(' ')}` : '']
    .filter(Boolean)
    .join('\n')
    .slice(0, maxChars);
}

/* ----------------------------------------------------------- authority --- */

export function normalizeCity(city: string | undefined): string {
  return (city ?? '')
    .replace(/["'״׳`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Authority whose name contains the city, e.g. "עיריית ירוחם" for "ירוחם". */
export function matchAuthorityByName<T extends { id: string; name: string }>(
  authorities: T[],
  city: string | undefined,
): T | null {
  const c = normalizeCity(city);
  if (c.length < 2) return null;
  const hits = authorities.filter(a => normalizeCity(a.name).includes(c));
  return hits.length === 1 ? hits[0] : null;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Majority vote of the authorities of nearby businesses. Returns null when
 * nothing is close enough or no authority has a clear majority.
 */
export function voteNearestAuthority(
  points: { authorityId: string; lat: number; long: number }[],
  lat: number,
  long: number,
  { k = 7, maxKm = 12 } = {},
): { authorityId: string; share: number } | null {
  const near = points
    .map(p => ({ ...p, d: haversineKm(lat, long, p.lat, p.long) }))
    .filter(p => p.d <= maxKm)
    .sort((a, b) => a.d - b.d)
    .slice(0, k);
  if (!near.length) return null;
  const counts = new Map<string, number>();
  near.forEach(p => counts.set(p.authorityId, (counts.get(p.authorityId) ?? 0) + 1));
  const [authorityId, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const share = n / near.length;
  return share > 0.5 ? { authorityId, share } : null;
}
