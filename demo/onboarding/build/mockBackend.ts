/**
 * Demo-only fake backend for the Workspace onboarding demo. It is installed
 * as the axios adapter of the Workspace API client and of the onboarding
 * (Marketplace-BE) client, so the real app runs with no server.
 * Not part of the product code: build-demo.sh copies it in.
 */
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { DB_CATEGORIES, SAMPLE_BUSINESSES } from "./samples";

const list = <T,>(items: T[]) =>
  Object.assign([...items], {
    data: items,
    datas: { data: items },
    totalData: items.length,
    meta: { total: items.length, page: 1, limit: 50 },
  });

/** Database categories: the 12 taxonomy areas (see samples.ts). */
const CATEGORIES = DB_CATEGORIES;
const ACCESSIBILITY = [
  { _id: "acc-parking", name: "Parking", hebrewName: "חניה" },
  { _id: "acc-wheel", name: "Wheelchair accessible", hebrewName: "נגיש לכיסאות גלגלים" },
  { _id: "acc-wc", name: "Restrooms", hebrewName: "שירותים" },
];
const GROUP_TYPES = [
  { _id: "grp-family", name: "Families", hebrewName: "משפחות" },
  { _id: "grp-couples", name: "Couples", hebrewName: "זוגות" },
  { _id: "grp-groups", name: "Groups", hebrewName: "קבוצות" },
];
const SOCIAL = [
  { _id: "sm-web", name: "Website" },
  { _id: "sm-fb", name: "Facebook" },
  { _id: "sm-ig", name: "Instagram" },
];
const DMOS = [
  {
    _id: "dmo-negev",
    name: "Negev DMO",
    authorities: [{ _id: "auth-ramat-negev", name: "מועצה אזורית רמת נגב" }],
  },
];
const WEBSITES = [
  {
    _id: "site-negev",
    name: "Negev Time",
    dmoIds: ["dmo-negev"],
    authorityIds: ["auth-ramat-negev"],
  },
];

const businesses: Record<string, any> = {};
// Lets a test read what the app saved.
(window as any).__demoBusinesses = businesses;
let seq = 1;

/** "owner@…" signs in as a vendor who already has the sample businesses. */
const isOwnerEmail = (email: string) => /owner/i.test(email);
function resetBusinesses(owner: boolean) {
  for (const id of Object.keys(businesses)) delete businesses[id];
  if (owner)
    for (const b of SAMPLE_BUSINESSES) businesses[b._id] = structuredClone(b);
}
const clamp = (s: string, n: number) =>
  s.length <= n ? s : `${s.slice(0, n - 1).trim()}…`;
const catIdByName = (name: string) =>
  CATEGORIES.find((c) => c.name === name)?._id;

