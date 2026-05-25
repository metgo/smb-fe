import React, { useMemo } from "react";
import {
  Clock,
  CalendarCheck,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface OperatingHour {
  day?: string;
  days?: string;
  open?: string;
  close?: string;
  isHoliday?: boolean;
}

interface Props {
  isDark: boolean;
  business: {
    openingHrs: OperatingHour[];
  };
  showCurrentTime?: boolean;
  timezone?: string;
}

const dayOrder = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const dayFullKey: Record<string, string> = {
  SUN: "sunday",
  MON: "monday",
  TUE: "tuesday",
  WED: "wednesday",
  THU: "thursday",
  FRI: "friday",
  SAT: "saturday",
};

const normalizeDay = (value?: string): string | null => {
  if (!value) return null;

  const map: Record<string, string> = {
    sun: "SUN",
    mon: "MON",
    tue: "TUE",
    tues: "TUE",
    wed: "WED",
    thu: "THU",
    thurs: "THU",
    fri: "FRI",
    sat: "SAT",
  };

  return map[value.toLowerCase().trim()] || null;
};

const formatTime = (time?: string) => {
  if (!time || time === "00:00") return "";
  const [h, m] = time.split(":").map(Number);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const isCurrentlyOpen = (open?: string, close?: string, timezone?: string) => {
  if (!open || !close || open === "00:00" || close === "00:00") return false;

  const now = timezone
    ? new Date(new Date().toLocaleString("en-US", { timeZone: timezone }))
    : new Date();

  const current = now.getHours() * 60 + now.getMinutes();

  const [oH, oM] = open.split(":").map(Number);
  const [cH, cM] = close.split(":").map(Number);

  const openMin = oH * 60 + oM;
  const closeMin = cH * 60 + cM;

  if (closeMin < openMin) {
    return current >= openMin || current <= closeMin;
  }

  return current >= openMin && current <= closeMin;
};

const BusinessOpeningHoursDetails: React.FC<Props> = ({
  isDark,
  business,
  showCurrentTime = true,
  timezone,
}) => {
  const { t } = useTranslation("common");
  const openingHrs = business?.openingHrs || [];

  const normalizedHours = useMemo(() => {
    return dayOrder.map((day) => {
      const entry = openingHrs.find(
        (e) => normalizeDay(e.day || e.days) === day,
      );
      return { day, entry };
    });
  }, [openingHrs]);

  const todayKey = dayOrder[new Date().getDay()];

  const currentTimeDisplay = useMemo(() => {
    try {
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timezone,
      });
    } catch {
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }, [timezone]);

  /* ---------------- Empty State ---------------- */

  if (!openingHrs.length) {
    return (
      <div
        className={`p-6 rounded-xl border text-center ${
          isDark
            ? "bg-gray-800 border-gray-700 text-gray-400"
            : "bg-gray-50 border-gray-200 text-gray-500"
        }`}
      >
        <CalendarCheck
          className={`w-8 h-8 mx-auto mb-3 ${
            isDark ? "text-gray-600" : "text-gray-400"
          }`}
        />
        <p className="font-medium">{t("no_schedule_available")}</p>
        <small>{t("not_set_opening_hours")}</small>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2
          className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          <Clock
            className={`w-5 h-5 ${isDark ? "text-teal-400" : "text-teal-600"}`}
          />
          {t("weekly_schedule")}
        </h2>

        {showCurrentTime && (
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"
            }`}
          >
            {currentTimeDisplay}
          </span>
        )}
      </div>

      {/* Days */}
      <div className="space-y-2">
        {normalizedHours.map(({ day, entry }) => {
          const isToday = day === todayKey;

          let Icon = AlertCircle;
          let color = isDark ? "text-gray-400" : "text-gray-500";
          let bg = isDark ? "bg-gray-800/50" : "bg-white";
          let border = isDark ? "border-gray-700" : "border-gray-200";
          let content: React.ReactNode = t("not_set");

          if (entry) {
            if (entry.isHoliday) {
              Icon = CalendarCheck;
              color = isDark ? "text-amber-400" : "text-amber-600";
              bg = isDark ? "bg-amber-900/20" : "bg-amber-50";
              border = isDark ? "border-amber-800" : "border-amber-200";
              content = t("holiday");
            } else if (!entry.open || entry.open === "00:00") {
              Icon = XCircle;
              color = isDark ? "text-red-400" : "text-red-600";
              content = t("closed");
            } else {
              Icon = CheckCircle2;
              color = isDark ? "text-green-400" : "text-green-600";
              bg = isDark ? "bg-green-900/10" : "bg-green-50";
              border = isDark ? "border-green-800/40" : "border-green-200";

              const baseTime = `${formatTime(entry.open)} – ${formatTime(
                entry.close,
              )}`;

              const showOpenNow =
                isToday &&
                showCurrentTime &&
                isCurrentlyOpen(entry.open, entry.close, timezone);

              content = showOpenNow ? (
                <span className="flex items-center gap-2">
                  {baseTime}
                  <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">
                    {t("open_now")}
                  </span>
                </span>
              ) : (
                baseTime
              );
            }
          }

          return (
            <div
              key={day}
              className={`
                flex justify-between items-center p-2 sm:p-4 rounded-xl border transition
                ${bg} ${border}
                ${
                  isToday
                    ? `ring-2 ${
                        isDark ? "ring-teal-500/40" : "ring-teal-400/50"
                      }`
                    : ""
                }
                ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"}
              `}
            >
              <div>
                <div
                  className={`font-medium ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {t(dayFullKey[day])}
                </div>
                {isToday && (
                  <small className="text-teal-500">{t("today")}</small>
                )}
              </div>

              <div className={`flex items-center gap-2 ${color}`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{content}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className={`flex gap-5 text-xs pt-3 border-t ${
          isDark
            ? "border-gray-700 text-gray-400"
            : "border-gray-200 text-gray-500"
        }`}
      >
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          {t("open")}
        </span>
        <span className="flex items-center gap-1">
          <XCircle className="w-3 h-3 text-red-500" />
          {t("closed")}
        </span>
        <span className="flex items-center gap-1">
          <CalendarCheck className="w-3 h-3 text-amber-500" />
          {t("holiday")}
        </span>
      </div>
    </div>
  );
};

export default React.memo(BusinessOpeningHoursDetails);
