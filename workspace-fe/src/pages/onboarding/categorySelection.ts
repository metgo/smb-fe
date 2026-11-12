import {
  BUSINESS_TAXONOMY,
  MAX_CATEGORY_GROUPS,
  findSubcategory,
  groupForDbCategory,
  groupOfSubcategory,
  nameKey,
} from "@/lib/businessTaxonomy";

/**
 * The vendor's own category choice, made in the two category steps:
 * up to three areas, any number of their subcategories (plus "something
 * else" labels), and one item starred as the main activity.
 */
export interface CategorySelection {
  /** Taxonomy areas (canonical English names), in the order picked. */
  categoryGroups: string[];
  /** Taxonomy subcategories (canonical English names), in the order picked. */
  subcategories: string[];
  /** The vendor's own labels when nothing in the list fits. */
  customCategories: { group: string; label: string }[];
  /** Key of the starred item: a subcategory name, or customKey(label). */
  mainCategory: string;
}

export const emptySelection = (): CategorySelection => ({
  categoryGroups: [],
  subcategories: [],
  customCategories: [],
  mainCategory: "",
});

/** Drafts saved before the category steps existed have none of the fields. */
export const readSelection = (
  d: Partial<CategorySelection>,
): CategorySelection => ({
  categoryGroups: Array.isArray(d.categoryGroups) ? d.categoryGroups : [],
  subcategories: Array.isArray(d.subcategories) ? d.subcategories : [],
  customCategories: Array.isArray(d.customCategories) ? d.customCategories : [],
  mainCategory: typeof d.mainCategory === "string" ? d.mainCategory : "",
});

export const customKey = (label: string) => `custom:${label}`;

/** Every picked item, in order: subcategories first, then custom labels. */
export const selectedKeys = (sel: CategorySelection) => [
  ...sel.subcategories,
  ...sel.customCategories.map((c) => customKey(c.label)),
];

/** The area an item belongs to. */
export const groupOfKey = (sel: CategorySelection, key: string) =>
  key.startsWith("custom:")
    ? sel.customCategories.find((c) => customKey(c.label) === key)?.group
    : groupOfSubcategory(key)?.en;

/** Keep the star on a picked item; fall back to the first one. */
function withMain(sel: CategorySelection): CategorySelection {
  const keys = selectedKeys(sel);
  return keys.includes(sel.mainCategory)
    ? sel
    : { ...sel, mainCategory: keys[0] ?? "" };
}

export function toggleGroup(
  sel: CategorySelection,
  group: string,
): CategorySelection {
  if (sel.categoryGroups.includes(group)) {
    return withMain({
      ...sel,
      categoryGroups: sel.categoryGroups.filter((g) => g !== group),
      subcategories: sel.subcategories.filter(
        (s) => groupOfSubcategory(s)?.en !== group,
      ),
      customCategories: sel.customCategories.filter((c) => c.group !== group),
    });
  }
  if (sel.categoryGroups.length >= MAX_CATEGORY_GROUPS) return sel;
  return { ...sel, categoryGroups: [...sel.categoryGroups, group] };
}

/**
 * Pick or unpick a subcategory. Picking one whose area isn't chosen yet
 * (from search) adds the area too, unless three areas are already chosen.
 */
export function toggleSubcategory(
  sel: CategorySelection,
  sub: string,
): CategorySelection {
  if (sel.subcategories.includes(sub)) {
    return withMain({
      ...sel,
      subcategories: sel.subcategories.filter((s) => s !== sub),
    });
  }
  const group = groupOfSubcategory(sub)?.en;
  if (!group) return sel;
  let next = sel;
  if (!sel.categoryGroups.includes(group)) {
    next = toggleGroup(sel, group);
    if (next === sel) return sel;
  }
  return withMain({ ...next, subcategories: [...next.subcategories, sub] });
}

export function addCustom(
  sel: CategorySelection,
  group: string,
  raw: string,
): CategorySelection {
  const label = raw.trim().replace(/\s+/g, " ").slice(0, 40);
  if (!label || !sel.categoryGroups.includes(group)) return sel;
  const lower = label.toLowerCase();
  const isDuplicate =
    sel.customCategories.some((c) => c.label.toLowerCase() === lower) ||
    sel.subcategories.some((s) => {
      const sub = findSubcategory(s);
      return [sub?.he, sub?.en, sub?.ar].some(
        (l) => l?.toLowerCase() === lower,
      );
    });
  if (isDuplicate) return sel;
  return withMain({
    ...sel,
    customCategories: [...sel.customCategories, { group, label }],
  });
}

export function removeKey(
  sel: CategorySelection,
  key: string,
): CategorySelection {
  return withMain({
    ...sel,
    subcategories: sel.subcategories.filter((s) => s !== key),
    customCategories: sel.customCategories.filter(
      (c) => customKey(c.label) !== key,
    ),
  });
}

export const setMain = (
  sel: CategorySelection,
  key: string,
): CategorySelection =>
  selectedKeys(sel).includes(key) ? { ...sel, mainCategory: key } : sel;

