import {
  UserCircle2,
  CalendarPlus,
  CalendarClock,
  Mail,
  Hash,
} from "lucide-react";
import type { FC } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatLocalDateTime } from "@/helpers/formatter";

const formatUserName = (user?: IAuditUserSummary) => {
  if (!user) return "-";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email || "-";
};

interface AuditRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  dateValue?: string;
  user?: IAuditUserSummary;
}

const AuditRow: FC<AuditRowProps> = ({
  icon,
  iconBg,
  label,
  dateValue,
  user,
}) => {
  const { isDark, language } = useThemeClasses();

  return (
    <div
      className={clsx(
        "flex items-start gap-2 md:gap-3 rounded-lg p-2 md:p-4",
        isDark ? "bg-gray-900/50" : "bg-gray-50",
      )}
    >
      <div className={clsx("p-1.5 md:p-2 rounded-lg shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            "text-xs font-semibold uppercase tracking-wide mb-0.5 md:mb-1",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {label}
        </p>
        <p
          className={clsx(
            "text-sm md:text-base font-medium truncate",
            isDark ? "text-gray-200" : "text-gray-800",
          )}
        >
          {formatLocalDateTime(dateValue, language)}
        </p>

        <div className="space-y-1 mt-2">
          <div className="flex items-center gap-1">
            <UserCircle2
              className={clsx(
                "w-3.5 h-3.5 shrink-0",
                isDark ? "text-gray-500" : "text-gray-400",
              )}
            />
            <p
              className={clsx(
                "text-xs md:text-sm truncate",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {formatUserName(user)}
            </p>
          </div>

          {user?.email && (
            <div className="flex items-center gap-1">
              <Mail
                className={clsx(
                  "w-3.5 h-3.5 shrink-0",
                  isDark ? "text-gray-500" : "text-gray-400",
                )}
              />
              <p
                className={clsx(
                  "text-xs md:text-sm truncate",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              >
                {user.email}
              </p>
            </div>
          )}

          {user?._id && (
            <div className="flex items-center gap-1">
              <Hash
                className={clsx(
                  "w-3.5 h-3.5 shrink-0",
                  isDark ? "text-gray-500" : "text-gray-400",
                )}
              />
              <p
                className={clsx(
                  "text-xs font-mono truncate",
                  isDark ? "text-gray-300" : "text-gray-500",
                )}
                title={user._id}
              >
                {user._id}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AuditInfoDetails = ({
  createdAt,
  createdBy,
  updatedAt,
  updatedBy,
}: IAuditInfo) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 md:p-6 transition-all duration-200",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      <h3
        className={clsx(
          "text-xs md:text-sm font-semibold uppercase tracking-wide mb-2 md:mb-4",
          isDark ? "text-gray-400" : "text-gray-600",
        )}
      >
        {t("audit_info", "Audit Information")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <AuditRow
          icon={
            <CalendarPlus
              className={clsx(
                "w-4 h-4 md:w-5 md:h-5",
                isDark ? "text-blue-400" : "text-blue-600",
              )}
            />
          }
          iconBg={isDark ? "bg-blue-500/20" : "bg-blue-100"}
          label={t("created", "Created")}
          dateValue={createdAt}
          user={createdBy}
        />

        <AuditRow
          icon={
            <CalendarClock
              className={clsx(
                "w-4 h-4 md:w-5 md:h-5",
                isDark ? "text-purple-400" : "text-purple-600",
              )}
            />
          }
          iconBg={isDark ? "bg-purple-500/20" : "bg-purple-100"}
          label={t("updated", "Updated")}
          dateValue={updatedAt}
          user={updatedBy}
        />
      </div>
    </div>
  );
};

export default AuditInfoDetails;
