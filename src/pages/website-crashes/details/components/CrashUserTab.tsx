import clsx from "clsx";
import { UserX } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { IWebsiteCrash } from "@/store/api/websiteCrashApi";

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  const { isDark, borderColor, textPrimary } = useThemeClasses();
  if (!value) return null;
  return (
    <div
      className={clsx(
        "flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b last:border-0",
        borderColor,
      )}
    >
      <span
        className={clsx(
          "shrink-0 w-36 text-xs font-semibold uppercase tracking-wide",
          isDark ? "text-gray-400" : "text-gray-500",
        )}
      >
        {label}
      </span>
      <span
        className={clsx("text-sm break-all", textPrimary, mono && "font-mono")}
      >
        {value}
      </span>
    </div>
  );
}

export function CrashUserTab({ crash }: { crash: IWebsiteCrash }) {
  const { borderColor, bgSecondary, textSecondary } = useThemeClasses();

  if (!crash.user) {
    return (
      <div
        className={clsx(
          "flex flex-col items-center justify-center py-16 rounded-xl border gap-3",
          borderColor,
          bgSecondary,
        )}
      >
        <UserX className={clsx("w-10 h-10", textSecondary)} />
        <p className={clsx("text-sm font-medium", textSecondary)}>
          No user — guest session
        </p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "rounded-xl border overflow-hidden",
        borderColor,
        bgSecondary,
      )}
    >
      <div className="px-4 py-3">
        <Row label="ID" value={crash.user._id} mono />
        <Row label="Name" value={crash.user.name} />
        <Row label="Email" value={crash.user.email} />
      </div>
    </div>
  );
}
