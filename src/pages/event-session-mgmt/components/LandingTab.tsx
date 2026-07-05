import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState, useEffect } from "react";
import {
  Pencil,
  Trash,
  Upload,
  X,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBlocker, useNavigate, useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

import { AField } from "./AField";
import { THEMES } from "../themes";
import { formatDate } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { CreateEventSessionWizard } from "./CreateEventSessionWizard";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  useCreateEventSessionMutation,
  useUpdateEventSessionMutation,
  useGetEventSessionByIdQuery,
} from "@/store/api/eventSessionApi";
import { useGetAllSessionTicketQuery } from "@/store/api/eventQueryApi";
import { routes } from "@/lib/routes";
import { PublishButton } from "@/components/btns";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { ModalWrapper } from "@/components/wrapper";
import { DEFAULT_CONFIG } from "../data";

const TICKETS_PREVIEW_COUNT = 2;

interface LandingTabProps {
  config: IAdminConfig;
  onChange: (config: IAdminConfig) => void;
  eventId: string;
  wrapperId: string;
}

const CARD_HEAD = "flex items-center justify-between mb-3.5";

export function LandingTab({
  config,
  onChange,
  wrapperId,
  eventId,
}: LandingTabProps) {
  const navigate = useNavigate();
  const { t } = useTranslation("event_session");
  const {
    isDark,
    textTertiary,
    inputClasses,
    cardClasses,
    isRTL,
    language,
    borderColor,
  } = useThemeClasses();
  const update = (patch: Partial<IAdminConfig>) =>
    onChange({ ...config, ...patch });

  const [_searchParams, setSearchParams] = useSearchParams();

  const [createEventSession, { isLoading: isCreating }] =
    useCreateEventSessionMutation();
  const [updateEventSession, { isLoading: isUpdating }] =
    useUpdateEventSessionMutation();

  const { data: ticketRes } = useGetAllSessionTicketQuery(
    eventId ? { eventId, wrapperId } : skipToken,
  );

  const tickets = ticketRes?.data?.tickets ?? [];
  const { data: existingSession } = useGetEventSessionByIdQuery(wrapperId, {
    skip: !wrapperId,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    previewUrl,
    gcsUrl,
    progress,
    status,
    handleFileSelect,
    deleteFile,
    reset: resetImage,
  } = useFileUpload({
    initialUrl: config.images?.[0]?.image,
  });

  const savedConfigRef = useRef<IAdminConfig>(config);

  useEffect(() => {
    if (!wrapperId) {
      onChange(DEFAULT_CONFIG);
      savedConfigRef.current = DEFAULT_CONFIG;
      resetImage();
    }
  }, [wrapperId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (existingSession) {
      onChange(existingSession);
      savedConfigRef.current = existingSession;
    }
  }, [existingSession]);

  const isDirty =
    JSON.stringify(config) !== JSON.stringify(savedConfigRef.current);

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

  const [editIndex, setEditIndex] = useState<number>(0);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);

  const CARD = clsx(cardClasses, "rounded-[14px] p-5");
  const INPUT = clsx(
    "w-full px-3 py-2.5 text-sm rounded-[9px] transition-[border-color,box-shadow] focus:outline-none focus:ring-2 border",
    inputClasses,
    isDark
      ? "focus:border-blue-400 focus:ring-blue-400/10"
      : "focus:border-blue-500 focus:ring-blue-500/10",
  );

  const modeBtn = (active: boolean) =>
    clsx(
      "text-start px-3.5 py-3.5 rounded-[11px] border-[1.5px] flex flex-col gap-0.5 transition-colors",
      active
        ? isDark
          ? "border-blue-400 bg-blue-950/50"
          : "border-blue-600 bg-blue-50"
        : isDark
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-white",
    );

  function deleteEvent(index: number) {
    if (config.sessions.length <= 1) return;
    const sessions = config.sessions.filter((_, i) => i !== index);
    update({ sessions });
    setEditIndex(0);
  }

  function confirmDeleteEvent() {
    if (deleteIndex === null) return;
    deleteEvent(deleteIndex);
    setDeleteIndex(null);
  }

  function toggleTicket(ticketId: string) {
    const ticketIds = config.ticketIds ?? [];
    update({
      ticketIds: ticketIds.includes(ticketId)
        ? ticketIds.filter((id) => id !== ticketId)
        : [...ticketIds, ticketId],
    });
  }

  function renderTicketRow(ticket: ITicket) {
    const selected = (config.ticketIds ?? []).includes(ticket.ticketId!);
    return (
      <label
        key={ticket.ticketId}
        className={clsx(
          "flex items-center gap-3 p-2.5 rounded-[10px] border-[1.5px] cursor-pointer transition-colors",
          selected
            ? isDark
              ? "border-blue-400 bg-blue-950/50"
              : "border-blue-600 bg-blue-50"
            : isDark
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white",
        )}
      >
        <input
          type="checkbox"
          className={clsx(
            "w-4.25 h-4.25 shrink-0",
            isDark ? "accent-blue-400" : "accent-blue-600",
          )}
          checked={selected}
          onChange={() => toggleTicket(ticket.ticketId!)}
        />
        <ImageWithFallback
          src={ticket.images?.[0]?.image}
          alt={ticket.name}
          className="w-10 h-10 rounded-xl object-cover shrink-0 border"
          style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}
        />
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-semibold truncate">
            {ticket.name}
          </span>
          {!!ticket.dayDescription?.length && (
            <span
              className={clsx(
                "flex items-center gap-1 text-[11.5px] truncate",
                textTertiary,
              )}
            >
              <Calendar className="w-3 h-3 shrink-0" />
              {ticket.dayDescription
                .map((d) => formatDate(d.date, language))
                .join(", ")}
            </span>
          )}
        </div>
        <span
          className={clsx(
            "text-sm font-bold shrink-0",
            isDark ? "text-blue-400" : "text-blue-600",
          )}
        >
          ₪{ticket.price?.sellingPrice}
        </span>
      </label>
    );
  }

  const hasHeroImage = !!config.images?.length;
  const hasTicket = !!config.ticketIds?.length;
  const hasActiveSession = config.sessions.some((s) => s.isActive);
  const canPublish = hasHeroImage && hasTicket && hasActiveSession;

  async function handleSubmit() {
    if (!canPublish) {
      toast.error(t("publish_requirements_error"));
      return;
    }
    try {
      if (wrapperId) {
        await updateEventSession({
          sessionId: wrapperId,
          body: config,
        }).unwrap();
        savedConfigRef.current = config;
        toast.success(t("toast_session_updated"));
      } else {
        const created = await createEventSession({
          ...config,
          eventId,
        }).unwrap();
        savedConfigRef.current = config;
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set("wrapperId", created._id);
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        <div className="space-y-4">
          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("page_header_title")}
              </h3>
            </div>
            <AField label={t("brand_name_field")}>
              <input
                className={INPUT}
                value={config.brand}
                onChange={(e) => update({ brand: e.target.value })}
              />
            </AField>
            <AField label={t("main_heading_field")}>
              <input
                className={INPUT}
                value={config.headline}
                onChange={(e) => update({ headline: e.target.value })}
              />
            </AField>
            <AField label={t("subtitle_field")}>
              <textarea
                className={clsx(INPUT, "resize-y leading-relaxed")}
                rows={2}
                value={config.subhead}
                onChange={(e) => update({ subhead: e.target.value })}
              />
            </AField>
          </div>

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("hero_image_title")}
                <span className="text-red-500"> *</span>
              </h3>
            </div>
            <p className={clsx("text-xs mb-3 -mt-1", textTertiary)}>
              {t("hero_image_help")}
            </p>
            {!hasHeroImage && (
              <p className="text-xs font-semibold text-red-500 -mt-2 mb-3">
                {t("required_badge")}
              </p>
            )}

            {previewUrl ? (
              <div
                className="relative rounded-xl overflow-hidden border group aspect-video"
                style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}
              >
                <img
                  src={previewUrl}
                  alt="hero"
                  className="w-full h-full object-cover"
                />
                {status === "uploading" ? (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <span className="text-white text-xs font-bold">
                      {progress}%
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <button
                      onClick={() => deleteFile()}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all shadow-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                      {t("remove_btn")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors aspect-video flex items-center justify-center",
                  isDark
                    ? "border-gray-700 hover:border-blue-400"
                    : "border-gray-200 hover:border-blue-500",
                )}
              >
                <div>
                  <Upload
                    className={clsx("w-8 h-8 mx-auto mb-2", textTertiary)}
                  />
                  <p className={clsx("text-sm", textTertiary)}>
                    {t("hero_image_placeholder")}
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className={clsx(cardClasses, "rounded-[14px] p-5")}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("choose_theme_title")}
              </h3>
              {config.themeId && (
                <span
                  className={clsx(
                    "text-xs font-semibold",
                    isDark ? "text-blue-400" : "text-blue-600",
                  )}
                >
                  {THEMES.find((th) => th.id === config.themeId)?.name}
                </span>
              )}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {THEMES.map((th) => {
                const active = config.themeId === th.id;
                return (
                  <button
                    key={th.id}
                    title={`${th.name} — ${th.mood}`}
                    onClick={() => update({ themeId: th.id })}
                    className={clsx(
                      "flex flex-col items-center gap-1.5 p-2 rounded-[10px] border-[1.5px] transition-all hover:-translate-y-0.5",
                      isDark ? "bg-gray-800" : "bg-white",
                      active
                        ? isDark
                          ? "border-blue-400 shadow-[0_0_0_3px_rgb(59_130_246/0.12)]"
                          : "border-blue-600 shadow-[0_0_0_3px_rgb(59_130_246/0.12)]"
                        : isDark
                          ? "border-gray-700"
                          : "border-gray-200",
                    )}
                  >
                    <span className="flex w-full h-4 overflow-hidden">
                      {th.swatch.map((c, i) => (
                        <span
                          key={i}
                          className="flex-1"
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                    <span
                      className={clsx(
                        "text-[10px] font-semibold leading-none truncate w-full text-center",
                        active
                          ? isDark
                            ? "text-blue-400"
                            : "text-blue-600"
                          : textTertiary,
                      )}
                    >
                      {th.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("multi_select_tickets_title")}
                <span className="text-red-500"> *</span>
              </h3>
            </div>
            <p className={clsx("text-xs mb-3 -mt-1", textTertiary)}>
              {t("multi_select_tickets_help")}
            </p>
            {!hasTicket && (
              <p className="text-xs font-semibold text-red-500 -mt-2 mb-3">
                {t("required_badge")}
              </p>
            )}

            {tickets?.length ? (
              <>
                <div className="space-y-2">
                  {tickets
                    .slice(0, 2)
                    .map((ticket: ITicket) => renderTicketRow(ticket))}
                </div>
                {tickets.length > TICKETS_PREVIEW_COUNT && (
                  <button
                    onClick={() => setIsTicketsModalOpen(true)}
                    className={clsx(
                      "w-full mt-2 py-2 text-[12.5px] font-bold rounded-[9px] border-[1.5px] transition-colors",
                      isDark
                        ? "border-gray-700 text-blue-400 hover:bg-gray-800"
                        : "border-gray-200 text-blue-600 hover:bg-gray-50",
                    )}
                  >
                    {t("view_more_tickets_btn", {
                      count: tickets.length - TICKETS_PREVIEW_COUNT,
                    })}
                  </button>
                )}
              </>
            ) : (
              <p className={clsx("text-sm", textTertiary)}>
                {t("multi_select_tickets_empty")}
              </p>
            )}
          </div>

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("selection_mode_title")}
              </h3>
            </div>
            <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-2.5">
              <button
                className={modeBtn(config.selectionMode === "radio")}
                onClick={() => update({ selectionMode: "radio" })}
              >
                <strong className="text-sm">{t("radio_mode_label")}</strong>
                <span className={clsx("text-[12.5px]", textTertiary)}>
                  {t("radio_mode_desc")}
                </span>
              </button>
              <button
                className={modeBtn(config.selectionMode === "checkbox")}
                onClick={() => update({ selectionMode: "checkbox" })}
              >
                <strong className="text-sm">{t("checkbox_mode_label")}</strong>
                <span className={clsx("text-[12.5px]", textTertiary)}>
                  {t("checkbox_mode_desc")}
                </span>
              </button>
            </div>
          </div>

          <div className={CARD}>
            <div className="flex items-center justify-between">
              <div className={CARD_HEAD}>
                <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                  {t("live_sessions_title")}
                  <span className="text-red-500"> *</span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditIndex(-1);
                  setIsCreateWizardOpen(true);
                }}
                className={clsx(
                  "px-2.75 py-1.5 text-[12.5px] rounded-[9px] font-bold text-white hover:brightness-110 transition-[transform,filter] active:translate-y-px",
                  isDark ? "bg-blue-500" : "bg-blue-600",
                )}
              >
                {t("landing_add_session_btn")}
              </button>
            </div>
            <p
              className={clsx(
                "text-sm leading-relaxed -mt-1.5 mb-3.5",
                textTertiary,
              )}
            >
              {t("live_sessions_help")}
            </p>
            {!hasActiveSession && (
              <p className="text-xs font-semibold text-red-500 -mt-2.5 mb-3.5">
                {t("required_badge")}
              </p>
            )}
            {config?.sessions?.map((e, sessionIdx) => (
              <div
                key={sessionIdx}
                className="flex items-center justify-between"
              >
                <label className="flex items-center gap-2.5 py-2.25 px-0.5 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    className={clsx(
                      "w-4.25 h-4.25",
                      isDark ? "accent-blue-400" : "accent-blue-600",
                    )}
                    checked={e.isActive}
                    onChange={() =>
                      update({
                        sessions: config.sessions.map((s, i) =>
                          i === sessionIdx
                            ? { ...s, isActive: !e.isActive }
                            : s,
                        ),
                      })
                    }
                  />
                  <span>{e.name}</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditIndex(sessionIdx);
                      setIsCreateWizardOpen(true);
                    }}
                    className={clsx(
                      "p-1 rounded-full text-sm font-bold transition-[transform,filter] active:translate-y-px",
                      isDark
                        ? "bg-blue-950/40 text-blue-400 hover:bg-blue-900/40"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100",
                    )}
                  >
                    <Pencil size={16} />
                  </button>
                  {config.sessions.length > 1 ? (
                    <button
                      onClick={() => setDeleteIndex(sessionIdx)}
                      className={clsx(
                        "p-1 rounded-full text-sm font-bold transition-[transform,filter] active:translate-y-px",
                        isDark
                          ? "bg-red-950/40 text-red-400 hover:bg-red-900/40"
                          : "bg-red-50 text-red-600 hover:bg-red-100",
                      )}
                    >
                      <Trash size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className={CARD}>
            <div className="flex justify-end items-center gap-4">
              <PublishButton
                onClick={handleSubmit}
                isLoading={isCreating || isUpdating}
                disabled={!canPublish}
                title={
                  !canPublish ? t("publish_requirements_error") : undefined
                }
              />
              <button
                className="border border-gray-600 rounded-lg  px-4 py-2 hover:bg-gray-700/50 transition-colors text-sm font-medium"
                onClick={() =>
                  navigate(`${routes.eventDetails}?eventId=${eventId}`)
                }
              >
                {t("back_btn")}
                {isRTL ? (
                  <ArrowLeft className="w-4 h-4 inline-block mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 inline-block ml-2" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isCreateWizardOpen && (
        <CreateEventSessionWizard
          setIsOpen={setIsCreateWizardOpen}
          onChange={onChange}
          config={config}
          editIndex={editIndex}
        />
      )}

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="unsaved_changes"
        message="unsaved_changes_confirm"
        confirmText="leave"
        variant="warning"
        onCancel={() => blocker.state === "blocked" && blocker.reset()}
        onConfirm={() => blocker.state === "blocked" && blocker.proceed()}
      />

      <ConfirmDialog
        open={deleteIndex !== null}
        title="delete_session"
        message="delete_session_confirm"
        confirmText="delete"
        variant="danger"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={confirmDeleteEvent}
      />

      {isTicketsModalOpen && (
        <ModalWrapper
          onClose={() => setIsTicketsModalOpen(false)}
          height="max-sm:h-[80vh] lg:h-max-[60vh] lg:h-min-[40vh]"
          maxWidth="max-w-lg"
        >
          <div className={clsx("px-4 py-3 md:p-6 border-b", borderColor)}>
            <h2 className="m-0 text-lg md:text-xl font-extrabold tracking-tight">
              {t("multi_select_tickets_title")}
            </h2>
            <p className={clsx("text-xs md:text-sm mt-1", textTertiary)}>
              {t("multi_select_tickets_help")}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
            {tickets?.map((ticket: ITicket) => renderTicketRow(ticket))}
          </div>

          <div
            className={clsx(
              "flex justify-end p-3 sm:p-6 border-t",
              borderColor,
            )}
          >
            <button
              onClick={() => setIsTicketsModalOpen(false)}
              className={clsx(
                "px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base rounded-lg font-bold text-white transition-colors",
                isDark ? "bg-blue-500" : "bg-blue-600",
              )}
            >
              {t("done_btn")}
            </button>
          </div>
        </ModalWrapper>
      )}
    </>
  );
}
