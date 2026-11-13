import clsx from "clsx";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  X,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatDate } from "@/helpers";
import type { IWebsiteCrash } from "@/store/api/websiteCrashApi";

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
}) {
  const { textPrimary, textTertiary } = useThemeClasses();
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className={clsx("text-xs font-medium", textTertiary)}>{label}</span>
      <span
        className={clsx(
          "text-sm break-all",
          textPrimary,
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { isDark, borderColor, bgSecondary, textPrimary } = useThemeClasses();
  const [open, setOpen] = useState(true);
  return (
    <div className={clsx("rounded-xl border overflow-hidden", borderColor)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-full flex items-center justify-between px-4 py-3 text-sm font-semibold",
          textPrimary,
          isDark ? "bg-gray-800/60" : "bg-gray-50",
        )}
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0" />
        )}
      </button>
      {open && (
        <div className={clsx("px-4 py-4 grid gap-3", bgSecondary)}>
          {children}
        </div>
      )}
    </div>
  );
}

export function CrashDetailDrawer({
  crash,
  onClose,
  onDelete,
  deleting,
}: {
  crash: IWebsiteCrash;
  onClose: () => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const { isDark, bgPrimary, textPrimary, textSecondary, borderColor } =
    useThemeClasses();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          "fixed top-0 z-50 h-full w-full max-w-xl flex flex-col shadow-2xl ltr:right-0 rtl:left-0",
          bgPrimary,
        )}
      >
        {/* Header */}
        <div
          className={clsx(
            "shrink-0 flex items-center justify-between px-5 py-4 border-b",
            borderColor,
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className={clsx("font-semibold text-base", textPrimary)}>
              Crash Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(crash._id)}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
            <button
              onClick={onClose}
              className={clsx(
                "p-1.5 rounded-lg transition cursor-pointer",
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100",
              )}
            >
              <X className={clsx("w-5 h-5", textSecondary)} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {/* Meta */}
          <div
            className={clsx(
              "flex flex-wrap gap-x-6 gap-y-1 text-xs",
              textSecondary,
            )}
          >
            <span>
              <Clock className="w-3 h-3 inline mr-1" />
              {formatDate(crash.timestamp)}
            </span>
            {crash.timezone && <span>{crash.timezone}</span>}
            <span>ID: {crash._id}</span>
          </div>

          {/* Error */}
          <Section title="Error">
            <DetailRow label="Name" value={crash.error?.name} />
            <DetailRow label="Message" value={crash.error?.message} />
            {crash.error?.status && (
              <DetailRow label="HTTP Status" value={crash.error.status} />
            )}
            <DetailRow label="URL" value={crash.error?.url} mono />
            {crash.error?.referrer && (
              <DetailRow label="Referrer" value={crash.error.referrer} mono />
            )}
          </Section>

          {/* Stack Trace */}
          {crash.error?.stack && (
            <Section title="Stack Trace">
              <pre
                className={clsx(
                  "text-xs font-mono whitespace-pre-wrap break-all leading-relaxed",
                  isDark ? "text-red-300" : "text-red-700",
                )}
              >
                {crash.error.stack}
              </pre>
            </Section>
          )}

          {/* User */}
          <Section title="User">
            {crash.user ? (
              <>
                <DetailRow label="ID" value={crash.user._id} mono />
                <DetailRow label="Name" value={crash.user.name} />
                <DetailRow label="Email" value={crash.user.email} />
              </>
            ) : (
              <span className={clsx("text-sm", textSecondary)}>
                Not logged in
              </span>
            )}
          </Section>

          {/* Device */}
          <Section title="Device & Browser">
            <DetailRow
              label="Browser"
              value={
                crash.device?.browser
                  ? `${crash.device.browser.name} ${crash.device.browser.version}`
                  : undefined
              }
            />
            <DetailRow
              label="OS"
              value={
                crash.device?.os
                  ? `${crash.device.os.name} ${crash.device.os.version}`
                  : undefined
              }
            />
            <DetailRow label="Device Type" value={crash.device?.deviceType} />
            <DetailRow label="Platform" value={crash.device?.platform} />
            <DetailRow label="Language" value={crash.device?.language} />
            <DetailRow
              label="Screen Resolution"
              value={crash.device?.screenResolution}
            />
            <DetailRow
              label="Viewport Size"
              value={crash.device?.viewportSize}
            />
            <DetailRow
              label="Network"
              value={
                crash.device?.network
                  ? `${crash.device.network.online ? "Online" : "Offline"} · ${crash.device.network.connectionType}`
                  : undefined
              }
            />
            <DetailRow
              label="User Agent"
              value={crash.device?.userAgent}
              mono
            />
          </Section>
        </div>
      </div>
    </>,
    document.body,
  );
}
