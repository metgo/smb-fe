import { useCallback, useState } from "react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ItemStatus } from "@/enums/status.types";
import {
  useInitBusinessCreateMutation,
  useUpdateBusinessMutation,
} from "@/store/api/businessMutationApi";
import {
  useInitProductCreateMutation,
  useUpdateProductMutation,
} from "@/store/api/productMutationApi";
import { generateProfile, resolveAuthority } from "./api";
import { buildBusinessPayload, buildProductPayloads } from "./buildPayloads";
import type { OnboardingDraft } from "./types";

export type CreateStage =
  "idle" | "reading" | "writing" | "saving" | "products" | "done" | "error";

export interface CreateResult {
  businessId: string;
  productsFailed: number;
}

/**
 * Runs the whole "answers -> draft business" pipeline:
 * generate the profile and find the region in parallel, create the business,
 * fill it with the wizard's fields, then create the products as drafts.
 */
export function useCreateFromOnboarding() {
  const { language } = useThemeClasses();
  const { allWebsites, socialMedia } = useCommon();
  const [initBusinessCreate] = useInitBusinessCreateMutation();
  const [updateBusiness] = useUpdateBusinessMutation();
  const [initProductCreate] = useInitProductCreateMutation();
  const [updateProduct] = useUpdateProductMutation();

  const [stage, setStage] = useState<CreateStage>("idle");
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (draft: OnboardingDraft): Promise<CreateResult | null> => {
      setError(null);
      try {
        setStage(draft.website.trim() ? "reading" : "writing");
        const writingTimer = window.setTimeout(() => setStage("writing"), 4000);
        const [profile, authority] = await Promise.all([
          generateProfile(draft, language),
          resolveAuthority(draft),
        ]).finally(() => window.clearTimeout(writingTimer));

        setStage("saving");
        const created = await initBusinessCreate({
          name: draft.businessName.trim(),
          dmoId: authority?.dmoId || undefined,
          authorityId: authority?.authorityId || undefined,
        }).unwrap();
        const businessId: string = created?.id || created?._id;
        if (!businessId) throw new Error("create_failed");

        const payload = buildBusinessPayload(draft, profile, authority, {
          websites: Array.isArray(allWebsites) ? allWebsites : [],
          socialMedia: Array.isArray(socialMedia?.datas?.data)
            ? socialMedia.datas.data
            : [],
        });
        try {
          await updateBusiness({
            language,
            businessId,
            body: payload,
          }).unwrap();
        } catch {
          // Retry with the core fields only, in case an optional field is rejected.
          const { socialMedia: _s, openingHrs: _o, ...core } = payload as any;
          await updateBusiness({ language, businessId, body: core }).unwrap();
        }
        if (profile.categoryIds.length > 1) {
          // Extra categories have no wizard field; best effort.
          await updateBusiness({
            language,
            businessId,
            body: { bussCategoriesId: profile.categoryIds },
          })
            .unwrap()
            .catch(() => undefined);
        }

        let productsFailed = 0;
        const products = buildProductPayloads(businessId, profile);
        if (products.length) {
          setStage("products");
          for (const body of products) {
            try {
              // Sequential so products keep the vendor's order.
              const res = await initProductCreate({ businessId }).unwrap();
              await updateProduct({
                language,
                productId: res?.id || res?._id,
                body: { ...body, status: ItemStatus.DRAFT },
              }).unwrap();
            } catch {
              productsFailed += 1;
            }
          }
        }

        setStage("done");
        return { businessId, productsFailed };
      } catch (err: any) {
        setStage("error");
        setError(err?.response?.data?.message || err?.data?.message || null);
        return null;
      }
    },
    [
      language,
      allWebsites,
      socialMedia,
      initBusinessCreate,
      updateBusiness,
      initProductCreate,
      updateProduct,
    ],
  );

  return { run, stage, error, reset: () => setStage("idle") };
}
