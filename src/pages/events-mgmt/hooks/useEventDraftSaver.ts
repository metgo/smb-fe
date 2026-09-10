import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { ItemStatus } from "@/enums/status.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useCallback, useState, type MutableRefObject } from "react";

interface UseEventDraftSaverProps {
  currentStep: number;
  eventId: string;
  setEventId: (id: string) => void;
  initEventCreate: (args: { businessId?: string }) => any;
  updateEvent: (args: { eventId: string; body: any }) => any;
  stepPayloadMap: Record<number, () => any>;
  /**
   * Snapshot of the step payloads as hydrated from the server (edit mode only).
   * When present, buildPayload() drops any field that still equals its
   * snapshot value, so the update body carries only genuinely-changed fields.
   */
  hydratedPayloadRef?: MutableRefObject<Record<string, any> | null>;
  businessId?: string;
  debounceMs?: number;
}

export function useEventDraftSaver({
  currentStep,
  eventId,
  setEventId,
  initEventCreate,
  updateEvent,
  stepPayloadMap,
  hydratedPayloadRef,
  businessId,
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

  // Localized fields (name/description in He/Ar) that must never be sent as an
  // empty string — an untouched non-active language would otherwise wipe the
  // stored translation on the backend.
  const OPTIONAL_LOCALIZED_FIELDS = [
    "nameHe",
    "nameAr",
    "descriptionHe",
    "descriptionAr",
    "shortDescriptionHe",
    "shortDescriptionAr",
  ];

  // 🔹 Edit mode: drop any field that still equals its server snapshot value,
  // so untouched fields on a dirty step aren't re-sent.
  const stripUnchangedFields = useCallback(
    (payload: Record<string, any>) => {
      const snapshot = hydratedPayloadRef?.current;
      const diffed: Record<string, any> = {};
      for (const key of Object.keys(payload)) {
        // Never send an empty localized field: if the user didn't type a
        // translation, omit it rather than clearing the server value.
        if (
          OPTIONAL_LOCALIZED_FIELDS.includes(key) &&
          (payload[key] == null || payload[key] === "")
        ) {
          continue;
        }
        if (
          snapshot &&
          key in snapshot &&
          JSON.stringify(payload[key]) === JSON.stringify(snapshot[key])
        ) {
          continue;
        }
        diffed[key] = payload[key];
      }
      return diffed;
    },
    [hydratedPayloadRef],
  );

  // 🔹 Save Draft (manual or autosave)
  const saveDraft = useCallback(
    async (isPublish = false, overridePayload?: Record<string, any>) => {
      try {
        let internalEventId;
        if (!eventId) {
          const res = await initEventCreate({ businessId }).unwrap();
          internalEventId = res?.id;
          setEventId(res?.id);
        }

        let payload = stripUnchangedFields({
          ...buildPayload(),
          ...overridePayload,
        });

        if (isPublish) {
          payload = {
            ...payload,
            status: isTraveller ? ItemStatus.PENDING : ItemStatus.APPROVED,
          };
        }

        if (!Object.keys(payload).length) return;

        await updateEvent({
          eventId: internalEventId || eventId!,
          body: payload,
        }).unwrap();

        setDirtySteps((prev) => {
          const next = new Set(prev);
          [...next].forEach((s) => s <= currentStep && next.delete(s));
          return next;
        });

        toast.success(isPublish ? t("event_published") : t("draft_saved"));
        return internalEventId || eventId || undefined;
      } catch (err: any) {
        toast.error(t("draft_failed"));
      }
    },
    [
      buildPayload,
      stripUnchangedFields,
      currentStep,
      initEventCreate,
      eventId,
      updateEvent,
      setEventId,
      t,
      isTraveller,
      businessId,
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
