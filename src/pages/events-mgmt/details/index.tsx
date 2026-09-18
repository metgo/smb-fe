import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronDown,
  DollarSign,
  Edit,
  LayoutList,
  Ticket,
  Users,
} from "lucide-react";

import {
  EventDateTimeDetails,
  EventInfoDetails,
  EventQrScanLogs,
  EventRegistrationDetails,
  EventScheduledNotificationDetails,
  EventSessionDetails,
  EventTicketDetails,
} from "./components";
import { routes } from "@/lib/routes";
import {
  useGetAllTicketQuery,
  useGetEventByIdQuery,
  useGetEventsStatsQuery,
  useGetSessionsByEventIdQuery,
} from "@/store/api/eventQueryApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { StatusChangeBtn } from "@/components/btns";
import { ChatWithCreator } from "@/components/chat-popup";
import { useUpdateEventMutation } from "@/store/api/eventMutationApi";
import {
  AttributesDetails,
  DetailTitleSection,
  // LocationDetails,
  MediaDetails,
} from "@/components/details-sections";
import { PageStats, Spinner, TabsSection } from "@/components/shared";
import { getEventTabs } from "@/constants/tabs";
import { CreateEventWizardNew } from "../components";

const findEventType = (type: string) => {
  switch (type) {
    case "PHYSICAL":
      return type?.toLowerCase();
    case "ONLINE":
      return type?.toLowerCase();
    case "HYBRID":
      return type?.toLowerCase();
    default:
      return "physical";
  }
};

