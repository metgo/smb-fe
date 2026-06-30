import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { Stat } from "./Stat";
import { eventSlotRows } from "../utils";
import { activeHoldCount, fmtDate, fmtTime, slotKey } from "../data";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface CapacityTabProps {
  config: IAdminConfig;
  records: IBookingRecord[];
  bookings: TBookings;
  holds: THolds;
}

export function CapacityTab({
  config,
  records,
  bookings,
  holds,
}: CapacityTabProps) {
  const { t } = useTranslation("event_session");
  const { isDark, language, textTertiary, borderColor, cardClasses } =
    useThemeClasses();

  const TH = clsx(
    "text-start py-2.25 px-3 text-[11.5px] uppercase tracking-[0.04em] border-b",
    textTertiary,
    borderColor,
  );
  const TD = clsx("py-2.75 px-3 border-b align-top", borderColor);
  const rows = eventSlotRows(config);

  const arrivedByKey: Record<string, number> = {};
  records.forEach((r) => {
    if (r.status === "ATTENDED") {
      const key = slotKey(r.eventId, r.dateId, r.slotId, r.room || "");
      arrivedByKey[key] = (arrivedByKey[key] || 0) + 1;
    }
  });

  const tot = rows.reduce(
    (a, r) => {
      const booked = bookings[r.key] || 0;
      const held = activeHoldCount(holds, r.key);
      a.cap += r.capacity;
      a.booked += booked;
      a.held += held;
      a.arrived += arrivedByKey[r.key] || 0;
      return a;
    },
    { cap: 0, booked: 0, held: 0, arrived: 0 },
  );

  return (
    <div className="flex flex-col gap-4.5 max-w-220 mx-auto">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 mb-4.5">
        <Stat label={t("stat_total_capacity")} value={tot.cap} />
        <Stat label={t("stat_registered")} value={tot.booked} />
        <Stat label={t("stat_held_now")} value={tot.held} />
        <Stat label={t("stat_attended")} value={tot.arrived} />
        <Stat
          label={t("stat_occupancy")}
          value={tot.cap ? Math.round((tot.booked / tot.cap) * 100) + "%" : "—"}
        />
      </div>
      <div className={clsx(cardClasses, "rounded-[14px] p-5")}>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
            {t("capacity_report_title")}
          </h3>
        </div>
        <p
          className={clsx(
            "text-sm leading-relaxed -mt-1.5 mb-3.5",
            textTertiary,
          )}
        >
          {t("capacity_report_help")}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px] [&>tbody>tr:last-child>td]:border-b-0">
            <thead>
              <tr>
                <th className={TH}>{t("col_session")}</th>
                <th className={TH}>{t("col_date")}</th>
                <th className={TH}>{t("col_time")}</th>
                <th className={TH}>{t("col_room")}</th>
                <th className={TH}>{t("col_capacity")}</th>
                <th className={TH}>{t("col_booked")}</th>
                <th className={TH}>{t("col_held")}</th>
                <th className={TH}>{t("col_arrived")}</th>
                <th className={TH}>{t("col_remaining")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const booked = bookings[r.key] || 0;
                const held = activeHoldCount(holds, r.key);
                const arrived = arrivedByKey[r.key] || 0;
                const remaining = Math.max(0, r.capacity - booked - held);
                const full = r.capacity - booked - held <= 0;
                return (
                  <tr key={i}>
                    <td className={TD}>{r.eventName}</td>
                    <td className={TD}>
                      {fmtDate(r.date, undefined, language)}
                    </td>
                    <td className={TD}>{fmtTime(r.time)}</td>
                    <td className={TD}>{r.room || "—"}</td>
                    <td className={TD}>{r.capacity}</td>
                    <td className={TD}>{booked}</td>
                    <td className={TD}>{held || "—"}</td>
                    <td className={TD}>{arrived || "—"}</td>
                    <td className={TD}>
                      <span
                        className={clsx(
                          "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold",
                          full
                            ? isDark
                              ? "bg-red-900/60 text-red-300"
                              : "bg-red-100 text-red-700"
                            : isDark
                              ? "bg-green-900/60 text-green-300"
                              : "bg-green-100 text-green-700",
                        )}
                      >
                        {full ? t("pill_full") : remaining}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
