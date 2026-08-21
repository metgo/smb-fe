import clsx from "clsx";
import { toast } from "sonner";
import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Clock,
  MapPin,
  Loader,
  Ticket,
  LayoutList,
  Eye,
  PenBox,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
  BulkActionBar,
  ConfirmDialog,
  GridCard,
  ImageWithFallback,
  ReordableDataTable,
} from "@/components/shared";
import {
  extractCenterAddressText,
  extractEventDates,
  getLngWiseStr,
} from "@/helpers";
import {
  useDeleteEventMutation,
  useUpdateEventMutation,
} from "@/store/api/eventMutationApi";
import { EventCardSkeleton } from "@/components/skeletons";
import CreateEventWizardNew from "./wizard/CreateEventWizardNew";
import { useLazyGetEventByIdQuery } from "@/store/api/eventQueryApi";
import EmptyState from "@/components/shared/EmptyState";
import { StatusPill } from "@/components/pills";
import { ActionIconButtons } from "@/components/btns";
import TicketsModal from "./TicketsModal";
import LandingPagesModal from "./LandingPagesModal";
import { routes } from "@/lib/routes";
import { useCommon } from "@/hooks/useCommon";

interface EventsWithViewModeProps {
  events: IEventListRes[];
  viewMode: string;
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  eventTypeFilter: string;
  registrationFilter: string;
  statusFilter: string;
  searchQuery: string;
  refetch: () => void;
}

type TViewMode = "calendar-month" | "calendar-week" | "calendar-day";

const CALENDAR_MODES: {
  key: TViewMode;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "calendar-month", label: "month_view", icon: Calendar },
  { key: "calendar-week", label: "week_view", icon: Grid3x3 },
  { key: "calendar-day", label: "day_view", icon: Clock },
];

const WEEKDAY_LABELS: Record<string, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  he: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"],
  ar: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
};

const CATEGORY_COLORS: Record<string, { ribbon: string }> = {
  Culture: { ribbon: "bg-purple-600" },
  Arts: { ribbon: "bg-pink-600" },
  Food: { ribbon: "bg-orange-600" },
  Music: { ribbon: "bg-fuchsia-600" },
  Heritage: { ribbon: "bg-amber-600" },
  Sports: { ribbon: "bg-green-600" },
  Wellness: { ribbon: "bg-teal-600" },
  Nature: { ribbon: "bg-lime-600" },
  Adventure: { ribbon: "bg-red-600" },
  Entertainment: { ribbon: "bg-blue-600" },
};

const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category] || { ribbon: "bg-gray-600" };
};