export default function EventDetailsPage() {
  const { t } = useTranslation("events");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get("eventId") || "";
  const tokenFromUrl = searchParams.get("token"); // QR code has token
  const tabFromUrl = searchParams.get("tab") || "overview";
  const isFromQRCode = !!tokenFromUrl; // Only from QR code if token exists

  const { bgPrimary, isRTL, isDark } = useThemeClasses();

  const [hasExternalTicket, setHasExternalTicket] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTabState] = useState(tabFromUrl);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Handle tab change and update URL only if coming from QR code
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (isFromQRCode) {
      const params = new URLSearchParams(searchParams);
      params.set("tab", tab);
      navigate(`?${params.toString()}`, { replace: true });
    }
  };

  const [eventDays, setEventDays] = useState<IEventDay[]>([
    { id: "", date: "", startTime: "9:30", endTime: "14:30", description: "" },
  ]);

  const {
    data: eventDetails,
    refetch,
    isLoading,
    isFetching,
  } = useGetEventByIdQuery(eventId ? { eventId } : skipToken);

  const { data: tickets, refetch: ticketsRefetch } = useGetAllTicketQuery(
    eventId && !hasExternalTicket ? { eventId } : skipToken,
  );
  const {
    data: sessions,
    refetch: sessionRefetch,
    isFetching: isSessionsLoading,
  } = useGetSessionsByEventIdQuery(
    eventId && !hasExternalTicket ? { eventId } : skipToken,
  );

  const { data: eventStatsData, isLoading: isStatsLoading } =
    useGetEventsStatsQuery(eventId ? { eventId } : skipToken);

  const [updateEvent] = useUpdateEventMutation();

  useEffect(() => {
    if (eventDetails) {
      setEventDays(eventDetails?.dayDescription ?? []);
      setHasExternalTicket(eventDetails?.hasExternalTicket);
    }
  }, [eventDetails]);

  // Sync activeTab with URL tab parameter only if from QR code
  useEffect(() => {
    if (isFromQRCode) {
      const tabParam = searchParams.get("tab");
      if (tabParam && tabParam !== activeTab) {
        setActiveTabState(tabParam);
      }
    }
  }, [searchParams, isFromQRCode, activeTab]);

  const handleClose = () => {
    setIsEditOpen(false);
    refetch();
  };

  const onStatusChangeHandler = async (status: string) => {
    try {
      await updateEvent({
        eventId,
        body: { status: status?.toUpperCase() },
      }).unwrap();

      refetch();
      toast.success("Event status updated successfully!");
    } catch (error) {
      toast.error("Failed to update event status.");
      console.error(error);
    }
  };

  const singleEventStats = [
    {
      id: 1,
      title: t("total_registrations"),
      value: eventStatsData?.totalSold,
      labelClass: "text-green-500",
      icon: <Calendar className="w-8 h-8 text-teal-500" />,
    },
    {
      id: 2,
      title: t("capacity"),
      value: eventStatsData?.totalAttended,
      sub: `${
        Math.round(
          (eventStatsData?.totalRegistrations / eventStatsData?.capacity) * 100,
        ) || 0
      }% ${t("filled")}`,
      icon: <Users className="w-8 h-8 text-blue-500" />,
    },
    {
      id: 3,
      title: t("revenue"),
      value: `₪${(eventStatsData?.totalRevenue / 1000).toFixed(1)}K`,
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
    },
    {
      id: 4,
      title: t("refunds"),
      value: `₪${(eventStatsData?.refunds || 0 / 1000).toFixed(1)}K`,
      icon: <DollarSign className="w-8 h-8 text-red-500" />,
    },
    {
      id: 5,
      title: t("event_type"),
      value: t(findEventType(eventDetails?.eventType || "PHYSICAL")),
      icon: <Ticket className="w-8 h-8 text-purple-500" />,
    },
  ];

  const renderContent = () => {
    const commonProps = { t, eventDetails };
    const eventImages = eventDetails?.images ?? [];
    const mediaProps = {
      images: eventImages.map((img: any) => ({
        image: img.image,
        isPrimary: img.isPrimary,
      })),
      primaryImageIndex: Math.max(
        0,
        eventImages.findIndex((img: any) => img.isPrimary),
      ),
    };

    switch (activeTab) {
      case "overview":
        return <EventInfoDetails {...commonProps} />;
      case "date_time":
        return <EventDateTimeDetails {...(eventDetails ?? {})} />;
      case "media":
        return <MediaDetails {...mediaProps} />;
      case "tickets":
        return (
          <EventTicketDetails
            tickets={tickets}
            eventId={eventId}
            refetch={ticketsRefetch}
            eventDays={eventDays}
            hasExternalTicket={hasExternalTicket}
            ticketBuyLink={eventDetails?.ticketBuyLink || ""}
            eventSlug={eventDetails?.slug || ""}
            associatedWebsites={eventDetails?.associatedWebsites || []}
            associatedWebsiteIds={eventDetails?.associatedWebsiteIds || []}
          />
        );
      case "schedual_notification":
        return <EventScheduledNotificationDetails {...(eventDetails ?? {})} />;
      case "attributes":
        return (
          <AttributesDetails
            groupTypesId={eventDetails?.groupTypesId}
            subCategoriesId={eventDetails?.subCategoriesId}
            accessibilitiesId={eventDetails?.accessibilitiesId}
          />
        );
      case "registration":
        return <EventRegistrationDetails eventDetails={eventDetails} />;
      case "sessions":
        return (
          <EventSessionDetails
            eventDetails={eventDetails}
            eventId={eventId}
            isLoading={isSessionsLoading}
            sessions={sessions}
            refetch={sessionRefetch}
          />
        );
      case "qr_scan_logs":
        return <EventQrScanLogs eventId={eventId} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden relative md:top-0">
      <Spinner isLoading={isLoading || isFetching} />

      {/* Title + Stats */}
      <div className="details-top shrink-0">
        <DetailTitleSection
          {...eventDetails}
          imageSrc={
            eventDetails?.images?.find((img: any) => img.isPrimary)?.image ||
            eventDetails?.images?.[0]?.image
          }
          backPath={routes.eventsMgmt}
          actions={
            <>
              <StatusChangeBtn
                handleStatusChange={onStatusChangeHandler}
                status={
                  (eventDetails?.status?.toLowerCase() as TStatus) || "pending"
                }
              />

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer ${
                    isDark
                      ? "border-gray-700 hover:bg-gray-800 text-gray-300 bg-gray-900"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700 bg-white"
                  }`}
                >
                  <span className="text-sm font-medium">{t("actions")}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-52 rounded-xl shadow-lg border z-50 overflow-hidden ${
                      isDark
                        ? "bg-gray-900 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => setIsEditOpen(true)}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                        isDark
                          ? "text-indigo-400 hover:bg-gray-800"
                          : "text-indigo-600 hover:bg-gray-50"
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                      {t("edit")}
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `${routes.eventSessionMgmt}?eventId=${eventId}`,
                        )
                      }
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                        isDark
                          ? "text-gray-300 hover:bg-gray-800"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <LayoutList className="w-4 h-4 shrink-0" />
                      {t("create_landing_page")}
                    </button>
                  </div>
                )}
              </div>
            </>
          }
        />
        <PageStats
          stats={singleEventStats}
          isLoading={isStatsLoading}
          className="sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4"
          wrapperClassName="pt-4 pb-1"
        />
      </div>

      {/* Tabs + scrollable content */}
      <div className="flex flex-col flex-1 min-h-0 mt-2">
        <div className="shrink-0">
          <TabsSection
            tabs={getEventTabs(eventDetails?.hasExternalTicket)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div
          className={clsx(
            "details-content flex-1 overflow-y-auto min-h-0",
            bgPrimary,
          )}
        >
          <div className="py-3 px-2">{renderContent()}</div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <CreateEventWizardNew
          isOpen={isEditOpen}
          onClose={handleClose}
          editData={eventDetails}
          refetch={ticketsRefetch}
          eventDataRefetch={refetch}
        />
      )}

      <ChatWithCreator creator={eventDetails?.creator} />
    </div>
  );
}
