import clsx from "clsx";
import { toast } from "sonner";
import { Calendar, DollarSign, Edit, Ticket, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import {
  EventDateTimeDetails,
  EventInfoDetails,
  EventRegistrationDetails,
  EventScheduledNotificationDetails,
  EventTicketDetails,
} from "./components";
import { routes } from "@/lib/routes";
import {
  useGetAllTicketQuery,
  useGetEventByIdQuery,
  useGetEventsStatsQuery,
} from "@/store/api/eventQueryApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import { CreateEventWizard } from "../components";
import { BackToListBtn, StatusChangeBtn } from "@/components/btns";
import { useUpdateEventMutation } from "@/store/api/eventMutationApi";
import {
  AttributesDetails,
  DetailTitleSection,
  LocationDetails,
  MediaDetails,
} from "@/components/details-sections";
import { PageStats, TabsSection } from "@/components/shared";
import { eventTabs } from "@/constants/tabs";

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
  const eventId = searchParams.get("eventId") || "";

  const { isDark, bgPrimary } = useThemeClasses();

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [galleryImages, setGalleryImages] = useState<TImages>([]);
  const [eventDays, setEventDays] = useState<EventDay[]>([
    { id: "", date: "", startTime: "9:30", endTime: "14:30", description: "" },
  ]);

  const { data: eventDetails, refetch } = useGetEventByIdQuery(
    eventId ? { eventId } : skipToken,
  );
  const { data: tickets, refetch: ticketsRefetch } = useGetAllTicketQuery(
    eventId ? { eventId } : skipToken,
  );
  const { data: eventStatsData, isLoading: isStatsLoading } =
    useGetEventsStatsQuery(eventId ? { eventId } : skipToken);

  const [updateEvent] = useUpdateEventMutation();

  useEffect(() => {
    if (eventDetails) {
      setGalleryImages(eventDetails?.images ?? []);
      setEventDays(eventDetails?.dayDescription ?? []);
    }
  }, [eventDetails]);

  const {
    images,
    primaryImageIndex,
    handleImageUpload,
    setPrimaryImage,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isImageDeleting,
    handleDeleteImage,
  } = useImagesUpload({
    initialImages: galleryImages,
    onChange: setGalleryImages,
  });

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
      value: t(findEventType(eventDetails?.eventType)),
      icon: <Ticket className="w-8 h-8 text-purple-500" />,
    },
  ];

  const renderContent = () => {
    const commonProps = { t, eventDetails };
    const mediaProps = {
      t,
      images,
      primaryImageIndex,
      setPrimaryImage,
      handleImageUpload,
      deleteTarget,
      setDeleteTarget,
      isImageDeleting,
      confirmDelete,
      handleDeleteImage,
    };

    switch (activeTab) {
      case "overview":
        return <EventInfoDetails {...commonProps} />;
      case "date_time":
        return <EventDateTimeDetails {...(eventDetails ?? {})} />;
      case "location":
        return (
          <LocationDetails
            purpose="Event"
            lat={eventDetails?.geoLocation?.lat}
            lng={eventDetails?.geoLocation?.long}
            address={eventDetails?.address}
          />
        );
      case "media":
        return <MediaDetails {...mediaProps} />;
      case "tickets":
        return (
          <EventTicketDetails
            tickets={tickets}
            eventId={eventId}
            refetch={ticketsRefetch}
            eventDays={eventDays}
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
        return (
          <EventRegistrationDetails
            eventDetails={eventDetails}
            registrantSearchQuery=""
            setRegistrantSearchQuery={() => {}}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col overflow-hidden relative">
      {/* Sticky Header */}
      <div
        className={clsx(
          "sticky top-0 z-20 border-b shrink-0",
          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
        )}
      >
        {/* Top controls row */}
        <div className="px-6 pt-4 pb-3 flex items-center justify-between">
          <BackToListBtn navPath={routes.eventsMgmt} />
          <div className="flex items-center gap-3">
            <StatusChangeBtn
              handleStatusChange={onStatusChangeHandler}
              status={eventDetails?.status}
            />
            <button
              onClick={() => setIsEditOpen(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              {t("edit")}
            </button>
          </div>
        </div>

        {/* Title & Tabs */}
        <div className="px-6 pb-3">
          <DetailTitleSection
            {...eventDetails}
            imageSrc={eventDetails?.images?.[0]?.image}
          />
          <PageStats
            stats={singleEventStats}
            isLoading={isStatsLoading}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4 my-6"
          />

          <TabsSection
            tabs={eventTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className={clsx("flex-1 overflow-y-auto", bgPrimary)}>
        <div className="py-3 px-2">{renderContent()}</div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <CreateEventWizard
          isOpen={isEditOpen}
          onClose={handleClose}
          editData={eventDetails}
        />
      )}
    </div>
  );
}
