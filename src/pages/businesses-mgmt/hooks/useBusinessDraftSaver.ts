import { toast } from "sonner";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ItemStatus } from "@/enums/status.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { IOpMode } from "@/enums/operation.types";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";

interface UseBusinessDraftSaverProps {
  opMode: IOpMode;
  // refetch: () => void;
  onClose: () => void;
  currentStep: number;
  businessId: string;
  setBusinessId: (id: string) => void;
  initBusinessCreate: () => any;
  updateBusiness: (args: { businessId: string; body: any }) => any;
  stepPayloadMap: any;
}

export function useBusinessDraftSaver({
  opMode,
  onClose,
  // refetch,
  currentStep,
  businessId,
  setBusinessId,
  initBusinessCreate,
  updateBusiness,
  stepPayloadMap,
}: UseBusinessDraftSaverProps) {
  const navigate = useNavigate();
  const { isTraveller } = useUserRoles();
  const [dirtySteps, setDirtySteps] = useState<Set<number>>(new Set());
  const { t } = useTranslation("toast");
  // 🔹 Mark step dirty
  const markDirty = useCallback((step: number) => {
    setDirtySteps((prev) => new Set(prev).add(step));
  }, []);

  // 🔹 Save Draft (manual or autosave)
  const saveDraft = useCallback(
    async (isPublish = false, processedFormData?: any) => {
      try {
        let internalbusinessId;

        // 1️⃣ Initialize event if not created yet
        if (opMode !== IOpMode.EDIT) {
          const res = await initBusinessCreate().unwrap();
          internalbusinessId = res?.id;
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

        if (opMode === IOpMode.DUPLICATE) {
          navigate(
            `${routes.businessDetails}?businessId=${internalbusinessId}`,
          );
        } else {
          console.log(".");
          // refetch();
        }
        onClose();
        toast.success(isPublish ? t("business_published") : t("draft_saved"));
        return internalbusinessId || businessId || undefined;
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
      // refetch,
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
