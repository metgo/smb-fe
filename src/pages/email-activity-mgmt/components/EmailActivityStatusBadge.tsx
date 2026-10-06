import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface EmailActivityStatusBadgeProps {
  status: EmailActivityStatus;
}

const STATUS_COLORS: Record<
  EmailActivityStatus,
  { light: string; dark: string }
> = {
  delivered: {
    light: "bg-green-100 text-green-700",
    dark: "bg-green-900/30 text-green-100",
  },
  opened: {
    light: "bg-green-100 text-green-700",
    dark: "bg-green-900/30 text-green-100",
  },
  clicked: {
    light: "bg-green-100 text-green-700",
    dark: "bg-green-900/30 text-green-100",
  },
  bounced: {
    light: "bg-red-100 text-red-700",
    dark: "bg-red-900/30 text-red-100",
  },
  rejected: {
    light: "bg-red-100 text-red-700",
    dark: "bg-red-900/30 text-red-100",
  },
  deferred: {
    light: "bg-amber-100 text-amber-700",
    dark: "bg-amber-900/30 text-amber-100",
  },
  spam: {
    light: "bg-amber-100 text-amber-700",
    dark: "bg-amber-900/30 text-amber-100",
  },
  unsub: {
    light: "bg-amber-100 text-amber-700",
    dark: "bg-amber-900/30 text-amber-100",
  },
  sent: {
    light: "bg-gray-100 text-gray-700",
    dark: "bg-gray-800 text-gray-300",
  },
};

const EmailActivityStatusBadge = ({
  status,
}: EmailActivityStatusBadgeProps) => {
  const { t } = useTranslation("email_activity");
  const { isDark } = useThemeClasses();
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.sent;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? colors.dark : colors.light}`}
    >
      {t(`status_${status}`)}
    </span>
  );
};

export default EmailActivityStatusBadge;
