import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Edit, LayoutList, Layers, Plus, Eye, Copy, Trash2 } from "lucide-react";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useDeleteLandingPageMutation, useUpdateEventSessionMutation } from "@/store/api/eventSessionApi";
import { ActionIconButtons } from "@/components/btns";

interface EventSessionDetailsProps {
  eventId: string;
  isLoading: boolean;
  sessions?: IEventSessionListResponse;
  refetch: () => void;
  eventDetails?: any;
}

const EventSessionDetails: React.FC<EventSessionDetailsProps> = ({
  eventId,
  isLoading,
  sessions,
  refetch,
  eventDetails,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("event_session");
  const { isDark, borderColor } = useThemeClasses();
  const [updateEventSession, { isLoading: isUpdating }] =
    useUpdateEventSessionMutation();
  const [deleteLandingPage, { isLoading: isDeleting }] = useDeleteLandingPageMutation()




  const handleDeleteSession = async (wrapperId: string) => {
    await deleteLandingPage(wrapperId)
      .unwrap()
      .then(() => {
        toast.success("Session deleted successfully");
        refetch();
      })
      .catch((err) => {
        toast.error(err.data.message);
      });
  };


  if (isLoading || isDeleting) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "rounded-xl border overflow-hidden",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            <div className="flex flex-col sm:flex-row animate-pulse">
              <div
                className={clsx(
                  "sm:w-48 h-40 shrink-0",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
              <div className="flex-1 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div
                      className={clsx(
                        "h-3 w-20 rounded",
                        isDark ? "bg-gray-700" : "bg-gray-200",
                      )}
                    />
                    <div
                      className={clsx(
                        "h-5 w-48 rounded",
                        isDark ? "bg-gray-700" : "bg-gray-200",
                      )}
                    />
                    <div
                      className={clsx(
                        "h-3 w-64 rounded",
                        isDark ? "bg-gray-700" : "bg-gray-200",
                      )}
                    />
                  </div>
                  <div
                    className={clsx(
                      "h-7 w-7 rounded-md shrink-0",
                      isDark ? "bg-gray-700" : "bg-gray-200",
                    )}
                  />
                  <div
                    className={clsx(
                      "h-7 w-7 rounded-md shrink-0",
                      isDark ? "bg-gray-700" : "bg-gray-200",
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <div
                    className={clsx(
                      "h-5 w-16 rounded-full",
                      isDark ? "bg-gray-700" : "bg-gray-200",
                    )}
                  />
                  <div
                    className={clsx(
                      "h-5 w-20 rounded-full",
                      isDark ? "bg-gray-700" : "bg-gray-200",
                    )}
                  />
                  <div
                    className={clsx(
                      "h-5 w-14 rounded-full",
                      isDark ? "bg-gray-700" : "bg-gray-200",
                    )}
                  />
                  <div
                    className={clsx(
                      "h-5 w-14 rounded-full",
                      isDark ? "bg-gray-700" : "bg-gray-200",
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function handleEditSession(editSessionId: string) {
    navigate(
      `${routes.eventSessionMgmt}?eventId=${eventId}&wrapperId=${editSessionId}`,
    );
  }
  function handleDuplicateSession(editSessionId: string) {
    navigate(
      `${routes.eventSessionMgmt}?eventId=${eventId}&wrapperId=${editSessionId}&isDuplicate=true`,
    );
  }

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

  if (!sessions?.data?.length) {
    return (
      <div
        className={clsx(
          "flex flex-col items-center justify-center py-12 rounded-xl border",
          isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200",
        )}
      >
        <LayoutList
          className={clsx(
            "w-12 h-12 mb-3",
            isDark ? "text-gray-600" : "text-gray-400",
          )}
        />
        <h3
          className={clsx(
            "text-base font-semibold mb-1",
            isDark ? "text-gray-300" : "text-gray-700",
          )}
        >
          {t("event_sessions_empty_title")}
        </h3>
        <p
          className={clsx(
            "text-sm mb-5",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          {t("event_sessions_empty_desc")}
        </p>
        {eventDetails?.ticketCount !== null &&
          eventDetails?.ticketCount !== 0 && (
            <button
              onClick={() =>
                navigate(`${routes.eventSessionMgmt}?eventId=${eventId}`)
              }
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isDark
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white",
              )}
            >
              <Plus size={16} />
              {t("event_landing_page_create_btn")}
            </button>
          )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() =>
            navigate(`${routes.eventSessionMgmt}?eventId=${eventId}`)
          }
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            isDark
              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white",
          )}
        >
          <Plus size={16} />
          {t("event_landing_page_create_btn")}
        </button>
      </div>
      <div className="space-y-4">
        {sessions?.data?.map((session) => {
          const image = session.images?.[0]?.image;

          return (
            <div
              key={session._id}
              className={clsx(
                "rounded-xl border transition-all duration-200 overflow-hidden",
                isDark
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-200 hover:border-gray-300",
              )}
            >
              <div className="flex flex-col sm:flex-row">
                {image && (
                  <div className="relative sm:w-48 h-40 sm:h-auto overflow-hidden shrink-0">
                    <img
                      src={image}
                      alt={session.headline}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          "text-xs font-semibold mb-0.5",
                          isDark ? "text-gray-400" : "text-gray-500",
                        )}
                      >
                        {session.brand}
                      </p>
                      <h3
                        className={clsx(
                          "text-lg font-bold truncate",
                          isDark ? "text-white" : "text-gray-900",
                        )}
                      >
                        {session.headline}
                      </h3>
                      {session.subhead && (
                        <p
                          className={clsx(
                            "text-sm mt-0.5 line-clamp-2",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          {session.subhead}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <ActionIconButtons
                        isDark={isDark}
                        className="p-0 gap-1"
                        actions={[
                          {
                            title: t("view"),
                            icon: Eye,
                            color: "green",
                            onClick: () => handleEditSession(session._id),
                          },
                          {
                            title: t("event_sessions_edit_title"),
                            icon: Edit,
                            color: "blue",
                            onClick: () => handleEditSession(session._id),
                          },
                          {
                            title: "Duplicate",
                            icon: Copy,
                            color: "gray",
                            onClick: () => handleDuplicateSession(session._id),
                          },
                          {
                            title: "Delete",
                            icon: Trash2,
                            color: "red",
                            onClick: () => handleDeleteSession(session._id),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Layers
                        className={clsx(
                          "w-4 h-4",
                          isDark ? "text-gray-400" : "text-gray-500",
                        )}
                      />
                      <span
                        className={clsx(
                          isDark ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        {session.sessionCount}{" "}
                        {session.sessionCount === 1
                          ? t("event_sessions_count_one")
                          : t("event_sessions_count_other")}
                      </span>
                    </div>
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-full border",
                        borderColor,
                        isDark ? "text-gray-300" : "text-gray-600",
                      )}
                    >
                      {session.themeId}
                    </span>

                    <button
                      disabled={isUpdating}
                      onClick={() => handleToggleStatus(session)}
                      title={t("event_sessions_toggle_title")}
                      className={clsx(
                        "px-2 py-0.5 rounded-full text-xs font-semibold transition-opacity cursor-pointer",
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
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default EventSessionDetails;
