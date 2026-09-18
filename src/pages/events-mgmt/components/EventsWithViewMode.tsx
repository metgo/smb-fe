import { toast } from "sonner";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  Calendar,
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
import EventCalendarView, {
  type TCalendarViewMode,
} from "./sub-components/EventCalendarView";

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

const CALENDAR_MODES: {
  key: TCalendarViewMode;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "calendar-month", label: "month_view", icon: Calendar },
  { key: "calendar-week", label: "week_view", icon: Grid3x3 },
  { key: "calendar-day", label: "day_view", icon: Clock },
];

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

  const { language, isDark } = useThemeClasses();
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

  const [currentDate] = useState(new Date());
  const [calendarViewMode, setCalendarViewMode] =
    useState<TCalendarViewMode>("calendar-month");

  const [editData, setEditData] = useState<IEventDetailsRes>();

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

  const displayedEvents = events;

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
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
                    title: t("edit_event"),
                    icon: PenBox,
                    color: "blue",
                    onClick: () => {
                      handleEditEvent(event._id);
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
        </div>

        {/* Main Content */}
        {viewMode === "calendar" ? (
          <EventCalendarView
            viewMode={calendarViewMode}
            currentDate={currentDate}
            events={events}
            language={language}
            onEventSelect={handleEventSelect}
          />
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
