import clsx from "clsx";
import { Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";
import { StatusPill } from "@/components/pills";

const WEEKDAY_LABELS: Record<string, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  he: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"],
  ar: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
};

export type TCalendarViewMode =
  "calendar-month" | "calendar-week" | "calendar-day";

type TThemeClasses = ReturnType<typeof useThemeClasses>;

interface EventCalendarViewProps {
  viewMode: TCalendarViewMode;
  currentDate: Date;
  events: IEventListRes[];
  language: string;
  onEventSelect: (event: IEventListRes) => void;
}

interface ViewProps extends Omit<EventCalendarViewProps, "viewMode"> {
  themeClasses: TThemeClasses;
}

const getEventImage = (event: IEventListRes) =>
  event?.images?.find((img) => img.isPrimary)?.image ||
  event?.images?.[0]?.image ||
  event?.image;

const getPriceLabel = (event: IEventListRes, freeLabel: string) => {
  if (!event?.pricing || event.pricing.length === 0) return freeLabel;

  const prices = event.pricing.map((p) => p?.price?.sellingPrice ?? 0);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === 0 && max === 0
    ? freeLabel
    : min === max
      ? `₪${min}`
      : `₪${min} - ₪${max}`;
};

const normalizeDate = (date: string | Date) =>
  new Date(date).toISOString().split("T")[0];

const useEventsOnDate = (events: IEventListRes[]) => (date: Date) => {
  const dateStr = normalizeDate(date);

  return events?.filter((e) =>
    e.dayDescription?.some((d) => normalizeDate(d.date) === dateStr),
  );
};

// Compact event chip used inside month-view day cells
const EventChip = ({
  event,
  onClick,
  isDark,
}: {
  event: IEventListRes;
  onClick: () => void;
  isDark: boolean;
}) => {
  const imageUrl = getEventImage(event);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={clsx(
        "w-full flex items-center gap-1.5 px-1.5 py-1 rounded-md text-left transition-colors",
        isDark
          ? "bg-purple-900/30 hover:bg-purple-900/50"
          : "bg-purple-50 hover:bg-purple-100",
      )}
      title={event.name}
    >
      <ImageWithFallback
        src={imageUrl}
        alt={event.name}
        className="w-4 h-4 rounded object-cover shrink-0"
      />
      <span
        className={clsx(
          "truncate text-[11px] font-medium",
          isDark ? "text-purple-300" : "text-purple-700",
        )}
      >
        {event.name}
      </span>
    </button>
  );
};

// Richer card used in week-view day columns
const EventWeekCard = ({
  event,
  onClick,
  themeClasses,
}: {
  event: IEventListRes;
  onClick: () => void;
  themeClasses: TThemeClasses;
}) => {
  const { t } = useTranslation("events");
  const { isDark, textTertiary, borderColor } = themeClasses;
  const imageUrl = getEventImage(event);
  const dayInfo = event.dayDescription?.[0];

  return (
    <div
      onClick={onClick}
      className={clsx(
        "group flex gap-2 p-2 rounded-lg border cursor-pointer transition-all",
        borderColor,
        isDark
          ? "bg-gray-900 hover:border-purple-700"
          : "bg-white hover:border-purple-300",
        "hover:shadow-md",
      )}
    >
      <ImageWithFallback
        src={imageUrl}
        alt={event.name}
        className="w-12 h-12 rounded-md object-cover shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-xs truncate group-hover:text-purple-600">
          {event.name}
        </div>
        {dayInfo && (
          <div
            className={clsx(
              "flex items-center gap-1 text-[11px] mt-0.5",
              textTertiary,
            )}
          >
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {dayInfo.startTime} - {dayInfo.endTime}
            </span>
          </div>
        )}
        <div className="mt-1">
          <span
            className={clsx(
              "text-[10px] font-medium",
              isDark ? "text-purple-400" : "text-purple-600",
            )}
          >
            {getPriceLabel(event, t("free"))}
          </span>
        </div>
      </div>
    </div>
  );
};

// Full-detail card used in the day view
const EventDayCard = ({
  event,
  onClick,
  themeClasses,
}: {
  event: IEventListRes;
  onClick: () => void;
  themeClasses: TThemeClasses;
}) => {
  const { t } = useTranslation("events");
  const { bgTertiary, textSecondary, isDark } = themeClasses;
  const imageUrl = getEventImage(event);
  const dayInfo = event.dayDescription?.[0];
  const priceLabel = getPriceLabel(event, t("free"));
  const isFree = priceLabel === t("free");

  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex gap-4 rounded-xl p-4 hover:shadow-md cursor-pointer transition-shadow",
        bgTertiary,
      )}
    >
      <ImageWithFallback
        src={imageUrl}
        alt={event.name}
        className="w-28 h-28 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0 flex justify-between items-start gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-medium truncate">{event.name}</h4>
            <StatusPill status={event.status} />
          </div>
          <div className={clsx("space-y-1.5 text-sm", textSecondary)}>
            {dayInfo && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                {dayInfo.startTime} - {dayInfo.endTime}
              </div>
            )}
            {event?.address?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{event.address.location}</span>
              </div>
            )}
          </div>
        </div>
        <div
          className={clsx(
            "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap",
            isFree
              ? isDark
                ? "bg-emerald-900/30 text-emerald-400"
                : "bg-emerald-100 text-emerald-700"
              : isDark
                ? "bg-purple-900/30 text-purple-400"
                : "bg-purple-100 text-purple-700",
          )}
        >
          {priceLabel}
        </div>
      </div>
    </div>
  );
};

