import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { useAppSelector } from "@/hooks/hooks";
import {
  EventDateTimeDetails,
  EventInfoDetails,
  EventRegistrationDetails,
  EventScheduledNotificationDetails,
  EventTicketDetails,
  EventTitleSection,
} from "./components";
import { routes } from "@/lib/routes";
import { UserRole } from "@/enums/user.types";
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
import { toast } from "sonner";
import {
  AttributesDetails,
  LocationDetails,
  MediaDetails,
} from "@/components/details-sections";
import { TabsSection } from "@/components/shared";
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
  const { t: tc } = useTranslation("common");

  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") || "";

  const { isDark, bgPrimary, textTertiary, textPrimary } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);

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
  const { data: eventStatsData } = useGetEventsStatsQuery(
    eventId ? { eventId } : skipToken,
  );

  const [updateEvent] = useUpdateEventMutation();

  useEffect(() => {
    if (eventDetails) {
      setGalleryImages(eventDetails?.images ?? []);
      setEventDays(eventDetails?.dayDescription ?? []);
    }
  }, [eventDetails]);

  const {
    images,
    imagesRef,
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
        body: { status: status.toUpperCase() },
      }).unwrap();

      refetch();
      toast.success("Event status updated successfully!");
    } catch (error) {
      toast.error("Failed to update event status.");
      console.error(error);
    }
  };

  const renderContent = () => {
    const commonProps = { t, eventDetails };
    const mediaProps = {
      t,
      images,
      imagesRef,
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
            title={t("event_attributes")}
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
            {userRole === UserRole.SUPERADMIN && (
              <StatusChangeBtn
                handleStatusChange={onStatusChangeHandler}
                status={eventDetails?.status}
              />
            )}
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
          <EventTitleSection {...(eventDetails ?? {})} />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-4">
            {[
              {
                label: t("total_registrations"),
                value: eventStatsData?.totalSold,
              },
              {
                label: t("capacity"),
                value: eventStatsData?.totalAttended,
                sub: `${
                  Math.round(
                    (eventStatsData?.totalRegistrations /
                      eventStatsData?.capacity) *
                      100,
                  ) || 0
                }% ${t("filled")}`,
              },
              {
                label: t("revenue"),
                value: `₪${(eventStatsData?.totalRevenue / 1000).toFixed(1)}K`,
              },
              {
                label: t("refunds"),
                value: `₪${(eventStatsData?.refunds || 0 / 1000).toFixed(1)}K`,
              },
              {
                label: t("event_type"),
                value: t(findEventType(eventDetails?.eventType)),
              },
            ]?.map((metric, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl ${
                  isDark ? "bg-gray-800/50" : "bg-gray-50"
                }`}
              >
                <div className={`text-sm mb-2 ${textTertiary}`}>
                  {metric.label}
                </div>
                <div className="flex gap-2">
                  <div className={`text-3xl font-bold ${textPrimary}`}>
                    {metric.value}
                  </div>
                  {metric.sub && (
                    <div className="text-sm text-teal-500 mt-2">
                      {metric.sub}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <TabsSection
            t={tc}
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
