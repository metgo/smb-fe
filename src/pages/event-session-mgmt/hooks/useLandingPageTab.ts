import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRef, useState, useEffect } from "react";
import { useBlocker, useSearchParams } from "react-router-dom";

import { useFileUpload } from "@/hooks/useFileUpload";
import {
  useCreateEventSessionMutation,
  useUpdateEventSessionMutation,
  useGetEventSessionByIdQuery,
  useDeleteSessionBlockMutation,
  useDeleteSessionMutation,
  useInitCreateSessionWrapperMutation,
} from "@/store/api/eventSessionApi";
import { useGetAllSessionTicketQuery } from "@/store/api/eventQueryApi";
import { DEFAULT_CONFIG } from "../data";

const TICKETS_PREVIEW_COUNT = 2;

interface UseLandingPageTabProps {
  config: IAdminConfig;
  onChange: (config: IAdminConfig) => void;
  eventId: string | null;
  wrapperId: string | null;
  ticketId: string | null;
  onDirtyChange?: (isDirty: boolean) => void;
  isDuplicate: boolean;
  setWrapperId: (wrapperId: string | null) => void;
}

export function useLandingPageTab({
  config,
  onChange,
  wrapperId,
  eventId,
  ticketId,
  onDirtyChange,
  isDuplicate = false,
  setWrapperId,
}: UseLandingPageTabProps) {
  const { t } = useTranslation("event_session");
  const [_searchParams, setSearchParams] = useSearchParams();

  const update = (patch: Partial<IAdminConfig>) => {
    return onChange({ ...config, ...patch });
  };

  const [editBlockData, setEditBlockData] = useState<ISessionBlock | null>(
    null,
  );
  const [editSessionData, setEditSessionData] = useState<IEventSession | null>(
    null,
  );
  const [ticketDateTime, setTicketDateTime] = useState<
    ITicketDayTimeForSession[]
  >([]);

  const [createEventSession, { isLoading: isCreating }] =
    useCreateEventSessionMutation();
  const [updateEventSession, { isLoading: isUpdating }] =
    useUpdateEventSessionMutation();
  const [deleteSessionBlock, { isLoading: isDeletingSessionBlock }] =
    useDeleteSessionBlockMutation();
  const [deleteSession, { isLoading: isDeletingSession }] =
    useDeleteSessionMutation();
  const [initLandingPage] = useInitCreateSessionWrapperMutation();

  const { data: ticketRes, refetch } = useGetAllSessionTicketQuery(
    eventId ? { eventId, wrapperId: wrapperId || "" } : skipToken,
  );

  const { data: existingSession } = useGetEventSessionByIdQuery(
    wrapperId ? wrapperId : skipToken,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialImageUrl, setInitialImageUrl] = useState(
    config.images?.[0]?.image,
  );

  const {
    previewUrl,
    gcsUrl,
    progress,
    status,
    handleFileSelect,
    deleteFile,
    reset: resetImage,
  } = useFileUpload({
    initialUrl: initialImageUrl,
  });

  // Sync initialImageUrl when config.images changes
  useEffect(() => {
    setInitialImageUrl(config.images?.[0]?.image);
  }, [config.images]);

  const savedConfigRef = useRef<IAdminConfig>(config);

  useEffect(() => {
    if (!wrapperId) {
      onChange(DEFAULT_CONFIG);
      savedConfigRef.current = DEFAULT_CONFIG;
      resetImage();
    }
  }, [wrapperId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (eventId && wrapperId) {
      refetch();
    }
  }, [eventId, wrapperId, refetch]);

  useEffect(() => {
    if (existingSession) {
      if (isDuplicate) {
        const formattedExsitingSession = {
          ...existingSession,
          brand: `${existingSession.brand} (Copy)`,
          images: [],
          ticketIds: [],
          bookinLimit: 1,
        };
        (onChange(formattedExsitingSession),
          (savedConfigRef.current = formattedExsitingSession));
      } else {
        onChange(existingSession);
        savedConfigRef.current = existingSession;
      }
    }
  }, [existingSession]);

  const tickets = isDuplicate
    ? ticketRes?.data?.tickets?.filter(
      (ticket) => !existingSession?.ticketIds?.includes(ticket?.ticketId),
    )
    : (ticketRes?.data?.tickets ?? []);

  const isDirty =
    JSON.stringify(config) !== JSON.stringify(savedConfigRef.current);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => onDirtyChange?.(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const currentUrl = config.images?.[0]?.image ?? "";
    if (gcsUrl !== currentUrl) {
      update({ images: gcsUrl ? [{ image: gcsUrl }] : [] });
    }
  }, [gcsUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ticketId) return;
    if ((config.ticketIds ?? []).includes(ticketId)) return;
    update({ ticketIds: [...(config.ticketIds ?? []), ticketId] });
  }, [ticketId, config.ticketIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [isCreateBlockWizardOpen, setIsCreateBlockWizardOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteBlockIndex, setDeleteBlockIndex] = useState<number | null>(null);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);

  function deleteEvent(index: number) {
    if (config.sessions.length <= 1) return;
    const sessions = config.sessions.filter((_, i) => i !== index);
    update({ sessions });
  }

  function getSessionBlock(sessionId: string): ISessionBlock | null {
    if (!config.blocks) return null;
    for (const block of config.blocks) {
      if (block.sessionIds?.includes(sessionId)) {
        return block;
      }
    }
    return null;
  }

  function hasAvailableSessionsForBlock(): boolean {
    if (!config.sessions || config.sessions.length === 0) return false;
    return true;
  }

  async function confirmDeleteEventSession() {
    if (deleteIndex === null) return;
    const sessionToDelete = config.sessions[deleteIndex];
    if (sessionToDelete?._id && wrapperId) {
      try {
        await deleteSession({
          wrapperId,
          sessionId: sessionToDelete._id,
        }).unwrap();
        toast.success(t("toast_session_deleted"));
      } catch {
        toast.error(t("toast_session_delete_error"));
      }
    }
    deleteEvent(deleteIndex);
    setDeleteIndex(null);
  }

  function toggleTicket(ticketId: string) {
    const ticketIds = config.ticketIds ?? [];
    const isAdding = !ticketIds.includes(ticketId);

    // Update ticket IDs if no conflict
    update({
      ticketIds: ticketIds.includes(ticketId)
        ? ticketIds.filter((id) => id !== ticketId)
        : [...ticketIds, ticketId],
    });

    if (isAdding) {
      // Find the ticket being added
      const ticketToAdd = tickets?.find((t) => t.ticketId === ticketId);
      if (!ticketToAdd) return;

      // Get currently selected tickets
      const currentSelectedTickets =
        tickets?.filter((t) => ticketIds.includes(t.ticketId!)) || [];

      // Check for date/time conflicts with existing selections
      const allSelectedTickets = [...currentSelectedTickets, ticketToAdd];
      const dateTimeSet = new Set<string>();

      for (const ticket of allSelectedTickets) {
        for (const day of ticket.dayDescription || []) {
          const key = `${day.date}_${day.startTime}`;
          if (dateTimeSet.has(key)) {
            break;
          }
          dateTimeSet.add(key);
        }
      }

      // Add the new ticket's date/times to the state
      const newDateTimeEntries: ITicketDayTimeForSession[] = (
        ticketToAdd.dayDescription || []
      ).map((day) => ({
        ticketId: ticketToAdd.ticketId!,
        ticketName: ticketToAdd.name,
        date: day.date,
        startTime: day.startTime,
        endTime: day.endTime,
      }));

      setTicketDateTime((prev) => [...prev, ...newDateTimeEntries]);
    } else {
      // Remove the ticket's date/times when unchecking
      setTicketDateTime((prev) =>
        prev.filter((item) => item.ticketId !== ticketId),
      );
    }
  }

  const hasHeroImage = !!config.images?.length;
  const hasTicket = !!config.ticketIds?.length;
  const hasActiveSession = config.sessions.some((s) => s.isActive);
  const hasBrand = !!config.brand?.trim();
  const hasHeadline = !!config.headline?.trim();
  const hasSubhead = !!config.subhead?.trim();
  const hasBlock = config.blocks && config.blocks.length > 0;
  const canPublish =
    // hasHeroImage &&
    hasTicket &&
    hasActiveSession &&
    hasBrand &&
    hasHeadline &&
    hasSubhead &&
    hasBlock;

  async function handleSubmit() {
    if (!canPublish) {
      toast.error(t("publish_requirements_error"));
      return;
    }
    try {
      if (wrapperId && !isDuplicate) {
        const { sessions, blocks, ...rest } = config;
        await updateEventSession({
          sessionId: wrapperId,
          body: rest,
        }).unwrap();
        savedConfigRef.current = config;
        toast.success(t("toast_session_updated"));
      } else {
        const created = await createEventSession({
          ...config,
          eventId: eventId!,
        }).unwrap();
        savedConfigRef.current = config;
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set("wrapperId", created.id);
            return next;
          },
          { replace: true },
        );
        toast.success(t("toast_session_created"));
      }
    } catch {
      toast.error(
        t(
          wrapperId
            ? "toast_session_update_error"
            : "toast_session_create_error",
        ),
      );
    }
  }

  async function handleDeleteSessionBlock(eventSessionBlockId: string) {
    try {
      await deleteSessionBlock({
        wrapperId: wrapperId!,
        blockId: eventSessionBlockId,
      }).unwrap();
      toast.success(t("toast_session_block_deleted"));
    } catch {
      toast.error(t("toast_session_block_delete_error"));
    }
  }

  async function confirmDeleteSessionBlock() {
    if (deleteBlockIndex === null) return;
    const blockToDelete = config.blocks[deleteBlockIndex];
    if (blockToDelete?._id) {
      await handleDeleteSessionBlock(blockToDelete._id);
    }
    const blocks = config.blocks.filter((_, i) => i !== deleteBlockIndex);
    update({ blocks });
    setDeleteBlockIndex(null);
  }

  async function handleAddSessionBtn() {
    let finalWrapperId = wrapperId;

    if (!wrapperId || wrapperId === "") {
      const res = await initLandingPage({ ...config, eventId });
      if (res && "data" in res && res.data?.id) {
        finalWrapperId = res.data.id;
        setWrapperId(finalWrapperId);
        // Set the wrapperId on URL
        const url = new URL(window.location.href);
        url.searchParams.set("wrapperId", finalWrapperId);
        window.history.replaceState({}, "", url);
      }
    }
    setIsCreateWizardOpen(true);
  }

  return {
    // State
    editBlockData,
    setEditBlockData,
    editSessionData,
    setEditSessionData,
    ticketDateTime,
    setTicketDateTime,
    isCreateWizardOpen,
    setIsCreateWizardOpen,
    isCreateBlockWizardOpen,
    setIsCreateBlockWizardOpen,
    deleteIndex,
    setDeleteIndex,
    deleteBlockIndex,
    setDeleteBlockIndex,
    isTicketsModalOpen,
    setIsTicketsModalOpen,

    // Loading states
    isCreating,
    isUpdating,
    isDeletingSessionBlock,
    isDeletingSession,

    // Data
    tickets,
    previewUrl,
    gcsUrl,
    progress,
    status,
    fileInputRef,

    // Computed values
    hasHeroImage,
    hasTicket,
    hasActiveSession,
    hasBrand,
    hasHeadline,
    hasSubhead,
    hasBlock,
    canPublish,
    isDirty,
    blocker,

    // Functions
    update,
    deleteEvent,
    getSessionBlock,
    hasAvailableSessionsForBlock,
    confirmDeleteEventSession,
    toggleTicket,
    handleSubmit,
    confirmDeleteSessionBlock,
    handleFileSelect,
    deleteFile,
    resetImage,
    handleAddSessionBtn,

    // Constants
    TICKETS_PREVIEW_COUNT,
  };
}
