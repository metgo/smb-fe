import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import {
  Bell,
  Mail,
  MessageSquare,
  Clock,
  Globe,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Send,
} from "lucide-react";

interface ScheduledNotification {
  _id: string;
  sendHoursBefore: number;
  channels: string[];
  language: string;
  template: string;
  customTemplate?: {
    subject: string;
    body: string;
  };
  status: string;
  createdAt: string;
  updatedAt?: string | null;
}

interface EventScheduledNotificationDetailsProps {
  t: (key: string) => string;
  scheduledNotificationId: ScheduledNotification[];
}

const EventScheduledNotificationDetails: React.FC<
  EventScheduledNotificationDetailsProps
> = ({ scheduledNotificationId }) => {
  const { isDark } = useThemeClasses();

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "EMAIL":
        return <Mail className="w-4 h-4" />;
      case "SMS":
        return <MessageSquare className="w-4 h-4" />;
      case "WHATSAPP":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "EMAIL":
        return isDark
          ? "bg-blue-500/20 text-blue-400 border-blue-800/50"
          : "bg-blue-100 text-blue-700 border-blue-200";
      case "SMS":
        return isDark
          ? "bg-green-500/20 text-green-400 border-green-800/50"
          : "bg-green-100 text-green-700 border-green-200";
      case "WHATSAPP":
        return isDark
          ? "bg-emerald-500/20 text-emerald-400 border-emerald-800/50"
          : "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return isDark
          ? "bg-gray-700 text-gray-300 border-gray-600"
          : "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatTimeBeforeEvent = (hours: number) => {
    if (hours < 1) {
      return `${hours * 60} minutes before`;
    } else if (hours === 1) {
      return "1 hour before";
    } else if (hours < 24) {
      return `${hours} hours before`;
    } else if (hours === 24) {
      return "1 day before";
    } else {
      const days = Math.floor(hours / 24);
      return `${days} ${days === 1 ? "day" : "days"} before`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sort notifications by sendHoursBefore (descending)
  const sortedNotifications = [...scheduledNotificationId].sort(
    (a, b) => b.sendHoursBefore - a.sendHoursBefore,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className={clsx(
            "text-2xl font-bold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          Scheduled Notifications
        </h2>
        <p
          className={clsx(
            "text-sm mt-1",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {scheduledNotificationId.length}{" "}
          {scheduledNotificationId.length === 1
            ? "notification"
            : "notifications"}{" "}
          scheduled for this event
        </p>
      </div>

      {/* Notifications List */}
      {sortedNotifications.length > 0 ? (
        <div className="space-y-4">
          {sortedNotifications.map((notification, index) => (
            <div
              key={notification._id}
              className={clsx(
                "rounded-xl border transition-all duration-200",
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200",
              )}
            >
              {/* Header */}
              <div
                className={clsx(
                  "p-5 border-b flex items-start justify-between",
                  isDark ? "border-gray-700" : "border-gray-200",
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={clsx(
                      "p-3 rounded-lg",
                      isDark ? "bg-purple-500/20" : "bg-purple-100",
                    )}
                  >
                    <Bell
                      className={clsx(
                        "w-6 h-6",
                        isDark ? "text-purple-400" : "text-purple-600",
                      )}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className={clsx(
                          "text-lg font-semibold",
                          isDark ? "text-white" : "text-gray-900",
                        )}
                      >
                        Notification #{index + 1}
                      </h3>

                      <span
                        className={clsx(
                          "px-2.5 py-1 rounded-full text-xs font-medium",
                          notification.status === "ACTIVE"
                            ? isDark
                              ? "bg-green-500/20 text-green-400"
                              : "bg-green-100 text-green-700"
                            : isDark
                              ? "bg-gray-700 text-gray-400"
                              : "bg-gray-200 text-gray-600",
                        )}
                      >
                        {notification.status === "ACTIVE" ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock
                        className={clsx(
                          "w-4 h-4",
                          isDark ? "text-gray-400" : "text-gray-500",
                        )}
                      />
                      <span
                        className={clsx(
                          "font-medium",
                          isDark ? "text-gray-300" : "text-gray-700",
                        )}
                      >
                        Sent{" "}
                        {formatTimeBeforeEvent(notification.sendHoursBefore)}{" "}
                        event
                      </span>
                    </div>
                  </div>
                </div>

                {/* Template Type Badge */}
                <div
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-medium",
                    isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-700",
                  )}
                >
                  {notification.template === "custom"
                    ? "Custom Template"
                    : "Default Template"}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Channels */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Send
                      className={clsx(
                        "w-4 h-4",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    />
                    <h4
                      className={clsx(
                        "text-sm font-semibold uppercase tracking-wide",
                        isDark ? "text-gray-400" : "text-gray-600",
                      )}
                    >
                      Delivery Channels
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {notification.channels.map((channel) => (
                      <span
                        key={channel}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium border transition-all duration-200 hover:scale-105",
                          getChannelColor(channel),
                        )}
                      >
                        {getChannelIcon(channel)}
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="flex items-center gap-3">
                  <Globe
                    className={clsx(
                      "w-4 h-4",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  />
                  <span
                    className={clsx(
                      "text-sm",
                      isDark ? "text-gray-300" : "text-gray-700",
                    )}
                  >
                    Language:{" "}
                    <span className="font-medium uppercase">
                      {notification.language}
                    </span>
                  </span>
                </div>

                {/* Custom Template Content */}
                {notification.customTemplate && (
                  <div
                    className={clsx(
                      "rounded-lg border p-4 space-y-3",
                      isDark
                        ? "bg-gray-900/50 border-gray-700"
                        : "bg-gray-50 border-gray-200",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText
                        className={clsx(
                          "w-4 h-4",
                          isDark ? "text-gray-400" : "text-gray-500",
                        )}
                      />
                      <h4
                        className={clsx(
                          "text-sm font-semibold uppercase tracking-wide",
                          isDark ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        Message Template
                      </h4>
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        className={clsx(
                          "text-xs font-medium uppercase tracking-wide mb-1 block",
                          isDark ? "text-gray-500" : "text-gray-600",
                        )}
                      >
                        Subject
                      </label>
                      <p
                        className={clsx(
                          "text-sm font-medium",
                          isDark ? "text-gray-200" : "text-gray-800",
                        )}
                      >
                        {notification.customTemplate.subject}
                      </p>
                    </div>

                    {/* Body */}
                    <div>
                      <label
                        className={clsx(
                          "text-xs font-medium uppercase tracking-wide mb-1 block",
                          isDark ? "text-gray-500" : "text-gray-600",
                        )}
                      >
                        Body
                      </label>
                      <div
                        className={clsx(
                          "text-sm leading-relaxed prose prose-sm max-w-none",
                          isDark
                            ? "prose-invert text-gray-300"
                            : "text-gray-700",
                        )}
                        dangerouslySetInnerHTML={{
                          __html: notification.customTemplate.body,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div
                  className={clsx(
                    "pt-3 border-t flex flex-wrap gap-4 text-xs",
                    isDark
                      ? "border-gray-700 text-gray-400"
                      : "border-gray-200 text-gray-500",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created: {formatDate(notification.createdAt)}</span>
                  </div>
                  {notification.updatedAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Updated: {formatDate(notification.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className={clsx(
            "rounded-xl border p-12 text-center",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200",
          )}
        >
          <Bell
            className={clsx(
              "w-12 h-12 mx-auto mb-3",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          />
          <h3
            className={clsx(
              "text-base font-semibold mb-1",
              isDark ? "text-gray-300" : "text-gray-700",
            )}
          >
            No Scheduled Notifications
          </h3>
          <p
            className={clsx(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            No notifications have been scheduled for this event yet
          </p>
        </div>
      )}
    </div>
  );
};

export default EventScheduledNotificationDetails;
