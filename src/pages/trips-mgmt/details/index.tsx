import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Edit } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { routes } from "@/lib/routes";
import { tripTabs } from "@/constants/tabs";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Spinner, TabsSection } from "@/components/shared";
import { BackToListBtn, StatusChangeBtn } from "@/components/btns";
import {
  DetailTitleSection,
  MediaDetails,
} from "@/components/details-sections";
import { useGetTripByIdQuery } from "@/store/api/tripsQueryApi";
import { useUpdateTripMutation } from "@/store/api/tripsMutationApi";

import { CreateTripWizard } from "../components";
import {
  TripInfoDetails,
  TripItineraryDetails,
  TripStationsDetails,
} from "./components";
import { skipToken } from "@reduxjs/toolkit/query";

export default function TripDetailsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation("trips");
  const { t: tc } = useTranslation("common");
  const { t: tt } = useTranslation("toast");

  const tripId = searchParams.get("tripId") ?? "";

  const { isDark } = useThemeClasses();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    data: trip,
    isLoading,
    isFetching,
    refetch,
  } = useGetTripByIdQuery(tripId ? tripId : skipToken);

  const [updateTrip] = useUpdateTripMutation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleClose = () => {
    refetch();
    setIsEditOpen(false);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("id");
      return next;
    });
  };

  const handleEditOpen = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("id", tripId);
      return next;
    });
    setIsEditOpen(true);
  };

  const onStatusChangeHandler = async (status: string) => {
    if (!tripId) return;
    try {
      await updateTrip({
        tripId,
        body: { status: status.toUpperCase() },
      }).unwrap();
      refetch();
      toast.success(tt("trip_status_updated_success"));
    } catch (error) {
      toast.error(tt("trip_status_updated_faild"));
      console.error(error);
    }
  };

  const renderContent = () => {
    const tripImages = trip?.images ?? [];

    switch (activeTab) {
      case "overview":
        return <TripInfoDetails t={t} trip={trip} />;
      case "stations":
        return <TripStationsDetails t={t} stations={trip?.stations} />;
      case "itenary":
        return <TripItineraryDetails t={t} itenary={trip?.itenary} />;
      case "media":
        return <MediaDetails images={tripImages} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden relative pt-10 md:py-8">
      <Spinner isLoading={isLoading || isFetching} />

      <div className="flex items-center justify-between mb-3 shrink-0">
        <BackToListBtn navPath={routes.tripsMgmt} />

        <div className="flex items-center gap-3">
          <StatusChangeBtn
            status={trip?.status as TStatus}
            handleStatusChange={onStatusChangeHandler}
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
              <span className="text-sm font-medium">{tc("actions")}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg border z-50 overflow-hidden ${
                  isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <button
                  onClick={() => {
                    handleEditOpen();
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                    isDark
                      ? "text-teal-400 hover:bg-gray-800"
                      : "text-teal-700 hover:bg-gray-50"
                  }`}
                >
                  <Edit className="w-4 h-4 shrink-0" />
                  {tc("edit")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="details-top shrink-0">
        <DetailTitleSection
          name={trip?.name ?? ""}
          nameHe=""
          nameAr=""
          impact={0}
          completionPercent={0}
          createdAt={trip?.createdAt ?? ""}
          updatedAt={trip?.updatedAt ?? ""}
          imageSrc={trip?.images?.find((item) => item.isPrimary)?.image ?? ""}
        />
      </div>

      <div className="mt-6 flex flex-col flex-1 min-h-0">
        <div className="shrink-0">
          <TabsSection
            tabs={tripTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="details-content flex-1 overflow-y-auto min-h-0">
          {renderContent()}
        </div>
      </div>

      {isEditOpen && <CreateTripWizard onClose={handleClose} />}
    </div>
  );
}
