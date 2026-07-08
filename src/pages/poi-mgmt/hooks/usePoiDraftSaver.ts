import { toast } from "sonner";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ItemStatus } from "@/enums/status.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { IOpMode } from "@/enums/operation.types";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";
import { detectLanguage } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface UsePoiDraftSaverProps {
  opMode: IOpMode;
  refetch?: () => void;
  poiDataRefetch?: () => void;
  onClose: () => void;
  currentStep: number;
  poiId: string;
  setPoiId: (id: string) => void;
  initPoiCreate: () => any;
  updatePoi: (args: { poiId: string; body: any }) => any;
  stepPayloadMap: any;
}

export function usePoiDraftSaver({
  opMode,
  onClose,
  refetch,
  poiDataRefetch,
  currentStep,
  poiId,
  setPoiId,
  initPoiCreate,
  updatePoi,
  stepPayloadMap,
}: UsePoiDraftSaverProps) {
  const navigate = useNavigate();
  const { isTraveller } = useUserRoles();
  const [dirtySteps, setDirtySteps] = useState<Set<number>>(new Set());
  const { t } = useTranslation("toast");
  const { t: tp } = useTranslation("poi");
  const { language } = useThemeClasses();

  const getActiveField = (base: string, lang: string): string => {
    if (lang === "en") return base;
    const suffix = lang.charAt(0).toUpperCase() + lang.slice(1);
    return `${base}${suffix}`; // "nameHe", "nameAr", etc.
  };

  const detectAndAssignLanguageFields = (data: any): any => {
    const updated = { ...data };

    const fieldGroups = [
      { base: "name", en: "name", he: "nameHe", ar: "nameAr" },
      {
        base: "shortDescription",
        en: "shortDescription",
        he: "shortDescriptionHe",
        ar: "shortDescriptionAr",
      },
      {
        base: "description",
        en: "description",
        he: "descriptionHe",
        ar: "descriptionAr",
      },
    ];

    fieldGroups.forEach(({ base, en, he, ar }) => {
      // Whichever field the user was actually typing into for THIS group,
      // based on the global language at the time of entry
      const activeField = getActiveField(base, language);
      const text = data[activeField]?.trim();
      if (!text) return;

      const detectedLang = detectLanguage(text); // "en" | "he" | "ar"

      // Clear all three first, then assign to wherever it actually belongs
      updated[en] = "";
      updated[he] = "";
      updated[ar] = "";

      if (detectedLang === "he") {
        updated[he] = text;
      } else if (detectedLang === "ar") {
        updated[ar] = text;
      } else {
        updated[en] = text;
      }
    });

    return updated;
  };

  const markDirty = useCallback((step: number) => {
    setDirtySteps((prev) => new Set(prev).add(step));
  }, []);

  const saveDraft = useCallback(
    async (isPublish = false) => {
      try {
        let internalPoiId: string | undefined;

        if (opMode !== IOpMode.EDIT) {
          const res = await initPoiCreate().unwrap();
          internalPoiId = res?.id;
          setPoiId(res?.id);
        }

        let payload = detectAndAssignLanguageFields(stepPayloadMap);

        if (isPublish) {
          payload = {
            ...payload,
            status: isTraveller ? ItemStatus.PENDING : ItemStatus.APPROVED,
          };
        }

        if (!Object.keys(payload).length) return;

        await updatePoi({
          poiId: internalPoiId || poiId!,
          body: payload,
        }).unwrap();

        setDirtySteps((prev) => {
          const next = new Set(prev);
          [...next].forEach((s) => s <= currentStep && next.delete(s));
          return next;
        });

        if (opMode === IOpMode.DUPLICATE) {
          navigate(`${routes.poiDetails}?poiId=${internalPoiId}`);
        } else {
          poiDataRefetch?.();
          refetch?.();
        }
        onClose();
        toast.success(isPublish ? tp("poi_published") : tp("draft_saved"));
        return internalPoiId || poiId || undefined;
      } catch (err: any) {
        toast.error(err?.data?.message || tp("draft_failed"));
      }
    },
    [
      t,
      tp,
      currentStep,
      stepPayloadMap,
      initPoiCreate,
      poiId,
      updatePoi,
      setPoiId,
      isTraveller,
      refetch,
      poiDataRefetch,
      onClose,
      navigate,
      opMode,
    ],
  );

  return {
    poiId,
    markDirty,
    saveDraft,
    hasUnsavedChanges: dirtySteps.size > 0,
  };
}
