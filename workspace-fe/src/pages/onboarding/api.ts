import axios from "axios";

import axiosInstance from "@/lib/axios";
import { endpoints } from "@/lib/endpoints";
import { envKeys } from "@/lib/envKeys";
import { routes } from "@/lib/routes";
import { UserRole } from "@/enums/user.types";
import type {
  GeneratedProfile,
  OnboardingDraft,
  ResolvedAuthority,
} from "./types";

/** Marketplace-BE client, same bearer token as the main API. */
const onboardingClient = axios.create({
  baseURL: envKeys.onboardingUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 90_000,
});

onboardingClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("access_token")
      : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const toNumber = (v: string) => {
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return v.trim() && Number.isFinite(n) ? n : undefined;
};

export async function generateProfile(
  draft: OnboardingDraft,
  language: string,
): Promise<GeneratedProfile> {
  const { data } = await onboardingClient.post(
    "/vendor-onboarding/generate-profile",
    {
      businessName: draft.businessName.trim(),
      address: draft.addressParts,
      website: draft.website.trim() || undefined,
      answers: draft.answers,
      products: draft.products
        .filter((p) => p.name.trim())
        .map((p) => ({
          name: p.name.trim(),
          description: p.description.trim() || undefined,
          price: toNumber(p.price),
          duration: p.duration.trim() || undefined,
          bookingRequired: p.bookingRequired,
        })),
      language,
    },
  );
  return data;
}

export async function resolveAuthority(
  draft: OnboardingDraft,
): Promise<ResolvedAuthority | null> {
  try {
    const { data } = await onboardingClient.get(
      "/vendor-onboarding/resolve-authority",
      {
        params: {
          city: draft.addressParts.city || undefined,
          address: draft.address || undefined,
          lat: draft.geo.lat || undefined,
          long: draft.geo.long || undefined,
        },
      },
    );
    return data;
  } catch {
    // The vendor (or an admin) can still pick the region in the wizard.
    return null;
  }
}

/** Number of businesses the signed-in user can see (a vendor sees their own). */
export async function countMyBusinesses(): Promise<number | null> {
  try {
    const { data } = await axiosInstance.get(endpoints.businesses, {
      params: { page: 1, limit: 1 },
    });
    return typeof data?.totalData === "number"
      ? data.totalData
      : (data?.data?.length ?? null);
  } catch {
    return null;
  }
}

/**
 * Where to send a user right after login or signup: a vendor with no
 * businesses goes straight into onboarding, everyone else to the dashboard.
 * `hasBusiness` is only kept up to date for vendors who signed up through the
 * public site, so the vendor's businesses are counted instead.
 */
export async function postLoginPath(user: {
  role?: string;
  hasBusiness?: boolean;
}): Promise<string> {
  if (user?.role !== UserRole.TRAVELLER) return routes.dashboard;
  const count = await countMyBusinesses();
  return count === 0 || (count === null && !user.hasBusiness)
    ? `${routes.businessMgmt}?onboarding=1`
    : routes.dashboard;
}
