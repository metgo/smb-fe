import clsx from "clsx";
import {
  Trash,
  Upload,
  X,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Calendar,
  PenBox,
  Link,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AField } from "./AField";
import { THEMES } from "../themes";
import { formatDate } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { CreateEventSessionWizard } from "./CreateEventSessionWizard";
import { useLandingPageTab } from "../hooks/useLandingPageTab";
import { routes } from "@/lib/routes";
import { ActionIconButtons, PublishButton } from "@/components/btns";
import { ConfirmDialog, ImageWithFallback, Spinner } from "@/components/shared";
import { ModalWrapper, TooltipWrapper } from "@/components/wrapper";
import BlockSessionAssignModal from "./BlockSessionAssignModal";

interface LandingTabProps {
  config: IAdminConfig;
  onChange: (config: IAdminConfig) => void;
  eventId: string | null;
  wrapperId: string | null;
  setWrapperId: (wrapperId: string | null) => void;
  ticketId: string | null;
  onDirtyChange?: (isDirty: boolean) => void;
  isLoading: boolean;
  isDuplicate: boolean;
  refetch: () => void;
}

const CARD_HEAD = "flex items-center justify-between mb-3.5";

export function LandingTab({
  config,
  onChange,
  wrapperId,
  eventId,
  ticketId,
  setWrapperId,
  onDirtyChange,
  isLoading,
  isDuplicate = false,
  refetch,
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

  const {
    // State
    editBlockData,
    setEditBlockData,
    editSessionData,
    setEditSessionData,
    ticketDateTime,
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

    // Data
    tickets,
    previewUrl,
    progress,
    status,
    fileInputRef,

    // Computed values
    hasHeroImage,
    hasTicket,
    hasBrand,
    hasHeadline,
    hasSubhead,
    hasBlock,
    canPublish,
    blocker,

    // Functions
    update,
    getSessionBlock,
    hasAvailableSessionsForBlock,
    confirmDeleteEventSession,
    toggleTicket,
    handleSubmit,
    confirmDeleteSessionBlock,
    handleFileSelect,
    deleteFile,
    handleAddSessionBtn,

    // Constants
    TICKETS_PREVIEW_COUNT,
  } = useLandingPageTab({
    config,
    onChange,
    wrapperId,
    eventId,
    ticketId,
    onDirtyChange,
    isDuplicate,
    setWrapperId,
  });

  const CARD = clsx(cardClasses, "rounded-[14px] p-5");
  const INPUT = clsx(
    "w-full px-3 py-2.5 text-sm rounded-[9px] transition-[border-color,box-shadow] focus:outline-none focus:ring-2 border",
    inputClasses,
    isDark
      ? "focus:border-blue-400 focus:ring-blue-400/10"
      : "focus:border-blue-500 focus:ring-blue-500/10",
  );

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

  return (
    <>
      <Spinner isLoading={isLoading} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        <div className="space-y-4">
          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("page_header_title")}
              </h3>
            </div>
            <AField label={t("brand_name_field")} isRequired>
              <input
                className={INPUT}
                value={config.brand}
                onChange={(e) => update({ brand: e.target.value })}
              />
            </AField>
            {!hasBrand && (
              <p className="text-xs font-semibold text-red-500 -mt-2 mb-3">
                {t("required_badge")}
              </p>
            )}
            <AField label={t("main_heading_field")} isRequired>
              <input
                className={INPUT}
                value={config.headline}
                onChange={(e) => update({ headline: e.target.value })}
              />
            </AField>
            {!hasHeadline && (
              <p className="text-xs font-semibold text-red-500 -mt-2 mb-3">
                {t("required_badge")}
              </p>
            )}
            <AField label={t("subtitle_field")} isRequired>
              <textarea
                className={clsx(INPUT, "resize-y leading-relaxed")}
                rows={2}
                value={config.subhead}
                onChange={(e) => update({ subhead: e.target.value })}
              />
            </AField>
            {!hasSubhead && (
              <p className="text-xs font-semibold text-red-500 -mt-2 mb-3">
                {t("required_badge")}
              </p>
            )}
            <AField label={t("greeting")}>
              <div className="relative">
                <textarea
                  rows={4}
                  maxLength={500}
                  value={config.greeting}
                  onChange={(e) => update({ greeting: e.target.value })}
                  className={clsx(INPUT, "resize-y leading-relaxed pr-16")}
                />
                <span
                  className={clsx(
                    "absolute bottom-2 right-2 text-xs",
                    textTertiary,
                  )}
                >
                  {config.greeting?.length || 0}/500
                </span>
              </div>
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
            {/* {ticketRes?.data?.availableTickets === 0 && !wrapperId && (
                <p className="text-xs font-semibold text-amber-500 -mt-2 mb-3">
                  {t("ticket_already_used_note")}
                </p>
              )} */}

            {tickets?.length ? (
              <>
                <div className="space-y-2">
                  {tickets
                    .slice(0, 2)
                    .map((ticket: ITicket) => renderTicketRow(ticket))}
                </div>
                {tickets?.length > TICKETS_PREVIEW_COUNT && (
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

          {/* Create session & session list */}
          <div className={CARD}>
            <div className="flex items-center justify-between">
              <div className={CARD_HEAD}>
                <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                  {t("live_sessions_title")}
                  <span className="text-red-500"> *</span>
                </h3>
              </div>
              <TooltipWrapper
                showToolTip={!hasTicket}
                infoText={"You must have ticket first"}
              >
                <button
                  onClick={handleAddSessionBtn}
                  className={clsx(
                    "px-2.75 py-1.5 text-[12.5px] rounded-[9px] font-bold hover:brightness-110 transition-[transform,filter] active:translate-y-px",
                    hasTicket
                      ? "bg-blue-500 cursor-pointer text-white"
                      : "bg-blue-300 cursor-not-allowed text-gray-100",
                  )}
                  disabled={!hasTicket}
                >
                  {t("landing_add_session_btn")}
                </button>
              </TooltipWrapper>
            </div>
            <p
              className={clsx(
                "text-sm leading-relaxed -mt-1.5 mb-3.5",
                textTertiary,
              )}
            >
              {t("live_sessions_help")}
            </p>

            {config?.sessions?.map((e, sessionIdx) => {
              const assignedBlock = getSessionBlock(e._id || "");
              const isAssigned = !!assignedBlock;

              return (
                <div
                  key={sessionIdx}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 py-2.25 px-0.5">
                    <div className="flex items-center gap-2.5 text-sm font-semibold">
                      <ImageWithFallback
                        src={e.images?.[0].image}
                        alt={e.name}
                        className="rounded w-8 h-8 object-cover"
                      />
                      <div className="flex1">
                        <div className="flex items-center gap-1">
                          <p className="">{e.name}</p>
                          {isAssigned && (
                            <div
                              className={clsx(
                                "flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                                isDark ? "text-blue-400" : "text-blue-600",
                              )}
                            >
                              <Link className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 line-clamp-1">
                          {e.description}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <ActionIconButtons
                      isDark={isDark}
                      actions={[
                        {
                          title: t("edit"),
                          icon: PenBox,
                          color: "blue",
                          onClick: () => {
                            setEditSessionData(e);
                            setIsCreateWizardOpen(true);
                          },
                        },
                        {
                          title: isAssigned
                            ? t("session_assigned_warning")
                            : t("delete"),
                          icon: Trash,
                          color: "red",
                          disabled: isAssigned,
                          onClick: () => {
                            if (!isAssigned) {
                              setDeleteIndex(sessionIdx);
                            }
                          },
                        },
                      ]}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assign Sessions into Block */}
          <div className={CARD}>
            <div className="flex items-center justify-between">
              <div className={CARD_HEAD}>
                <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                  {t("assign_sessions_into_block")}
                  <span className="text-red-500"> *</span>
                </h3>
              </div>
              <TooltipWrapper
                showToolTip={!hasTicket || !hasAvailableSessionsForBlock()}
                infoText={
                  !hasTicket
                    ? "You must have ticket first"
                    : t("no_sessions_available_for_block")
                }
              >
                <button
                  onClick={() => setIsCreateBlockWizardOpen(true)}
                  className={clsx(
                    "px-2.75 py-1.5 text-[12.5px] rounded-[9px] font-bold hover:brightness-110 transition-[transform,filter] active:translate-y-px",
                    hasTicket && hasAvailableSessionsForBlock()
                      ? "bg-blue-500 cursor-pointer text-white"
                      : "bg-blue-300 cursor-not-allowed text-gray-100",
                  )}
                  disabled={!hasTicket || !hasAvailableSessionsForBlock()}
                >
                  {t("add_block")}
                </button>
              </TooltipWrapper>
            </div>
            <p
              className={clsx(
                "text-sm leading-relaxed -mt-1.5 mb-3.5",
                textTertiary,
              )}
            >
              {t("assign_block_help")}
            </p>
            {!hasBlock && (
              <p className="text-xs font-semibold text-red-500 -mt-2.5 mb-3.5">
                {t("required_badge")}
              </p>
            )}

            {config?.blocks?.map((e, blockId) => (
              <div key={blockId} className="flex items-center justify-between">
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
                        blocks: config.blocks.map((s, i) =>
                          i === blockId ? { ...s, isActive: !e.isActive } : s,
                        ),
                      })
                    }
                  />
                  <div className="flex-1">
                    <span>{e.name}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={clsx("text-xs", textTertiary)}>
                        {t("booking_limit")}: {e.bookingLimit}
                      </span>
                      <span className={clsx("text-xs", textTertiary)}>
                        {t("assigned_sessions")}: {e.sessionIds?.length || 0}
                      </span>
                    </div>
                  </div>
                </label>
                <div className="flex items-center gap-1">
                  <ActionIconButtons
                    isDark={isDark}
                    actions={[
                      {
                        title: t("edit"),
                        icon: PenBox,
                        color: "blue",
                        onClick: () => {
                          setEditBlockData(e);
                          setIsCreateBlockWizardOpen(true);
                        },
                      },
                    ]}
                  />
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
          wrapperId={wrapperId}
          ticketDateTime={ticketDateTime}
          setIsOpen={setIsCreateWizardOpen}
          editData={editSessionData || undefined}
          setEditSessionData={setEditSessionData}
          onDone={refetch}
        />
      )}

      {isCreateBlockWizardOpen && (
        <BlockSessionAssignModal
          config={config}
          onChange={onChange}
          setIsOpen={setIsCreateBlockWizardOpen}
          wrapperId={wrapperId}
          editData={editBlockData || undefined}
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
        onConfirm={confirmDeleteEventSession}
      />

      <ConfirmDialog
        open={deleteBlockIndex !== null}
        title="delete_session_block"
        message="delete_session_block_confirm"
        confirmText="delete"
        variant="danger"
        onCancel={() => setDeleteBlockIndex(null)}
        onConfirm={confirmDeleteSessionBlock}
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
