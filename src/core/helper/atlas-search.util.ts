export const PRODUCTS_SEARCH_INDEX = 'productsaudits';
export const BUSINESSES_SEARCH_INDEX = 'businessesaudits';

/** Strips Hebrew nikud / cantillation marks (U+0591–U+05C7). */
export function normalizeHebrewSearch(text: string): string {
  return text.replace(/[֑-ׇ]/g, '').trim();
}

export function normalizeArabicSearch(text: string): string {
  // eslint-disable-next-line no-misleading-character-class
  return text.replace(/[ً-ٟۖ-ۭ]/g, '').trim();
}

/**
 * Returns a regex pattern that matches both the given Hebrew search term
 * and its likely singular/plural forms by trying common Hebrew plural suffixes.
 *
 * Examples:
 *   "תפוחים" → also matches "תפוח" (strips ים)
 *   "תפוח"   → also matches "תפוחים", "תפוחות" (adds suffixes)
 *   "ילדות"  → also matches "ילד", "ילדה" (strips ות)
 */
export function buildHebrewSearchRegex(term: string): RegExp {
  const base = normalizeHebrewSearch(term);
  const variants = new Set<string>([base]);

  // Strip common plural suffixes to find the root
  if (base.endsWith('ים')) variants.add(base.slice(0, -2));
  else if (base.endsWith('ות')) variants.add(base.slice(0, -2));
  else if (base.endsWith('ין')) variants.add(base.slice(0, -2));
  else {
    // If it looks like a root, add plural forms
    variants.add(`${base}ים`);
    variants.add(`${base}ות`);
  }

  const pattern = [...variants]
    .map(v => {
      // Escape special regex chars
      const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Insert optional nikud pattern [֑-ׇ]* between every letter
      // This allows "תפוח" to match "תַפּוּחַ"
      return escaped.split('').join('[֑-ׇ]*');
    })
    .join('|');

  return new RegExp(pattern, 'i');
}

/**
 * Build an Atlas Search $search stage for products.
 * Searches across name, nameHe, nameAr, description, descriptionHe, descriptionAr.
 */
export function buildProductAtlasSearchStage(search: string): object {
  return {
    $search: {
      index: PRODUCTS_SEARCH_INDEX,
      text: {
        query: search,
        path: [
          'name',
          'nameHe',
          'nameAr',
          'description',
          'descriptionHe',
          'descriptionAr',
        ],
        fuzzy: {
          maxEdits: 2,
          prefixLength: 1,
        },
      },
    },
  };
}

/**
 * Build an Atlas Search $search stage for businesses.
 * Searches across name, nameHe, nameAr, description, descriptionHe, descriptionAr.
 */
export function buildBusinessAtlasSearchStage(search: string): object {
  return {
    $search: {
      index: BUSINESSES_SEARCH_INDEX,
      text: {
        query: search,
        path: [
          'name',
          'nameHe',
          'nameAr',
          'description',
          'descriptionHe',
          'descriptionAr',
        ],
        fuzzy: {
          maxEdits: 2,
          prefixLength: 1,
        },
      },
    },
  };
}

/**
 * Regex fallback search conditions for products.
 * Used when Atlas Search is unavailable.
 */
export function buildProductRegexSearchConditions(search: string): object {
  const regex = { $regex: search, $options: 'i' };
  return {
    $or: [
      { name: regex },
      { nameHe: regex },
      { nameAr: regex },
      { description: regex },
      { descriptionHe: regex },
      { descriptionAr: regex },
    ],
  };
}

/**
 * Regex fallback search conditions for businesses.
 * Used when Atlas Search is unavailable.
 */
export function buildBusinessRegexSearchConditions(search: string): object {
  const regex = { $regex: search, $options: 'i' };
  return {
    $or: [
      { name: regex },
      { nameHe: regex },
      { nameAr: regex },
      { description: regex },
      { descriptionHe: regex },
      { descriptionAr: regex },
    ],
  };
}
