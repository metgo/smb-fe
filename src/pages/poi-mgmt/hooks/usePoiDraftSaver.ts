import { toast } from "sonner";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ItemStatus } from "@/enums/status.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { IOpMode } from "@/enums/operation.types";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";

interface UsePoiDraftSaverProps {
  opMode: IOpMode;
  refetch: () => void;
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
  const { t:tp } = useTranslation("poi");

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

        let payload = stepPayloadMap;

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
          refetch();
        }
        onClose();
        toast.success(isPublish ? tp("poi_published") : tp("draft_saved"));
      } catch (err: any) {
        toast.error(err?.data?.message || tp("draft_failed"));
      }
    },
    [
      t,
      currentStep,
      stepPayloadMap,
      initPoiCreate,
      poiId,
      updatePoi,
      setPoiId,
      isTraveller,
      refetch,
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
