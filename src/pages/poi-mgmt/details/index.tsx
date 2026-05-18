import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Edit,
  Eye,
  MoreHorizontal,
  MousePointer,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { PoiInfoDetails } from "./components";
import { routes } from "@/lib/routes";
import { skipToken } from "@reduxjs/toolkit/query";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { PageStats, Spinner, TabsSection } from "@/components/shared";
import {
  useGetPoiByIdQuery,
  useGetIndividualPoiStatsQuery,
} from "@/store/api/poiQueryApi";
import { BackToListBtn, StatusChangeBtn } from "@/components/btns";
import { useUpdatePoiMutation } from "@/store/api/poiMutationApi";
import { CreatePoiWizard } from "../components";
import {
  AttributesDetails,
  DetailTitleSection,
  LocationDetails,
  MediaDetails,
} from "@/components/details-sections";
import { poiTabs } from "@/constants/tabs";
import { IOpMode } from "@/enums/operation.types";

export default function PoiDetailsPage() {
  const [searchParams] = useSearchParams();

  const { t } = useTranslation("poi");
  const { t: tt } = useTranslation("toast");

  const { borderColor, isDark } = useThemeClasses();
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

  const poiId = searchParams.get("poiId") ?? "";

  const {
    data,
    refetch,
    isLoading: isDetailStatsLoading,
  } = useGetIndividualPoiStatsQuery({ poiId }, { skip: !poiId });

  const poiStats = [
    {
      icon: <Eye className="w-5 h-5 text-green-600" />,
      title: t("page_views"),
      value: data?.pageViews?.toLocaleString() || "0",
    },
    {
      icon: <Users className="w-5 h-5 text-green-600" />,
      title: t("active_users"),
      value: data?.activeUsers?.toLocaleString() || "0",
    },
    {
      icon: <Users className="w-5 h-5 text-green-600" />,
      title: t("unique_visitors"),
      value: data?.totalUniqueVisitors?.toLocaleString() || "0",
    },
    {
      icon: <MousePointer className="w-5 h-5 text-green-600" />,
      title: t("clicks"),
      value: data?.clicks?.toLocaleString() || "0",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      title: t("views_per_user"),
      value: data?.viewsPerUser || "0",
    },
    {
      icon: <Timer className="w-5 h-5 text-green-600" />,
      title: t("avg_time_on_page"),
      value: data?.averageEngagementTime || "0s",
    },
  ];

  const {
    data: poi,
    refetch: poiDataRefetch,
    isLoading,
  } = useGetPoiByIdQuery(poiId ? { poiId } : skipToken);
  const [updatePoi] = useUpdatePoiMutation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditClicked, setIsEditClicked] = useState(false);

  useEffect(() => {
    if (!isEditClicked) poiDataRefetch();
  }, [isEditClicked]);

  const handleMutateData = () => {
    setIsEditClicked(true);
  };

  const onStatusChangeHandler = async (status: string) => {
    try {
      await updatePoi({
        poiId,
        body: { status: status.toUpperCase() },
      }).unwrap();
      toast.success(tt("poi_status_update_success"));
      refetch();
    } catch (error) {
      toast.error(tt("poi_status_update_failed"));
      console.error(error);
    }
  };

  const renderContent = () => {
    const mediaProps = {
      images: (poi?.images ?? []).map((img: IImage) => ({
        previewUrl: img.image,
      })),
      primaryImageIndex: 0,
    };

    switch (activeTab) {
      case "overview":
        return <PoiInfoDetails t={t} poi={poi} />;
      case "location":
        return (
          <LocationDetails
            purpose="POI"
            address={poi?.address}
            lat={poi?.geoLocation?.lat ?? poi?.location?.coordinates?.[0]}
            lng={poi?.geoLocation?.long ?? poi?.location?.coordinates?.[1]}
          />
        );
      case "media":
        return <MediaDetails {...mediaProps} />;
      case "accessibility":
        return (
          <AttributesDetails
            categoriesId={[poi?.primaryCategoryId]}
            groupTypesId={poi?.groupTypesId}
            accessibilitiesId={poi?.accessibilitiesId}
            tags={poi?.tagsId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col overflow-hidden relative h-[88vh]">
      <Spinner isLoading={isLoading} />

      <div className={clsx("shrink-0 border-b px-6 py-4", borderColor)}>
        <div className="flex items-center justify-between mb-4">
          <BackToListBtn navPath={routes.poiMgmt} />

          <div className="flex items-center gap-2">
            <StatusChangeBtn
              handleStatusChange={onStatusChangeHandler}
              status={poi?.status}
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
                <MoreHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">{t("actions")}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg border z-50 overflow-hidden ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <button
                    onClick={() => {
                      handleMutateData();
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${isDark ? "text-teal-400 hover:bg-gray-800" : "text-teal-700 hover:bg-gray-50"}`}
                  >
                    <Edit className="w-4 h-4 shrink-0" />
                    {t("edit")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DetailTitleSection {...poi} />
        <PageStats
          stats={poiStats}
          isLoading={isDetailStatsLoading}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 mt-3 gap-4"
        />
        <TabsSection
          tabs={poiTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

      {isEditClicked && (
        <CreatePoiWizard
          editData={poi}
          onClose={() => setIsEditClicked(false)}
          refetch={refetch}
          opMode={IOpMode.EDIT}
        />
      )}
    </div>
  );
}
