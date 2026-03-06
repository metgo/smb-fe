import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { ItemStatus } from "@/enums/status.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useCallback, useState } from "react";

interface UseEventDraftSaverProps {
  currentStep: number;
  eventId: string;
  setEventId: (id: string) => void;
  initEventCreate: () => any;
  updateEvent: (args: { eventId: string; body: any }) => any;
  stepPayloadMap: Record<number, () => any>;
  debounceMs?: number;
}

export function useEventDraftSaver({
  currentStep,
  eventId,
  setEventId,
  initEventCreate,
  updateEvent,
  stepPayloadMap,
  // debounceMs = 3600,
}: UseEventDraftSaverProps) {
  const { isTraveller } = useUserRoles();

  const [dirtySteps, setDirtySteps] = useState<Set<number>>(new Set());
  // const debounceTimer = useRef<number | null>(null);
  const { t } = useTranslation("toast");
  // 🔹 Mark step dirty
  const markDirty = useCallback((step: number) => {
    setDirtySteps((prev) => new Set(prev).add(step));
  }, []);

  // 🔹 Build single merged payload
  const buildPayload = useCallback(() => {
    const payload: Record<string, any> = {};

    [...dirtySteps]
      .filter((step) => step <= currentStep)
      .sort((a, b) => a - b)
      .forEach((step) => {
        const builder = stepPayloadMap[step];
        if (builder) Object.assign(payload, builder());
      });

    return payload;
  }, [dirtySteps, currentStep, stepPayloadMap, t]);

  // 🔹 Save Draft (manual or autosave)
  const saveDraft = useCallback(
    async (isPublish = false) => {
      try {
        let internalEventId;

        // 1️⃣ Initialize event if not created yet
        if (!eventId) {
          const res = await initEventCreate().unwrap();
          internalEventId = res?.id;
          setEventId(res?.id);
        }

        // 2️⃣ Build base payload
        let payload = buildPayload();

        // 3️⃣ If publishing, override status
        if (isPublish) {
          payload = {
            ...payload,
            status: isTraveller ? ItemStatus.PENDING : ItemStatus.APPROVED,
          };
        }

        if (!Object.keys(payload).length) return;

        // 4️⃣ Update event
        await updateEvent({
          eventId: internalEventId || eventId!,
          body: payload,
        }).unwrap();

        // 5️⃣ Clear dirty steps up to current step
        setDirtySteps((prev) => {
          const next = new Set(prev);
          [...next].forEach((s) => s <= currentStep && next.delete(s));
          return next;
        });

        toast.success(isPublish ? t("event_published") : t("draft_saved"));
      } catch (err: any) {
        toast.error(t("draft_failed"));
      }
    },
    [
      buildPayload,
      currentStep,
      initEventCreate,
      eventId,
      updateEvent,
      setEventId,
      t,
      isTraveller,
    ],
  );

  // 🔹 Debounced autosave
  // useEffect(() => {
  //   if (!dirtySteps.size) return;

  //   if (debounceTimer.current) clearTimeout(debounceTimer.current);

  //   debounceTimer.current = setTimeout(() => {
  //     saveDraft(true);
  //   }, debounceMs);

  //   return () => {
  //     if (debounceTimer.current) clearTimeout(debounceTimer.current);
  //   };
  // }, [dirtySteps, saveDraft, debounceMs]);

  return {
    eventId,
    markDirty,
    saveDraft,
    hasUnsavedChanges: dirtySteps.size > 0,
  };
}
