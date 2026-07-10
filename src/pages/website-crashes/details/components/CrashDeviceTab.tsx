import clsx from "clsx";
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
          "shrink-0 w-40 text-xs font-semibold uppercase tracking-wide",
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

export function CrashDeviceTab({ crash }: { crash: IWebsiteCrash }) {
  const { borderColor, bgSecondary } = useThemeClasses();
  const d = crash.device;

  return (
    <div
      className={clsx(
        "rounded-xl border overflow-hidden",
        borderColor,
        bgSecondary,
      )}
    >
      <div className="px-4 py-3">
        <Row
          label="Browser"
          value={
            d?.browser ? `${d.browser.name} ${d.browser.version}` : undefined
          }
        />
        <Row
          label="OS"
          value={d?.os ? `${d.os.name} ${d.os.version}` : undefined}
        />
        <Row label="Device Type" value={d?.deviceType} />
        <Row label="Platform" value={d?.platform} />
        <Row label="Language" value={d?.language} />
        <Row label="Screen Resolution" value={d?.screenResolution} />
        <Row label="Viewport Size" value={d?.viewportSize} />
        <Row
          label="Network"
          value={
            d?.network
              ? `${d.network.online ? "Online" : "Offline"} · ${d.network.connectionType}`
              : undefined
          }
        />
        <Row label="User Agent" value={d?.userAgent} mono />
      </div>
    </div>
  );
}