export default function EventsWithViewMode({
  events,
  viewMode,
  refetch,
  isLoading,
  hasMore,
  fetchNextPage,
  searchQuery,
}: EventsWithViewModeProps) {
  const navigate = useNavigate();

  const { t } = useTranslation("events");
  const { t: tc } = useTranslation("toast");

  const { bgSecondary, borderColor, language, isDark } = useThemeClasses();
  const { allWebsites } = useCommon();

  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();

  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    eventId: string;
    eventDays: IEventDayDescription[];
    externalTicketLink: string;
    isTicketLinkExist: boolean;
  }>({
    eventId: "",
    eventDays: [],
    externalTicketLink: "",
    isTicketLinkExist: false,
  });

  const [isLandingPagesModalOpen, setIsLandingPagesModalOpen] = useState(false);
  const [selectedEventForLanding, setSelectedEventForLanding] = useState<{
    eventId: string;
  }>({
    eventId: "",
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarViewMode, setCalendarViewMode] =
    useState<TViewMode>("calendar-month");

  const [editData, setEditData] = useState();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const [getEventEditData] = useLazyGetEventByIdQuery();

  const handleEditEvent = async (eventId: string) => {
    const toastId = toast.loading(tc("event_edit_data_fetching"));
    if (eventId) {
      const eventDetails = await getEventEditData({ eventId }).unwrap();
      if (eventDetails) {
        setIsEditModalOpen(true);
        setEditData(eventDetails);
        toast.success(tc("event_details_fetched"), { id: toastId });
        navigate(`?eventId=${eventId}`);
      }
    }
  };

  // Current month/year string
  const monthYear = useMemo(() => {
    return currentDate.toLocaleDateString(
      language === "ar" ? "ar-EG" : language === "he" ? "he-IL" : "en-US",
      { month: "long", year: "numeric" },
    );
  }, [currentDate, language]);

  // Navigation
  const goPrevious = () => {
    if (calendarViewMode === "calendar-month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      );
    } else if (calendarViewMode === "calendar-week") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const goNext = () => {
    if (calendarViewMode === "calendar-month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      );
    } else if (calendarViewMode === "calendar-week") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const goToday = () => setCurrentDate(new Date());
  // Lazy load events
  const displayedEvents = events;

  // Month view days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay(); // 0 = Sunday

    const days: (Date | null)[] = [];

    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

    return days;
  }, [currentDate]);

  // Week view days
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const weekday = start.getDay();
    start.setDate(start.getDate() - weekday);

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  }, [currentDate]);

  // Handle events sets
  const handleEventSelect = (event: IEventListRes) => {
    navigate(`${routes.eventDetails}?eventId=${event?._id}`, {
      replace: true,
    });
  };

  const handleEventDelete = async (eventId: string) => {
    await deleteEvent({ eventId });
    toast.success(tc("event_deleted_success"));
    refetch();
  };

  const toggleCheckBox = (itemId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    if (setSelectedEvents) setSelectedEvents(newSelected);
  };

  // Events on a given date
  const eventsOnDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]; // normalize input date

    return events?.filter((e) =>
      e.dayDescription?.some((d: any) => {
        const dStr = new Date(d.date).toISOString().split("T")[0]; // normalize dayDescription date
        return dStr === dateStr;
      }),
    );
  };

  // Month View
  const MonthView = () => (
    <div className="grid grid-cols-7 gap-1 px-4 py-6">
      {WEEKDAY_LABELS[language].map((day) => (
        <div
          key={day}
          className="py-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          {day}
        </div>
      ))}
      {calendarDays.map((day, i) => {
        if (!day) return <div key={`empty-${i}`} className="aspect-square" />;

        const dayEvents = eventsOnDate(day);
        const isToday = day.toDateString() === new Date().toDateString();
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();

        return (
          <div
            key={i}
            className={`aspect-square  rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
              isToday
                ? "bg-teal-50 dark:bg-teal-900/20 border-teal-500"
                : "border-gray-200 dark:border-gray-700"
            } ${!isCurrentMonth ? "opacity-50" : ""}`}
          >
            <div
              className={`text-sm text-center font-medium mb-1 ${isToday ? "text-teal-600" : ""}`}
            >
              {day.getDate()}
            </div>
            <div className="space-y-1 text-xs">
              {dayEvents?.length > 3 && (
                <div className="text-gray-500">
                  +{dayEvents?.length - 3} {t("more")}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Week View
  const WeekView = () => (
    <div className="grid grid-cols-7 gap-4 px-4 py-6">
      {weekDays.map((day, i) => {
        const dayEvents = eventsOnDate(day);
        const isToday = day.toDateString() === new Date().toDateString();

        return (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-64"
          >
            <div
              className={`text-center mb-3 ${isToday ? "text-teal-600 font-bold" : ""}`}
            >
              <div className="text-xs text-gray-500">
                {WEEKDAY_LABELS[language][i]}
              </div>
              <div className="text-xl">{day.getDate()}</div>
            </div>
            <div className="space-y-2">
              {dayEvents?.map((event, index) => {
                const { ribbon } = getCategoryColor(event.status);
                return (
                  <div
                    key={event._id}
                    onClick={() => handleEventSelect(event)}
                    className={`p-2 ${ribbon} text-white rounded text-xs cursor-pointer`}
                  >
                    <div className="font-medium truncate">{event.name}</div>
                    <div>
                      {event?.dayDescription?.[index]?.startTime} -{" "}
                      {event?.dayDescription?.[index]?.endTime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Day View
  const DayView = () => {
    const dayEvents = eventsOnDate(currentDate);

    const dayLabel = currentDate.toLocaleDateString(
      language === "ar" ? "ar-EG" : language === "he" ? "he-IL" : "en-US",
      { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    );

    // Helper to compute ticket price label
    const getPriceLabel = (event: any) => {
      if (!event.tickets || event.tickets.length === 0) return t("free");

      const prices = event.tickets.map((t: any) => t.price.sellingPrice);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      return min === 0 && max === 0
        ? t("free")
        : min === max
          ? `₪${min}`
          : `₪${min} - ₪${max}`;
    };

    return (
      <div className="py-6 px-4">
        <h3 className="text-2xl font-semibold mb-6">{dayLabel}</h3>
        {dayEvents?.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {t("no_events_this_day")}
          </div>
        ) : (
          <div className="space-y-6">
            {dayEvents.map((event, index) => {
              const priceLabel = getPriceLabel(event);
              const isFree = priceLabel === t("free");

              return (
                <div
                  key={event._id}
                  onClick={() => handleEventSelect(event)}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-md cursor-pointer transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-medium mb-3">{event.name}</h4>
                      <div className="space-y-2 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          {event?.dayDescription?.[index]?.startTime} -{" "}
                          {event?.dayDescription?.[index]?.endTime}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          {event?.address?.location}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        isFree
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {priceLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Grid View
  const GridView = () => {
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useInfiniteScroll({
      ref: scrollRef,
      hasMore,
      isLoading,
      onLoadMore: fetchNextPage,
    });

    if (isLoading && (!displayedEvents || displayedEvents.length === 0)) {
      return (
        <div className="py-4 px-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        </div>
      );
    }

    // If no events match the search query, show "not found" message
    if (!displayedEvents || displayedEvents.length === 0) {
      return <EmptyState searchQuery={searchQuery} />;
    }

    return (
      <div
        ref={scrollRef}
        className="py-4 px-3 overflow-y-auto max-h-[calc(100vh-200px)]"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {displayedEvents?.map((event) => {
            const imageUrl =
              event?.images?.find((img) => img.isPrimary)?.image ||
              event?.images?.[0]?.image ||
              event?.image;
            return (
              <GridCard
                key={event._id}
                image={imageUrl}
                imageAlt={event.name}
                imageHeight="h-36"
                fallbackIcon={Calendar}
                fallbackGradient="from-purple-400 to-pink-400"
                title={event.name}
                status={event?.status?.toLowerCase()}
                isChecked={selectedEvents?.has(event._id) ?? false}
                onCheckChange={() => toggleCheckBox(event._id)}
                onDelete={(e) => {
                  e.stopPropagation();
                  setIsConfirmOpen(true);
                  setEventToDelete(event._id);
                }}
                onClick={() => handleEventSelect(event)}
                meta={[
                  {
                    icon: Calendar,
                    label: extractEventDates(event?.dayDescription),
                  },
                  {
                    icon: MapPin,
                    label:
                      extractCenterAddressText(event?.address?.location) || "",
                  },
                ]}
              />
            );
          })}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-6">
            <Loader className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        )}
      </div>
    );
  };

  // List View
  const ListView = () => {
    return (
      <ReordableDataTable
        rowKey="_id"
        isDataLoading={isLoading}
        data={displayedEvents}
        selectedItems={selectedEvents}
        onSelectionChange={(selected) =>
          setSelectedEvents(selected as Set<string>)
        }
        // onRowClick={(item) => handleEventSelect(item)}
        maxHeight="calc(100vh - 180px)"
        storageKey="eventsTableColumnOrder"
        hasMore={hasMore}
        next={fetchNextPage}
        columns={[
          { key: "checkbox", label: "", width: "50px" },
          {
            key: "event_name",
            label: t("event_name"),
            sortable: true,
            render: (event) => (
              <div className="flex items-center gap-2">
                <span className="text-sm line-clamp-2">
                  {getLngWiseStr(
                    language,
                    event.name,
                    event.nameHe,
                    event.nameAr,
                  )}
                </span>
              </div>
            ),
          },
          {
            key: "date",
            label: t("date"),
            sortable: true,
            render: (event) => extractEventDates(event?.dayDescription),
          },
          {
            key: "associatedWebsites",
            label: t("websites"),
            sortable: true,
            render: (event) => {
              return (
                <div className="flex items-center gap-2">
                  {allWebsites
                    ?.filter((item) =>
                      event?.associatedWebsiteIds?.includes(item._id),
                    )
                    ?.map((website) => (
                      <div key={website?._id}>
                        <ImageWithFallback
                          src={website.logo}
                          alt={website.name}
                          className="w-4 h-4"
                        />
                      </div>
                    ))}
                </div>
              );
            },
          },
          {
            key: "price",
            label: t("price"),
            sortable: true,
            render: (event) => {
              const firstTicket = event?.pricing?.[0];
              const lastTicket = event?.pricing?.[event?.pricing?.length - 1];
              return (
                <div>
                  {firstTicket?.type === "FREE" ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                      {t("free")}
                    </span>
                  ) : (
                    <span className="font-medium">
                      ₪{firstTicket?.price?.sellingPrice}
                    </span>
                  )}
                  -
                  {lastTicket?.type === "FREE" ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                      {t("free")}
                    </span>
                  ) : (
                    <span className="font-medium">
                      ₪{lastTicket?.price?.sellingPrice}
                    </span>
                  )}
                </div>
              );
            },
          },
          {
            key: "status",
            label: t("status"),
            sortable: true,
            render: (event) => <StatusPill status={event.status} />,
          },
          {
            key: "ticket_count",
            label: t("tickets"),
            render: (event) =>
              event.hasExternalTicket ? (
                <div>-</div>
              ) : (
                <div>{event?.ticketCount}</div>
              ),
          },
          {
            key: "wrapper_count",
            label: t("landing_pages"),
            render: (event) =>
              event.hasExternalTicket ? (
                <div>-</div>
              ) : (
                <div>{event?.wrapperCount}</div>
              ),
          },
          {
            key: "action",
            label: t("actions"),
            render: (event) => (
              <ActionIconButtons
                isDark={isDark}
                actions={[
                  {
                    title: t("edit_event"),
                    icon: PenBox,
                    color: "blue",
                    onClick: () => {
                      handleEditEvent(event._id);
                    },
                  },
                  {
                    title: t("details"),
                    icon: Eye,
                    color: "green",
                    onClick: () => {
                      navigate(`${routes.eventDetails}?eventId=${event?._id}`, {
                        replace: true,
                      });
                    },
                  },
                  {
                    title: t("tickets"),
                    icon: Ticket,
                    color: "gray",
                    onClick: () => {
                      setSelectedEvent({
                        eventId: event._id,
                        eventDays: event.dayDescription,
                        externalTicketLink: event.ticketBuyLink,
                        isTicketLinkExist: event.hasExternalTicket,
                      });
                      setIsTicketsModalOpen(true);
                    },
                  },
                  ...(event?.hasExternalTicket || event.ticketCount === 0
                    ? []
                    : [
                        {
                          title: t("create_landing_page"),
                          icon: LayoutList,
                          color: "yellow" as const,
                          onClick: () => {
                            setSelectedEventForLanding({
                              eventId: event._id,
                            });
                            setIsLandingPagesModalOpen(true);
                          },
                        },
                      ]),
                ]}
              />
            ),
          },
        ]}
      />
    );
  };

  const handleBulkStatusChange = async (status: TStatus) => {
    if (!selectedEvents.size) return;
    const toastId = toast.loading(tc("event_status_change_loading"));

    try {
      await Promise.all(
        Array.from(selectedEvents).map((eventId: string) =>
          updateEvent({ eventId, body: { status: status?.toUpperCase() } }),
        ),
      );
      const message = tc("event_status_update_success");
      toast.success(message, { id: toastId });
      setSelectedEvents(new Set());
      refetch();
    } catch (error: any) {
      toast.error(tc("event_status_update_failed"), {
        id: toastId,
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedEvents.size) return;
    const toastId = toast.loading(tc("event_delete_loading"));
    try {
      await Promise.all(
        Array.from(selectedEvents).map((eventId: string) =>
          deleteEvent({ eventId }),
        ),
      );

      const message = tc("event_deleted_success");
      toast.success(message, { id: toastId });
      setSelectedEvents(new Set());
      refetch();
    } catch (error: any) {
      toast.error(tc("event_delete_failed"));
    }
  };

  return (
    <>
      <div className="space-y-2">
        <BulkActionBar
          selectedItemCount={selectedEvents.size || 0}
          handleBulkStatusChange={handleBulkStatusChange}
          handleBulkDelete={handleBulkDelete}
          hancleClearSelection={() => setSelectedEvents(new Set())}
        />

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {viewMode === "calendar" && (
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {/* Calendar Views */}
              {CALENDAR_MODES.map(({ key, label, icon: Icon }) => {
                const isActive = calendarViewMode === key;

                return (
                  <Button
                    key={key}
                    variant="ghost"
                    onClick={() => setCalendarViewMode(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-white dark:bg-gray-700 text-purple-600 shadow"
                    : "text-gray-600 dark:text-gray-300"
                }`}
                  >
                    <Icon className="w-5 h-5" />
                    {t(label)}
                  </Button>
                );
              })}
            </div>
          )}

          {viewMode.startsWith("calendar") && (
            <div className="flex items-center gap-4">
              <button
                onClick={goPrevious}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="font-semibold text-lg min-w-48 text-center">
                {monthYear}
              </span>
              <button
                onClick={goNext}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button
                onClick={goToday}
                className="px-5 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50"
              >
                {t("today")}
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        {viewMode === "calendar" ? (
          <div
            className={clsx(
              bgSecondary,
              borderColor,
              "border flex-1 overflow-y-auto max-h-[calc(100vh-200px)] rounded-2xl",
            )}
          >
            {calendarViewMode === "calendar-month" && <MonthView />}
            {calendarViewMode === "calendar-week" && <WeekView />}
            {calendarViewMode === "calendar-day" && <DayView />}
          </div>
        ) : viewMode === "list" ? (
          <ListView />
        ) : (
          <GridView />
        )}

        <ConfirmDialog
          open={isConfirmOpen}
          title={"delete_event"}
          message="delete_event_confirm"
          confirmText="delete"
          loading={isDeleting}
          variant="danger"
          onCancel={() => {
            setIsConfirmOpen(false);
            setEventToDelete(null);
          }}
          onConfirm={() => {
            if (!eventToDelete) return;
            handleEventDelete(eventToDelete);
            setIsConfirmOpen(false);
            setEventToDelete(null);
          }}
        />

        {isEditModalOpen && (
          <CreateEventWizardNew
            isOpen={isEditModalOpen}
            editData={editData}
            onClose={() => setIsEditModalOpen(false)}
            refetch={refetch}
          />
        )}
      </div>

      {isTicketsModalOpen && (
        <TicketsModal
          {...selectedEvent}
          eventsRefetch={refetch}
          setIsOpen={setIsTicketsModalOpen}
        />
      )}

      {isLandingPagesModalOpen && (
        <LandingPagesModal
          {...selectedEventForLanding}
          eventsRefetch={refetch}
          setIsOpen={setIsLandingPagesModalOpen}
        />
      )}
    </>
  );
}