/** Stand-in for Gemini: stitches the vendor's own answers together. */
function generateProfile(body: any) {
  const a = body.answers ?? {};
  const chosen: { category: string; subcategories: string[] }[] =
    body.selectedCategories ?? [];
  let businessTypes = chosen;
  if (!chosen.length) {
    // No choice made (old drafts): guess from keywords, like before.
    const text = `${body.businessName} ${a.offer} ${a.edge} ${a.fit}`;
    const guess = [
      [/יין|יקב|מסעד|קפה|אוכל|wine|food|cafe|restaurant/i, "Food & Dining"],
      [/צימר|לינה|חדר|מלון|bnb|stay|hotel/i, "Hospitality & Lodging"],
      [/סיור|טיול|ג׳יפ|ג'יפ|tour|jeep|hike/i, "Travel & Transportation"],
      [/סדנ|גלרי|מוזיא|אומנ|workshop|gallery|museum/i, "Arts Entertainment & Culture"],
    ].flatMap(([re, cat]) => ((re as RegExp).test(text) ? [cat as string] : []));
    businessTypes = (guess.length ? guess : ["Travel & Transportation"])
      .slice(0, 2)
      .map((category) => ({ category, subcategories: [] }));
  }
  const categoryIds = businessTypes
    .map((t) => catIdByName(t.category))
    .filter((id): id is string => !!id)
    .slice(0, 3);
  const reco = (a.reco || a.edge || a.offer || "").trim();
  const description = [a.offer, a.edge, a.fit]
    .filter(Boolean)
    .map((x: string) => x.trim())
    .join("\n");
  return {
    businessTypes,
    primaryCategoryId: categoryIds[0] ?? null,
    categoryIds,
    shortDescription: clamp(reco || body.businessName, 140),
    description: clamp(description || body.businessName, 480),
    // The chosen subcategories become the tags; no invented extras here.
    tags: [],
    accessibilityIds: /חני|parking/i.test(a.practical ?? "") ? ["acc-parking"] : [],
    groupTypeIds: [
      ...(/משפח|ילד|famil/i.test(a.fit ?? "") ? ["grp-family"] : []),
      ...(/זוג|coupl/i.test(a.fit ?? "") ? ["grp-couples"] : []),
      ...(/קבוצ|group/i.test(a.fit ?? "") ? ["grp-groups"] : []),
    ],
    openingHours: [],
    practical: a.practical ? { bestTime: a.practical } : {},
    highlights: [],
    socialLinks: [],
    products: (body.products ?? []).map((p: any) => ({
      name: p.name,
      shortDescription: p.description || p.name,
      price: typeof p.price === "number" ? p.price : null,
      duration: p.duration ?? "",
      bookingRequired: !!p.bookingRequired,
    })),
    confidenceFlags: ["demo: generated without AI"],
  };
}

function route(config: InternalAxiosRequestConfig): [number, unknown] {
  const method = (config.method ?? "get").toLowerCase();
  const path = (config.url ?? "")
    .replace(/^https?:\/\/[^/]+/, "")
    .split("?")[0]
    .replace(/^\/?/, "/");
  const body =
    typeof config.data === "string"
      ? JSON.parse(config.data || "{}")
      : (config.data ?? {});

  if (path === "/auth/login" && method === "post") {
    const email = String(body.email || "vendor@demo.co");
    const owner = isOwnerEmail(email);
    resetBusinesses(owner);
    return [
      200,
      {
        accessToken: "demo-token-0123456789",
        user: {
          id: owner ? "demo-owner" : "demo-user",
          _id: owner ? "demo-owner" : "demo-user",
          firstName: owner ? "יואב" : "דנה",
          lastName: owner ? "לוי" : "כהן",
          email,
          role: "traveller",
          hasBusiness: owner,
          phoneDetails: { countryCode: "+972", phoneNumber: "" },
          dmo: null,
          authority: null,
        },
      },
    ];
  }
  if (path === "/vendor-onboarding/generate-profile")
    return [200, generateProfile(body)];
  if (path === "/vendor-onboarding/resolve-authority") {
    return [
      200,
      {
        authorityId: "auth-ramat-negev",
        authorityName: "מועצה אזורית רמת נגב",
        dmoId: "dmo-negev",
        method: "city",
      },
    ];
  }
  if (path.startsWith("/admin/buss-category")) return [200, list(CATEGORIES)];
  if (path.startsWith("/admin/accessibility")) return [200, list(ACCESSIBILITY)];
  if (path.startsWith("/admin/group-type")) return [200, list(GROUP_TYPES)];
  if (path.startsWith("/admin/social-media")) return [200, list(SOCIAL)];
  if (path.startsWith("/dmos-authorities")) return [200, { data: DMOS }];
  if (path.startsWith("/site-settings/websites")) return [200, WEBSITES];
  if (path.startsWith("/media/signed-url") || path.includes("signed"))
    return [200, { data: [] }];
  if (path === "/businesses" && method === "post") {
    if (body.checkOnly) return [200, { available: true }];
    const id = `biz-${seq++}`;
    businesses[id] = {
      _id: id,
      name: body.name,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    };
    return [200, { id }];
  }
  if (path === "/businesses-stat") {
    const all = Object.values(businesses);
    return [
      200,
      {
        totalBusinesses: all.length,
        activeBusinesses: all.filter((b) => b.status === "APPROVED").length,
        totalProducts: 0,
        averageImpactScore: all.length ? 72 : 0,
        pendingApproval: all.filter((b) => b.status === "PENDING").length,
        averageCompletion: all.length ? 86 : 0,
      },
    ];
  }
  const one = path.match(/^\/businesses\/([^/]+)$/);
  if (one) {
    const biz = businesses[one[1]];
    if (method === "patch" && biz) {
      // Replace instead of mutating: the app freezes what it received.
      businesses[one[1]] = { ...biz, ...structuredClone(body) };
      return [200, { message: "ok" }];
    }
    // Hand out a copy, so the stored record never gets frozen by the app.
    return biz ? [200, structuredClone(biz)] : [404, { message: "not found" }];
  }
  if (path === "/businesses" && method === "get") {
    return [
      200,
      list(
        Object.values(businesses)
          .reverse()
          .map((b) => ({
          ...b,
          primaryCategoryId:
            CATEGORIES.find((c) => c._id === b.primaryCategoryId) ?? null,
        })),
      ),
    ];
  }
  if (path === "/products" && method === "post")
    return [200, { id: `prod-${seq++}` }];
  return method !== "get" ? [200, { message: "ok" }] : [200, list([])];
}

export function installMockBackend(client: AxiosInstance) {
  client.defaults.adapter = async (config) => {
    await new Promise((r) =>
      setTimeout(r, config.url?.includes("generate-profile") ? 2200 : 150),
    );
    const [status, data] = route(config);
    const response = {
      data,
      status,
      statusText: String(status),
      headers: {},
      config,
      request: {},
    };
    if (status >= 400) {
      const err: any = new Error(`Request failed with status ${status}`);
      err.response = response;
      err.config = config;
      throw err;
    }
    return response;
  };
}