/** Areas in API order: the main item's area first. */
export function orderedGroups(sel: CategorySelection) {
  const mainGroup = groupOfKey(sel, sel.mainCategory);
  return mainGroup && sel.categoryGroups.includes(mainGroup)
    ? [mainGroup, ...sel.categoryGroups.filter((g) => g !== mainGroup)]
    : sel.categoryGroups;
}

/** Body fields for POST /vendor-onboarding/generate-profile. */
export function selectionForApi(sel: CategorySelection) {
  return {
    selectedCategories: orderedGroups(sel).map((group) => ({
      category: group,
      subcategories: sel.subcategories.filter(
        (s) => groupOfSubcategory(s)?.en === group,
      ),
    })),
    mainSubcategory: sel.mainCategory.startsWith("custom:")
      ? undefined
      : sel.mainCategory || undefined,
    customCategories: sel.customCategories.map((c) => ({
      category: c.group,
      label: c.label,
    })),
  };
}

/**
 * Hebrew tags for the chosen subcategories, main first, so they show on the
 * business page and are searchable. (The marketplace's tags are Hebrew.)
 */
export function selectionTags(sel: CategorySelection): string[] {
  const label = (key: string) =>
    key.startsWith("custom:") ? key.slice(7) : findSubcategory(key)?.he;
  const keys = selectedKeys(sel);
  const ordered = sel.mainCategory
    ? [sel.mainCategory, ...keys.filter((k) => k !== sel.mainCategory)]
    : keys;
  return ordered.map(label).filter((l): l is string => !!l);
}

/* ------------------------------------------- saved businesses --- */

interface DbCategory {
  _id: string;
  name?: string;
  hebrewName?: string;
  nameHe?: string;
}

/** An id field that may come back populated ({ _id, ... }) or as a plain id. */
const idOf = (v: unknown): string =>
  typeof v === "string"
    ? v
    : v && typeof v === "object" && "_id" in v
      ? String((v as { _id: unknown })._id)
      : "";

/** The database category that stands for a taxonomy area. */
export const dbCategoryIdForGroup = (
  groupEn: string | undefined,
  dbCategories: DbCategory[] = [],
) =>
  groupEn
    ? dbCategories.find((c) => groupForDbCategory(c)?.en === groupEn)?._id
    : undefined;

/** Subcategory (canonical name) whose label in any language equals a tag. */
const subcategoryForTag = (tag: string) => {
  const key = nameKey(tag);
  if (!key) return undefined;
  for (const g of BUSINESS_TAXONOMY) {
    const sub = g.subcategories.find((x) =>
      [x.he, x.en, x.ar].some((l) => nameKey(l) === key),
    );
    if (sub) return sub.en;
  }
  return undefined;
};

/**
 * Rebuild the category choice of a saved business, which stores it as
 * primaryCategoryId (main area), bussCategoriesId (all areas) and the
 * subcategories as tags, main first. Returns the remaining (plain) tags too.
 */
export function selectionFromSaved(
  saved: {
    primaryCategoryId?: unknown;
    categoryIds?: unknown[];
    tags?: string[];
  },
  dbCategories: DbCategory[] = [],
): { selection: CategorySelection; otherTags: string[] } {
  const areaOfId = (id: string) => {
    const cat = dbCategories.find((c) => c._id === id);
    return cat ? groupForDbCategory(cat)?.en : undefined;
  };
  const primaryArea = areaOfId(idOf(saved.primaryCategoryId));
  const areas: string[] = [];
  const addArea = (a?: string) => {
    if (a && !areas.includes(a) && areas.length < MAX_CATEGORY_GROUPS)
      areas.push(a);
  };
  addArea(primaryArea);
  (saved.categoryIds ?? []).forEach((id) => addArea(areaOfId(idOf(id))));

  const subcategories: string[] = [];
  const otherTags: string[] = [];
  for (const tag of saved.tags ?? []) {
    const sub = typeof tag === "string" ? subcategoryForTag(tag) : undefined;
    if (!sub) {
      if (typeof tag === "string" && tag.trim()) otherTags.push(tag);
      continue;
    }
    const area = groupOfSubcategory(sub)?.en;
    addArea(area);
    if (area && areas.includes(area) && !subcategories.includes(sub)) {
      subcategories.push(sub);
    } else {
      otherTags.push(tag);
    }
  }
  const mainCategory =
    subcategories.find((s) => groupOfSubcategory(s)?.en === primaryArea) ??
    subcategories[0] ??
    "";
  return {
    selection: {
      categoryGroups: areas,
      subcategories,
      customCategories: [],
      mainCategory,
    },
    otherTags,
  };
}

/** PATCH fields for a business: main area, all areas, and tags. */
export function selectionToBusinessFields(
  sel: CategorySelection,
  otherTags: string[],
  dbCategories: DbCategory[] = [],
) {
  const ids = orderedGroups(sel)
    .map((g) => dbCategoryIdForGroup(g, dbCategories))
    .filter((id): id is string => !!id);
  const chosen = selectionTags(sel);
  const seen = new Set<string>();
  const tags = [...chosen, ...otherTags].filter((t) => {
    const k = t.trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return {
    primaryCategoryId: ids[0] ?? "",
    bussCategoriesId: ids,
    tagsId: tags,
  };
}
