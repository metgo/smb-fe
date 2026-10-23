import { toast } from "sonner";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { routes } from "@/lib/routes";
import { ItemStatus } from "@/enums/status.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { IOpMode } from "@/enums/operation.types";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface UseBusinessDraftSaverProps {
  opMode: IOpMode;
  onClose: () => void;
  currentStep: number;
  businessId: string;
  setBusinessId: (id: string) => void;
  initBusinessCreate: (v: { name: string }) => any;
  updateBusiness: (args: {
    businessId: string;
    body: any;
    language: Language;
  }) => any;
  stepPayloadMap: any;
}

export function useBusinessDraftSaver({
  opMode,
  onClose,
  currentStep,
  businessId,
  setBusinessId,
  initBusinessCreate,
  updateBusiness,
  stepPayloadMap,
}: UseBusinessDraftSaverProps) {
  const navigate = useNavigate();
  const { t } = useTranslation("toast");
  const { isTraveller } = useUserRoles();
  const { language } = useThemeClasses();

  const [dirtySteps, setDirtySteps] = useState<Set<number>>(new Set());

  const markDirty = useCallback((step: number) => {
    setDirtySteps((prev) => new Set(prev).add(step));
  }, []);

  const saveDraft = useCallback(
    async (isPublish = false, processedFormData?: any) => {
      try {
        // Reuse the business already created during the name-availability
        // check (or from editData in EDIT/DUPLICATE) instead of assuming
        // none exists yet.
        let internalBusinessId = businessId;

        // 1️⃣ Only create if we truly don't have a business yet.
        // Previously this ran unconditionally whenever opMode !== EDIT,
        // which caused a second "create" call (with a deduped name) even
        // after the availability check had already created one.
        if (opMode !== IOpMode.EDIT && !internalBusinessId) {
          const name = stepPayloadMap.name;
          if (!name) {
            toast.error(t("name_required"));
            return;
          }
          const res = await initBusinessCreate({ name }).unwrap();
          internalBusinessId = res?.id;
          setBusinessId(res?.id);
        }

        // 2️⃣ Build base payload
        let payload = processedFormData || stepPayloadMap;

        // 3️⃣ If publishing, override status
        if (isPublish) {
          payload = {
            ...payload,
            status: isTraveller ? ItemStatus.PENDING : ItemStatus.APPROVED,
          };
        }

        if (!Object.keys(payload).length) return;

        if (!internalBusinessId) {
          toast.error(t("draft_failed"));
          return;
        }

        // 4️⃣ Update (patch) — this now always targets the SAME business
        // whether it was created here or during the availability check.
        await updateBusiness({
          language,
          businessId: internalBusinessId,
          body: payload,
        }).unwrap();

        // 5️⃣ Clear dirty steps up to current step
        setDirtySteps((prev) => {
          const next = new Set(prev);
          [...next].forEach((s) => s <= currentStep && next.delete(s));
          return next;
        });

        if (opMode === IOpMode.DUPLICATE) {
          navigate(
            `${routes.businessDetails}?businessId=${internalBusinessId}`,
          );
        }
        onClose();
        toast.success(isPublish ? t("business_published") : t("draft_saved"));
        return internalBusinessId;
      } catch (err: any) {
        toast.error(err?.data?.message || t("draft_failed"));
      }
    },
    [
      t,
      currentStep,
      stepPayloadMap,
      initBusinessCreate,
      businessId,
      updateBusiness,
      setBusinessId,
      isTraveller,
      onClose,
      navigate,
      opMode,
    ],
  );

  return {
    businessId,
    markDirty,
    saveDraft,
    hasUnsavedChanges: dirtySteps.size > 0,
  };
}
