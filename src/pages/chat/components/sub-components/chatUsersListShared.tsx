import clsx from "clsx";
import {
  Crown,
  Landmark,
  MapPin,
  Backpack,
  type LucideIcon,
} from "lucide-react";

export const CHAT_USERS_PAGE_LIMIT = 20;

// Role-specific pill colors used across the conversations/contacts lists
export const getRoleBadgeClasses = (
  isDark: boolean,
): Record<TUserRole, string> => ({
  superadmin: isDark
    ? "bg-purple-900/30 text-purple-400"
    : "bg-purple-50 text-purple-700",
  authority: isDark
    ? "bg-amber-900/30 text-amber-400"
    : "bg-amber-50 text-amber-700",
  dmo: isDark ? "bg-teal-900/30 text-teal-400" : "bg-teal-50 text-teal-700",
  traveller: isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600",
});

// Role-specific icon shown alongside the role label/pill
export const roleIcons: Record<TUserRole, LucideIcon> = {
  superadmin: Crown,
  authority: Landmark,
  dmo: MapPin,
  traveller: Backpack,
};

// "Online" / "Last seen <relative time>" / nothing (never connected)
export const getPresenceLabel = (
  presence: Record<string, IPresenceEntry>,
  t: (key: string, opts?: Record<string, unknown>) => string,
  timeAgo: (iso: string) => string,
  userId?: string,
): string | null => {
  if (!userId) return null;
  const entry = presence[userId];
  if (!entry) return null;
  if (entry.isOnline) return t("online_status");
  if (!entry.lastActiveAt) return null;
  return t("last_seen", { time: timeAgo(entry.lastActiveAt) });
};

export const ChatUserRowSkeleton = ({
  borderColor,
  isDark,
}: {
  borderColor: string;
  isDark: boolean;
}) => (
  <div className="px-4 py-3 flex items-center gap-3 animate-pulse">
    <div
      className={clsx(
        "w-8 h-8 rounded-full border shrink-0",
        borderColor,
        isDark ? "bg-gray-800" : "bg-gray-200",
      )}
    />
    <div className="flex-1 min-w-0 space-y-2">
      <div
        className={clsx(
          "h-3 rounded-full w-2/5",
          isDark ? "bg-gray-800" : "bg-gray-200",
        )}
      />
      <div
        className={clsx(
          "h-2.5 rounded-full w-3/5",
          isDark ? "bg-gray-800" : "bg-gray-200",
        )}
      />
    </div>
  </div>
);
