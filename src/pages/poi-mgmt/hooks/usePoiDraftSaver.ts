import { toast } from "sonner";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ItemStatus } from "@/enums/status.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { IOpMode } from "@/enums/operation.types";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";
import {
  useInitPoiCreateMutation,
  useUpdatePoiMutation,
} from "@/store/api/poiMutationApi";

interface UsePoiDraftSaverProps {
  opMode: IOpMode;
  refetch?: () => void;
  poiDataRefetch?: () => void;
  onClose: () => void;
  currentStep: number;
  poiId: string;
  setPoiId: (id: string) => void;
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
  stepPayloadMap,
}: UsePoiDraftSaverProps) {
  const navigate = useNavigate();
  const { isTraveller } = useUserRoles();

  const [updatePoi, { isLoading: isSaving }] = useUpdatePoiMutation();
  const [initPoiCreate, { isLoading: isCreating }] = useInitPoiCreateMutation();

  const [dirtySteps, setDirtySteps] = useState<Set<number>>(new Set());
  const { t } = useTranslation("toast");
  const { t: tp } = useTranslation("poi");

  const markDirty = useCallback((step: number) => {
    setDirtySteps((prev) => new Set(prev).add(step));
  }, []);

  const saveDraft = useCallback(
    async (isPublish = false, processedFormData?: any) => {
      try {
        let internalPoiId: string | undefined;

        if (opMode !== IOpMode.EDIT) {
          const res = await initPoiCreate({
            dmoId: stepPayloadMap?.dmoId,
            authorityId: stepPayloadMap?.authorityId,
          }).unwrap();
          internalPoiId = res?.id;
          setPoiId(res?.id);
        }

        let payload = processedFormData || stepPayloadMap;

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
    isCreating,
    isSaving,
    poiId,
    markDirty,
    saveDraft,
    hasUnsavedChanges: dirtySteps.size > 0,
  };
}
