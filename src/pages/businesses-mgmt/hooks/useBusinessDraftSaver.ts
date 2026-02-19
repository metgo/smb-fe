import { toast } from "sonner";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

interface UseBusinessDraftSaverProps {
  currentStep: number;
  businessId: string;
  setBusinessId: (id: string) => void;
  initBusinessCreate: () => any;
  updateBusiness: (args: { businessId: string; body: any }) => any;
  stepPayloadMap: any;
}

export function useBusinessDraftSaver({
  currentStep,
  businessId,
  setBusinessId,
  initBusinessCreate,
  updateBusiness,
  stepPayloadMap,
}: UseBusinessDraftSaverProps) {
  const [dirtySteps, setDirtySteps] = useState<Set<number>>(new Set());
  const { t } = useTranslation("toast");
  // 🔹 Mark step dirty
  const markDirty = useCallback((step: number) => {
    setDirtySteps((prev) => new Set(prev).add(step));
  }, []);

  // 🔹 Save Draft (manual or autosave)
  const saveDraft = useCallback(
    async (isPublish = false) => {
      try {
        let internalbusinessId;

        // 1️⃣ Initialize event if not created yet
        if (!businessId) {
          const res = await initBusinessCreate().unwrap();
          internalbusinessId = res?.id;
          setBusinessId(res?.id);
        }

        // 2️⃣ Build base payload
        let payload = stepPayloadMap;

        // 3️⃣ If publishing, override status
        if (isPublish) {
          payload = {
            ...payload,
            status: "APPROVED",
          };
        }

        if (!Object.keys(payload).length) return;

        // 4️⃣ Update event
        await updateBusiness({
          businessId: internalbusinessId || businessId!,
          body: payload,
        }).unwrap();

        // 5️⃣ Clear dirty steps up to current step
        setDirtySteps((prev) => {
          const next = new Set(prev);
          [...next].forEach((s) => s <= currentStep && next.delete(s));
          return next;
        });
        toast.success(isPublish ? t("business_published") : t("draft_saved"));
      } catch (err: any) {
        toast.error(err?.message || t("draft_failed"));
      }
    },
    [
      currentStep,
      stepPayloadMap,
      initBusinessCreate,
      businessId,
      updateBusiness,
      setBusinessId,
      t,
    ],
  );

  return {
    businessId,
    markDirty,
    saveDraft,
    hasUnsavedChanges: dirtySteps.size > 0,
  };
}
