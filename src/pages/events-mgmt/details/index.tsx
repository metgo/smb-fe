import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Edit } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
} from "@/store/api/eventQueryApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import { CreateEventWizard } from "../components";
import { StatusChangeBtn } from "@/components/btns";
import { useUpdateEventMutation } from "@/store/api/eventMutationApi";
import { toast } from "sonner";
import {
  AttributesDetails,
  LocationDetails,
  MediaDetails,
} from "@/components/details-sections";
import { TabsSection } from "@/components/shared";
import { eventTabs } from "@/constants/tabs";

export default function EventDetailsPage() {
  const { t } = useTranslation("businesses");
  const { t: tc } = useTranslation("common");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") || "";

  const { isDark, bgPrimary } = useThemeClasses();
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
            t={t}
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
            t={t}
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
          <button
            onClick={() => navigate(routes.eventsMgmt)}
            className={clsx(
              "flex items-center gap-2 text-sm hover:text-teal-600 transition-colors",
              isDark ? "text-gray-300" : "text-gray-700",
            )}
          >
            <ArrowLeft className="w-5 h-5" />
            {t("back_to_list")}
          </button>

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
