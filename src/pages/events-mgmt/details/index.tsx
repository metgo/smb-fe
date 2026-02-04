import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Edit } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAppSelector } from "@/hooks/hooks";
import {
  EventAttributesDetails,
  EventDateTimeDetails,
  EventInfoDetails,
  EventLocationDetails,
  EventMediaDetails,
  EventScheduledNotificationDetails,
  EventTicketDetails,
  EventTitleSection,
  TabsSection,
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

export default function EventDetailsPage() {
  const { t } = useTranslation("businesses");

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
      setGalleryImages(eventDetails?.images);
      setEventDays(eventDetails?.dayDescription);
    }
  }, [eventDetails, eventId]);

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
      const res = await updateEvent({
        eventId,
        body: { status: status.toUpperCase() },
      });

      if (res) {
        refetch();
        toast.success("Event status updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update event status.");
      console.error("Error:", error);
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
        return <EventDateTimeDetails {...eventDetails} />;
      case "location":
        return <EventLocationDetails {...commonProps} />;
      case "media":
        return <EventMediaDetails {...mediaProps} />;
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
        return <EventScheduledNotificationDetails {...eventDetails} />;
      case "attributes":
        return <EventAttributesDetails {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div
          className={`border-b ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} px-6 py-4 sticky w-full`}
        >
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(routes.eventsMgmt)}
              className={`flex items-center gap-2 text-sm hover:text-teal-600 transition-colors ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              {t("back_to_list")}
            </button>

            <div className="flex items-center gap-2">
              {userRole === UserRole.SUPERADMIN && (
                <StatusChangeBtn
                  handleStatusChange={onStatusChangeHandler}
                  status={eventDetails?.status}
                />
              )}
              <button
                onClick={() => setIsEditOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {t("edit")}
              </button>
            </div>
          </div>

          <EventTitleSection {...eventDetails} />
          <TabsSection activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Content */}
        <div className={clsx("flex-1 overflow-auto p-6 ", bgPrimary)}>
          {renderContent()}
        </div>
      </div>

      {isEditOpen && (
        <CreateEventWizard isOpen={isEditOpen} onClose={handleClose} />
      )}
    </>
  );
}
