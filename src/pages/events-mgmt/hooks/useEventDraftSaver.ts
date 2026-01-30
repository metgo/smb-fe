import { useCallback, useState } from "react";
import { toast } from "sonner";

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
  const [dirtySteps, setDirtySteps] = useState<Set<number>>(new Set());
  // const debounceTimer = useRef<number | null>(null);

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
  }, [dirtySteps, currentStep, stepPayloadMap]);

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
            status: "APPROVED",
          };
        }

        if (!Object.keys(payload).length) return;

        // 4️⃣ Update event
        const res = await updateEvent({
          eventId: internalEventId || eventId!,
          body: payload,
        }).unwrap();

        // 5️⃣ Clear dirty steps up to current step
        setDirtySteps((prev) => {
          const next = new Set(prev);
          [...next].forEach((s) => s <= currentStep && next.delete(s));
          return next;
        });

        toast.success(
          res?.message ?? (isPublish ? "Event published" : "Draft saved"),
        );
      } catch (err: any) {
        toast.error(err?.message || "Failed to save draft");
      }
    },
    [
      buildPayload,
      currentStep,
      initEventCreate,
      eventId,
      updateEvent,
      setEventId,
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
