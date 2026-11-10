import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import type {
  IScoreConfig,
  IScoreRun,
  ScheduleState,
} from "@/store/api/businessScoreApi";

const STATE_STYLE: Record<ScheduleState, { light: string; dark: string }> = {
  active: {
    light: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dark: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  },
  manual: {
    light: "bg-gray-100 text-gray-700 border-gray-300",
    dark: "bg-gray-700/60 text-gray-200 border-gray-500",
  },
  notStarted: {
    light: "bg-sky-100 text-sky-800 border-sky-300",
    dark: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  },
  ended: {
    light: "bg-amber-100 text-amber-800 border-amber-300",
    dark: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  },
};

interface ScoreStatusBannerProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  status: IScoreConfig["status"];
  formatSlot: (slot: string | null) => string;
  formatDateTime: (value: string) => string;
  runResult: (run: IScoreRun) => {
    text: string;
    tone: "good" | "warn" | "bad";
  };
}

const ScoreStatusBanner = ({
  t,
  status,
  formatSlot,
  formatDateTime,
  runResult,
}: ScoreStatusBannerProps) => {
  const { isDark } = useThemeClasses();
  const stateStyle = STATE_STYLE[status.state];

  return (
    <div
      className={clsx(
        "rounded-xl border p-4 flex flex-wrap items-center gap-x-6 gap-y-2",
        isDark ? stateStyle.dark : stateStyle.light,
      )}
      role="status"
    >
      <div className="flex items-center gap-2 font-semibold">
        <span
          className={clsx(
            "inline-block w-2.5 h-2.5 rounded-full",
            status.state === "active" ? "bg-emerald-500" : "bg-current",
          )}
        />
        {t(`state_${status.state}`)}
      </div>
      <div className="text-sm">
        {t("next_run")}: <b>{formatSlot(status.nextRun)}</b>
      </div>
      <div className="text-sm">
        {t("last_run")}:{" "}
        <b>
          {status.lastRun
            ? `${formatDateTime(status.lastRun.startedAt)} · ${runResult(status.lastRun).text}`
            : t("never")}
        </b>
      </div>
      <div className="text-xs opacity-80 ms-auto">{t("times_in_israel")}</div>
    </div>
  );
};

export default ScoreStatusBanner;
