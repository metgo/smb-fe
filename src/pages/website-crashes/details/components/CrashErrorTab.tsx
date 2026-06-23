import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { IWebsiteCrash } from "@/store/api/websiteCrashApi";

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
}) {
  const { isDark, borderColor, textPrimary, textSecondary } = useThemeClasses();
  if (!value && value !== 0) return null;
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
        className={clsx(
          "text-sm break-all",
          textPrimary,
          mono && "font-mono",
          !mono && textSecondary,
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function CrashErrorTab({ crash }: { crash: IWebsiteCrash }) {
  const { isDark, borderColor, bgSecondary } = useThemeClasses();
  return (
    <div className="flex flex-col gap-4">
      <div
        className={clsx(
          "rounded-xl border divide-y overflow-hidden",
          borderColor,
          bgSecondary,
          isDark ? "divide-gray-700" : "divide-gray-100",
        )}
      >
        <div className="px-4 py-3">
          <Row label="Name" value={crash.error?.name} />
          <Row label="Message" value={crash.error?.message} />
          {crash.error?.status && (
            <Row label="HTTP Status" value={crash.error.status} />
          )}
          <Row label="URL" value={crash.error?.url} mono />
          {crash.error?.referrer && (
            <Row label="Referrer" value={crash.error.referrer} mono />
          )}
        </div>
      </div>
    </div>
  );
}
