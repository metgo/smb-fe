import clsx from "clsx";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";

import { Stat } from "./Stat";
import { fmtDate, fmtTime, slotKey } from "../data";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetCapacityReportQuery } from "@/store/api/eventSessionApi";

const SKELETON_ROWS = 6;
const SKELETON_COLS = 6;

interface ISlotRow {
  id: number;
  eventName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  room: string;
  capacity: number;
  registered: number;
  held: number;
  attended: number;
  remaining: number;
  occupancy: number;
  key: string;
}

interface CapacityTabProps {
  wrapperId: string;
}

export function CapacityTab({ wrapperId }: CapacityTabProps) {
  const { t } = useTranslation("event_session");
  const { isDark, language, textTertiary, borderColor, cardClasses } =
    useThemeClasses();

  const { data, isFetching, isLoading } = useGetCapacityReportQuery(
    wrapperId ? wrapperId : skipToken,
  );
  const details = data?.data?.details || [];
  const summary = data?.data?.summary;

  const TH = clsx(
    "text-start py-2.25 px-3 text-[11.5px] uppercase tracking-[0.04em] border-b",
    textTertiary,
    borderColor,
  );
  const TD = clsx("py-2.75 px-3 border-b align-top", borderColor);

  // Assuming:
  // const details: EventCapacityDetail[] = response.data.details;

  const rows: ISlotRow[] = details.map((item, index) => ({
    id: index,
    eventName: item.session,
    date: item.date,
    time: item.time,
    room: item.room,
    capacity: item.capacity,
    registered: item.registered,
    held: item.held,
    attended: item.attended,
    remaining: item.remaining,
    occupancy: item.occupancy,

    // Unique key for each slot
    key: slotKey(item.session, item.date, item.time, item.room),
  }));
  // Group rows by Session + Date
  const groups: {
    eventName: string;
    date: string;
    rows: ISlotRow[];
  }[] = [];

  rows.forEach((row) => {
    const last = groups[groups.length - 1];

    if (last && last.eventName === row.eventName && last.date === row.date) {
      last.rows.push(row);
    } else {
      groups.push({
        eventName: row.eventName,
        date: row.date,
        rows: [row],
      });
    }
  });
  // Optional: Create lookup by slot key if other parts of the code still use it.
  const arrivedByKey: Record<string, number> = {};

  details.forEach((item) => {
    const key = slotKey(item.session, item.date, item.time, item.room);

    arrivedByKey[key] = item.attended;
  });

  const isInitialLoading = isFetching || isLoading;

  return (
    <div>
      <div className="flex flex-col gap-4.5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 mb-4.5">
          <Stat
            label={t("stat_total_capacity")}
            value={summary?.totalCapacity || 0}
          />
          <Stat
            label={t("stat_registered")}
            value={summary?.totalRegistered || 0}
          />
          <Stat label={t("stat_held_now")} value={summary?.totalHeld || 0} />
          <Stat
            label={t("stat_attended")}
            value={summary?.totalAttended || 0}
          />
          <Stat
            label={t("stat_occupancy")}
            value={
              summary?.totalOccupancy ? summary?.totalOccupancy + "%" : "—"
            }
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
                  <th className={TH}>{t("col_time")}</th>
                  <th className={TH}>{t("col_room")}</th>
                  <th className={TH}>{t("col_booked")}</th>
                  <th className={TH}>{t("col_held")}</th>
                  <th className={TH}>{t("col_arrived")}</th>
                  <th className={TH}>{t("col_remaining")}</th>
                </tr>
              </thead>
              <tbody>
                {isInitialLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, row) => (
                      <tr key={row} className="animate-pulse">
                        {Array.from({ length: SKELETON_COLS }).map((_, col) => (
                          <td key={col} className={TD}>
                            <div
                              className={clsx(
                                "h-4 rounded",
                                isDark ? "bg-gray-700" : "bg-gray-200",
                              )}
                              style={{
                                width: `${55 + Math.random() * 35}%`,
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  : groups.map((g, gi) => (
                      <Fragment key={gi}>
                        <tr>
                          <td
                            colSpan={6}
                            className={clsx(
                              "py-2 px-3 text-[12.5px] font-bold border-b",
                              isDark ? "bg-gray-800/60" : "bg-gray-50",
                              borderColor,
                            )}
                          >
                            {g.eventName} ·{" "}
                            {fmtDate(g.date, undefined, language)}
                          </td>
                        </tr>
                        {g.rows.map((r, i) => {
                          return (
                            <tr key={i}>
                              <td className={TD}>{fmtTime(r.time)}</td>
                              <td className={TD}>{r.room || "—"}</td>
                              <td className={TD}>{r.registered}</td>
                              <td className={TD}>{r.held || "—"}</td>
                              <td className={TD}>{r.attended || "—"}</td>
                              <td className={TD}>
                                <span
                                  className={clsx(
                                    "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold",
                                    r.remaining === 0
                                      ? isDark
                                        ? "bg-red-900/60 text-red-300"
                                        : "bg-red-100 text-red-700"
                                      : isDark
                                        ? "bg-green-900/60 text-green-300"
                                        : "bg-green-100 text-green-700",
                                  )}
                                >
                                  {r.remaining === 0
                                    ? t("pill_full")
                                    : t("remaining_of_capacity", {
                                        remaining: r.remaining,
                                        capacity: r.capacity,
                                      })}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </Fragment>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
