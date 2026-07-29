import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus, LayoutList, PenBox, Eye, Copy, Layers } from "lucide-react";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useUpdateEventSessionMutation } from "@/store/api/eventSessionApi";
import { useGetSessionsByEventIdQuery } from "@/store/api/eventQueryApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { ModalWrapper } from "@/components/wrapper";
import { ActionIconButtons } from "@/components/btns";
import { ImageWithFallback } from "@/components/shared";

interface LandingPagesModalProps {
  eventId: string;
  setIsOpen: (v: boolean) => void;
  eventsRefetch: () => void;
}

const LandingPagesModal: React.FC<LandingPagesModalProps> = ({
  eventId,
  setIsOpen,
  eventsRefetch,
}) => {
  const { t } = useTranslation("event_session");
  const { textPrimary, textTertiary, isDark, borderColor, textSecondary } =
    useThemeClasses();

  const {
    data: sessions,
    refetch,
    isFetching,
    isLoading,
  } = useGetSessionsByEventIdQuery(eventId ? { eventId } : skipToken);

  const [updateEventSession, { isLoading: isUpdating }] =
    useUpdateEventSessionMutation();

  const handleCreateLandingPage = () => {
    window.open(`${routes.eventSessionMgmt}?eventId=${eventId}`, "_blank");
  };

  const handleEditSession = (sessionId: string) => {
    window.open(
      `${routes.eventSessionMgmt}?eventId=${eventId}&wrapperId=${sessionId}`,
      "_blank",
    );
  };

  const handleDuplicateSession = (sessionId: string) => {
    window.open(
      `${routes.eventSessionMgmt}?eventId=${eventId}&wrapperId=${sessionId}&isDuplicate=true`,
      "_blank",
    );
  };

  async function handleToggleStatus(session: IEventSessionListItem) {
    try {
      await updateEventSession({
        sessionId: session._id,
        body: { isActive: !session.isActive },
      }).unwrap();
      toast.success(
        t(
          !session.isActive
            ? "toast_session_activated"
            : "toast_session_deactivated",
        ),
      );
      refetch();
    } catch {
      toast.error(t("toast_session_status_error"));
    }
  }

  const hasSessions = sessions?.data && sessions.data.length > 0;

  return (
    <ModalWrapper
      onClose={() => {
        eventsRefetch();
        setIsOpen(false);
      }}
      height="h-max min-h-[60vh]"
      showSpinner={isFetching || isLoading}
    >
      <div className="p-4 sm:p-6 md:p-8 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center items-stretch justify-between gap-3">
          <h2 className={`text-xl sm:text-2xl font-bold ${textPrimary}`}>
            {t("landing_pages")}
          </h2>

          <button
            type="button"
            onClick={handleCreateLandingPage}
            className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            {t("event_landing_page_create_btn")}
          </button>
        </div>

        {/* Empty state */}
        {!hasSessions && (
          <div
            className={clsx(
              "p-8 sm:p-12 md:p-16 rounded-2xl border-2 border-dashed text-center",
              isDark
                ? "border-gray-700 bg-gray-800/30"
                : "border-gray-300 bg-gray-50",
            )}
          >
            <LayoutList
              className={`w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 opacity-40 ${textTertiary}`}
            />
            <h3
              className={`text-lg sm:text-xl font-semibold mb-2 ${textPrimary}`}
            >
              {t("landing_pages_empty_title")}
            </h3>
            <p className={`mb-6 sm:mb-8 text-sm sm:text-base ${textTertiary}`}>
              {t("landing_pages_empty_desc")}
            </p>
          </div>
        )}

        {/* Landing pages list */}
        {hasSessions && (
          <div className="space-y-4">
            {sessions?.data?.map((session) => {
              const image = session.images?.[0]?.image;

              return (
                <div
                  key={session._id}
                  className={clsx(
                    "p-3 sm:p-4 rounded-xl border hover:shadow-md transition",
                    isDark
                      ? "border-gray-700 bg-gray-800/50"
                      : "border-gray-200 bg-gray-50",
                  )}
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:flex justify-between items-center gap-6">
                    <div className="flex-1 flex items-center gap-4">
                      {image && (
                        <div>
                          <ImageWithFallback
                            src={image}
                            alt={session.headline}
                            className="w-20 h-20 rounded object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p
                            className={`text-xs font-semibold ${textSecondary}`}
                          >
                            {session.brand}
                          </p>
                          <h4
                            className={`text-lg font-semibold ${textPrimary}`}
                          >
                            {session.headline}
                          </h4>
                        </div>
                        {session.subhead && (
                          <p
                            className={`text-sm mb-2 line-clamp-1 ${textTertiary}`}
                          >
                            {session.subhead}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Layers className={clsx("w-4 h-4", textTertiary)} />
                            <span className={textTertiary}>
                              {session.sessionCount}{" "}
                              {session.sessionCount === 1
                                ? t("event_sessions_count_one")
                                : t("event_sessions_count_other")}
                            </span>
                          </div>
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full border capitalize",
                              borderColor,
                              textSecondary,
                            )}
                          >
                            {session.selectionMode}
                          </span>
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full border",
                              borderColor,
                              textSecondary,
                            )}
                          >
                            {session.themeId}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        disabled={isUpdating}
                        onClick={() => handleToggleStatus(session)}
                        className={clsx(
                          "px-3 py-1 rounded-full text-xs font-semibold transition-opacity cursor-pointer",
                          isUpdating
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:opacity-75",
                          session.isActive
                            ? isDark
                              ? "bg-green-900/40 text-green-400"
                              : "bg-green-50 text-green-600"
                            : isDark
                              ? "bg-gray-700 text-gray-400"
                              : "bg-gray-100 text-gray-500",
                        )}
                      >
                        {session.isActive
                          ? t("event_sessions_status_active")
                          : t("event_sessions_status_inactive")}
                      </button>

                      <ActionIconButtons
                        isDark={isDark}
                        actions={[
                          {
                            title: t("view"),
                            icon: Eye,
                            color: "green",
                            onClick: () => handleEditSession(session._id),
                          },
                          {
                            title: t("event_sessions_edit_title"),
                            icon: PenBox,
                            color: "blue",
                            onClick: () => handleEditSession(session._id),
                          },
                          {
                            title: "Duplicate",
                            icon: Copy,
                            color: "gray",
                            onClick: () => handleDuplicateSession(session._id),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="flex items-start gap-3 mb-3">
                      {image && (
                        <ImageWithFallback
                          src={image}
                          alt={session.headline}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border"
                          style={{
                            borderColor: isDark ? "#374151" : "#e5e7eb",
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[10px] font-semibold mb-0.5 ${textSecondary}`}
                            >
                              {session.brand}
                            </p>
                            <h4
                              className={`text-base font-semibold ${textPrimary} truncate`}
                            >
                              {session.headline}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                      <div className="flex items-center gap-1.5">
                        <Layers className={clsx("w-4 h-4", textTertiary)} />
                        <span className={textTertiary}>
                          {session.sessionCount}{" "}
                          {session.sessionCount === 1
                            ? t("event_sessions_count_one")
                            : t("event_sessions_count_other")}
                        </span>
                      </div>
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full border capitalize",
                          borderColor,
                          textSecondary,
                        )}
                      >
                        {session.selectionMode}
                      </span>
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full border",
                          borderColor,
                          textSecondary,
                        )}
                      >
                        {session.themeId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        disabled={isUpdating}
                        onClick={() => handleToggleStatus(session)}
                        className={clsx(
                          "px-3 py-1 rounded-full text-xs font-semibold transition-opacity cursor-pointer",
                          isUpdating
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:opacity-75",
                          session.isActive
                            ? isDark
                              ? "bg-green-900/40 text-green-400"
                              : "bg-green-50 text-green-600"
                            : isDark
                              ? "bg-gray-700 text-gray-400"
                              : "bg-gray-100 text-gray-500",
                        )}
                      >
                        {session.isActive
                          ? t("event_sessions_status_active")
                          : t("event_sessions_status_inactive")}
                      </button>

                      <ActionIconButtons
                        isDark={isDark}
                        actions={[
                          {
                            title: t("view"),
                            icon: Eye,
                            color: "green",
                            onClick: () => handleEditSession(session._id),
                          },
                          {
                            title: t("event_sessions_edit_title"),
                            icon: PenBox,
                            color: "blue",
                            onClick: () => handleEditSession(session._id),
                          },
                          {
                            title: "Duplicate",
                            icon: Copy,
                            color: "gray",
                            onClick: () => handleDuplicateSession(session._id),
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default LandingPagesModal;
