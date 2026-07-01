import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { Stat } from "./Stat";
import { eventSlotRows } from "../utils";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface AnalyticsTabProps {
  config: IAdminConfig;
  records: IBookingRecord[];
  bookings: TBookings;
}

export function AnalyticsTab({ config, records, bookings }: AnalyticsTabProps) {
  const { t } = useTranslation("event_session");
  const { isDark, textTertiary, cardClasses } = useThemeClasses();

  const CARD = clsx(cardClasses, "rounded-[14px] p-5");

  const rows = eventSlotRows(config);

  const cap = rows.reduce((a, r) => a + r.capacity, 0);
  const booked = rows.reduce((a, r) => a + (bookings[r.key] || 0), 0);
  const attended = records.filter((r) => r.status === "ATTENDED").length;
  const confirmed = records.length;
  const noShow = confirmed
    ? Math.round(((confirmed - attended) / confirmed) * 100)
    : 0;

  const perEvent: Record<string, number> = {};
  records.forEach((r) => {
    perEvent[r.eventName] = (perEvent[r.eventName] || 0) + 1;
  });
  const maxEv = Math.max(1, ...Object.values(perEvent));

  return (
    <div className="flex flex-col gap-4.5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 mb-4.5">
        <Stat label={t("stat_total_regs")} value={confirmed} />
        <Stat label={t("stat_actual_attended")} value={attended} />
        <Stat label={t("stat_no_show_rate")} value={noShow + "%"} />
        <Stat
          label={t("stat_total_occupancy")}
          value={cap ? Math.round((booked / cap) * 100) + "%" : "—"}
        />
      </div>

      <div className={CARD}>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
            {t("regs_by_session_title")}
          </h3>
        </div>
        {Object.keys(perEvent).length === 0 ? (
          <p className={clsx("text-sm leading-relaxed", textTertiary)}>
            {t("no_analytics_data")}
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {Object.entries(perEvent).map(([name, n]) => (
              <div
                key={name}
                className="grid grid-cols-[160px_1fr_44px] max-[560px]:grid-cols-[110px_1fr_40px] gap-3 items-center"
              >
                <span className="text-[13.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                  {name}
                </span>
                <span
                  className={clsx(
                    "h-3 rounded-full overflow-hidden",
                    isDark ? "bg-gray-700" : "bg-gray-100",
                  )}
                >
                  <span
                    className={clsx(
                      "block h-full rounded-full",
                      isDark ? "bg-blue-500" : "bg-blue-600",
                    )}
                    style={{ width: (n / maxEv) * 100 + "%" }}
                  />
                </span>
                <span className="text-sm font-bold text-start tabular-nums">
                  {n}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={CARD}>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
            {t("occupancy_by_session_title")}
          </h3>
        </div>
        <div className="flex flex-col gap-2.5">
          {config.sessions
            .map((e, i) => ({ ...e, idx: String(i) }))
            .filter((e) => config.liveEventIds.includes(e.idx))
            .map((e) => {
              const er = rows.filter((r) => r.eventId === e.idx);
              const ecap = er.reduce((a, r) => a + r.capacity, 0);
              const eb = er.reduce((a, r) => a + (bookings[r.key] || 0), 0);
              const pct = ecap ? Math.round((eb / ecap) * 100) : 0;
              return (
                <div
                  key={e.idx}
                  className="grid grid-cols-[160px_1fr_44px] max-[560px]:grid-cols-[110px_1fr_40px] gap-3 items-center"
                >
                  <span className="text-[13.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                    {e.name}
                  </span>
                  <span
                    className={clsx(
                      "h-3 rounded-full overflow-hidden",
                      isDark ? "bg-gray-700" : "bg-gray-100",
                    )}
                  >
                    <span
                      className={clsx(
                        "block h-full rounded-full",
                        isDark ? "bg-teal-400" : "bg-teal-500",
                      )}
                      style={{ width: pct + "%" }}
                    />
                  </span>
                  <span className="text-sm font-bold text-start tabular-nums">
                    {pct}%
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
