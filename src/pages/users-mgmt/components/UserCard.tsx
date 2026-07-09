import clsx from "clsx";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Trash2,
  PenBox,
  RefreshCcw,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatLastLogin, getAvatarColor } from "@/helpers";
import { ActionIconButtons } from "@/components/btns";

interface UserCardProps {
  user: IUser;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
  handleLoginAttemptReset: (v: string) => void;
  isLoginAttemptReseting: boolean;
}

const UserCard = ({
  user,
  onEdit,
  onDelete,
  handleLoginAttemptReset,
  isLoginAttemptReseting,
}: UserCardProps) => {
  const { t } = useTranslation("user");
  const { t: tc } = useTranslation("common");

  const {
    cardClasses,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    isDark,
  } = useThemeClasses();
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`;
  const avatarColor = getAvatarColor(fullName);
  const phone = [user.countryCode, user.phoneNumber].filter(Boolean).join("");

  const actions: IActionIconButton[] = [
    {
      title: tc("edit"),
      icon: PenBox,
      color: "gray",
      onClick: () => onEdit(user),
    },
    {
      title: tc("delete"),
      icon: Trash2,
      color: "red",
      onClick: () => onDelete(user),
    },
  ];

  if (user.loginAttempts > 0) {
    actions.push({
      title: `${t("reset_login_attempts")}: ${user.loginAttempts}`,
      icon: isLoginAttemptReseting ? RotateCcw : RefreshCcw,
      color: "green",
      isLoading: isLoginAttemptReseting,
      onClick: () => handleLoginAttemptReset(user._id),
    });
  }

  return (
    <div
      className={clsx(
        "rounded-xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-md",
        cardClasses,
      )}
    >
      {/* Header row: avatar + name + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={clsx(
              "w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-base shrink-0",
              avatarColor,
            )}
          >
            {initials || "?"}
          </div>
          <div className="min-w-0">
            <p className={clsx("font-semibold truncate", textPrimary)}>
              {fullName}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-xs rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 capitalize">
              {user.role}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <ActionIconButtons isDark={isDark} actions={actions} />
      </div>

      {/* Contact & location */}
      <div className={clsx("space-y-2 text-sm", textSecondary)}>
        {user.email && (
          <div className="flex items-center gap-2 min-w-0">
            <Mail className={clsx("w-3.5 h-3.5 shrink-0", textTertiary)} />
            <a
              href={`mailto:${user.email}`}
              className="truncate hover:text-teal-500 transition-colors"
            >
              {user.email}
            </a>
          </div>
        )}
        {user.phoneNumber && (
          <div className="flex items-center gap-2">
            <Phone className={clsx("w-3.5 h-3.5 shrink-0", textTertiary)} />
            <a
              href={`tel:${phone}`}
              className="hover:text-teal-500 transition-colors"
            >
              {user.countryCode} {user.phoneNumber}
            </a>
          </div>
        )}
        {user.address && (
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className={clsx("w-3.5 h-3.5 shrink-0", textTertiary)} />
            <span className="truncate">{user.address}</span>
          </div>
        )}
      </div>

      {/* Last login */}
      <div
        className={clsx(
          "flex items-center gap-2 text-xs pt-3 border-t",
          textTertiary,
          borderColor,
        )}
      >
        <Clock className="w-3 h-3 shrink-0" />
        <span>
          {t("last_login")}: {formatLastLogin(user.lastLogin)}
        </span>
      </div>
    </div>
  );
};

export default UserCard;