const MonthView = ({
  currentDate,
  events,
  language,
  onEventSelect,
  themeClasses,
}: ViewProps) => {
  const { t } = useTranslation("events");
  const { isDark, textTertiary, borderColor, hoverBg } = themeClasses;
  const eventsOnDate = useEventsOnDate(events);

  const calendarDays = (() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

    return days;
  })();

  const MAX_VISIBLE = 3;

  return (
    <div className="grid grid-cols-7 gap-1 px-4 py-6">
      {WEEKDAY_LABELS[language].map((day) => (
        <div
          key={day}
          className={clsx("py-2 text-center text-sm font-medium", textTertiary)}
        >
          {day}
        </div>
      ))}
      {calendarDays.map((day, i) => {
        if (!day) return <div key={`empty-${i}`} className="min-h-28" />;

        const dayEvents = eventsOnDate(day);
        const isToday = day.toDateString() === new Date().toDateString();
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
        const visibleEvents = dayEvents?.slice(0, MAX_VISIBLE) ?? [];
        const hiddenCount = (dayEvents?.length ?? 0) - visibleEvents.length;

        return (
          <div
            key={i}
            className={clsx(
              "min-h-28 rounded-lg border p-1.5 flex flex-col gap-1 transition-colors",
              hoverBg,
              isToday
                ? isDark
                  ? "bg-teal-900/20 border-teal-500"
                  : "bg-teal-50 border-teal-500"
                : borderColor,
              !isCurrentMonth && "opacity-50",
            )}
          >
            <div
              className={clsx(
                "text-sm text-center font-medium",
                isToday && "text-teal-600",
              )}
            >
              {day.getDate()}
            </div>
            <div className="space-y-1 overflow-hidden">
              {visibleEvents.map((event) => (
                <EventChip
                  key={event._id}
                  event={event}
                  onClick={() => onEventSelect(event)}
                  isDark={isDark}
                />
              ))}
              {hiddenCount > 0 && (
                <div className={clsx("text-[11px] px-1.5", textTertiary)}>
                  +{hiddenCount} {t("more")}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const WeekView = ({
  currentDate,
  events,
  language,
  onEventSelect,
  themeClasses,
}: ViewProps) => {
  const { isDark, textTertiary, borderColor } = themeClasses;
  const eventsOnDate = useEventsOnDate(events);

  const weekDays = (() => {
    const start = new Date(currentDate);
    const weekday = start.getDay();
    start.setDate(start.getDate() - weekday);

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  })();

  return (
    <div className="grid grid-cols-7 gap-4 px-4 py-6">
      {weekDays.map((day, i) => {
        const dayEvents = eventsOnDate(day);
        const isToday = day.toDateString() === new Date().toDateString();

        return (
          <div
            key={i}
            className={clsx(
              "border rounded-lg p-3 min-h-64 space-y-2",
              isToday
                ? isDark
                  ? "border-teal-500 bg-teal-900/10"
                  : "border-teal-500 bg-teal-50/50"
                : borderColor,
            )}
          >
            <div
              className={clsx(
                "text-center mb-3",
                isToday && "text-teal-600 font-bold",
              )}
            >
              <div className={clsx("text-xs", textTertiary)}>
                {WEEKDAY_LABELS[language][i]}
              </div>
              <div className="text-xl">{day.getDate()}</div>
            </div>
            <div className="space-y-2">
              {dayEvents?.map((event) => (
                <EventWeekCard
                  key={event._id}
                  event={event}
                  onClick={() => onEventSelect(event)}
                  themeClasses={themeClasses}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DayView = ({
  currentDate,
  events,
  language,
  onEventSelect,
  themeClasses,
}: ViewProps) => {
  const { t } = useTranslation("events");
  const { textTertiary } = themeClasses;
  const eventsOnDate = useEventsOnDate(events);
  const dayEvents = eventsOnDate(currentDate);

  const dayLabel = currentDate.toLocaleDateString(
    language === "ar" ? "ar-EG" : language === "he" ? "he-IL" : "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <div className="py-6 px-4">
      <h3 className="text-2xl font-semibold mb-6">{dayLabel}</h3>
      {!dayEvents || dayEvents.length === 0 ? (
        <div className={clsx("text-center py-20", textTertiary)}>
          {t("no_events_this_day")}
        </div>
      ) : (
        <div className="space-y-4">
          {dayEvents.map((event) => (
            <EventDayCard
              key={event._id}
              event={event}
              onClick={() => onEventSelect(event)}
              themeClasses={themeClasses}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function EventCalendarView({
  viewMode,
  currentDate,
  events,
  language,
  onEventSelect,
}: EventCalendarViewProps) {
  const themeClasses = useThemeClasses();
  const { bgSecondary, borderColor, textPrimary } = themeClasses;

  return (
    <div
      className={clsx(
        bgSecondary,
        borderColor,
        textPrimary,
        "border flex-1 overflow-y-auto max-h-[calc(100vh-200px)] rounded-2xl",
      )}
    >
      {viewMode === "calendar-month" && (
        <MonthView
          currentDate={currentDate}
          events={events}
          language={language}
          onEventSelect={onEventSelect}
          themeClasses={themeClasses}
        />
      )}
      {viewMode === "calendar-week" && (
        <WeekView
          currentDate={currentDate}
          events={events}
          language={language}
          onEventSelect={onEventSelect}
          themeClasses={themeClasses}
        />
      )}
      {viewMode === "calendar-day" && (
        <DayView
          currentDate={currentDate}
          events={events}
          language={language}
          onEventSelect={onEventSelect}
          themeClasses={themeClasses}
        />
      )}
    </div>
  );
}
