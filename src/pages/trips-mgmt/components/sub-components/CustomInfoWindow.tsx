import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { addSelectedStation } from "@/features/stationsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useGetStationDetailsQuery } from "@/store/api/tripsQueryApi";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";

interface CustomInfoWindowProps {
  isHebrew: boolean;
  markers: any[];
  clickedStation: IClickedStationProps;
  setIsModalClose?: (isClose: boolean) => void;
}

const CustomInfoWindow = ({
  markers,
  clickedStation,
  setIsModalClose,
}: CustomInfoWindowProps) => {
  const { t } = useTranslation("common");
  const { isRTL } = useThemeClasses();
  const dispatch = useAppDispatch();

  const { data, isLoading, isFetching } = useGetStationDetailsQuery(
    clickedStation?.stationId,
  );
  const stationDetails = data?.[0];

  const selectedStationList = useAppSelector(
    (state) => state.stations.selectedStationList,
  );
  const isStationSelected = (stationId: string) =>
    selectedStationList.some((s) => s._id === stationId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  const handlePrev = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex((prev) => prev - 1);
    }
  };
  const handleNext = () => {
    if (activeImageIndex < (stationDetails?.images?.length ?? 0) - 1) {
      setActiveImageIndex((prev) => prev + 1);
    }
  };

  function handleAddStationOnRoute() {
    if (!stationDetails) return;
    dispatch(
      addSelectedStation({
        station: markers?.find((item) => item._id === stationDetails._id),
        clickedStation,
        details: stationDetails,
      }),
    );
    setIsModalClose?.(true);
  }

  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const updateSize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const getCardSize = () => {
    const smallestSide = Math.min(windowWidth, windowHeight);

    if (smallestSide < 320) {
      return { size: 140, fontSize: "xs", logoSize: 28, iconSize: 28 };
    } else if (smallestSide < 375) {
      return { size: 160, fontSize: "sm", logoSize: 32, iconSize: 30 };
    } else if (smallestSide < 768) {
      return { size: 200, fontSize: "base", logoSize: 36, iconSize: 32 };
    } else if (smallestSide < 1024) {
      return { size: 240, fontSize: "base", logoSize: 40, iconSize: 34 };
    } else {
      return { size: 280, fontSize: "lg", logoSize: 44, iconSize: 36 };
    }
  };

  const cardConfig = getCardSize();

  if (isFetching || isLoading) {
    return (
      <div
        className="rounded-md bg-gray-200 animate-pulse flex items-center justify-center border-2 border-white aspect-square"
        style={{
          width: `${cardConfig.size}px`,
          height: `${cardConfig.size}px`,
        }}
      >
        <div
          style={{
            width: `${cardConfig.size}px`,
            height: `${cardConfig.size}px`,
          }}
          className={clsx("skeleton")}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-md bg-white border-2 border-white relative z-50 overflow-hidden aspect-square"
      style={{ width: `${cardConfig.size}px`, height: `${cardConfig.size}px` }}
    >
      {/* Background Image */}
      <ImageWithFallback
        width={cardConfig.size}
        height={cardConfig.size}
        src={
          stationDetails?.images?.[activeImageIndex]?.image ||
          "/assets/img/image-placeholder.jpg"
        }
        alt={stationDetails?.images?.[activeImageIndex]?.alt || "station image"}
        className="object-cover w-full h-full rounded-md overflow-hidden"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 rounded-md bg-linear-to-t from-black/60 via-black/20 to-black/10" />

      {/* Top Section */}
      <div className="absolute top-0 right-0 w-full z-20">
        <div className="flex items-center justify-between w-full p-2 overflow-hidden">
          <button
            type="button"
            onClick={handleAddStationOnRoute}
            disabled={isStationSelected(stationDetails?._id ?? "")}
            className={`
              ${
                !isStationSelected(stationDetails?._id ?? "")
                  ? "bg-eventGreen"
                  : "bg-gray-200 cursor-not-allowed"
              } text-white rounded-4xl px-6 py-1.5 text-${cardConfig.fontSize} font-bold whitespace-nowrap`}
          >
            <span>
              {isStationSelected(stationDetails?._id ?? "")
                ? t("added")
                : t("add")}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-2 right-0 z-20 w-full">
        <div className="px-2 pb-2 space-y-1">
          <div className="font-bold text-white px-4 mb-2">
            <h3 className={`text-${cardConfig.fontSize} leading-tight mb-0.5`}>
              {stationDetails?.name}
            </h3>
            <div
              dangerouslySetInnerHTML={{
                __html: stationDetails?.description || "",
              }}
              className={`line-clamp-1 text-xs opacity-90`}
            />
          </div>

          <div
            className={`flex items-center justify-between w-full ${
              isRTL ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeImageIndex === 0}
              className="disabled:opacity-50 cursor-pointer"
            >
              <CircleChevronLeft />
            </button>

            <div className="flex items-center gap-1.5">
              {stationDetails?.images
                ?.slice(0, 5)
                ?.map((_: any, index: number) => {
                  const isActive = index === activeImageIndex;
                  return (
                    <span
                      key={index}
                      className={`${
                        isActive
                          ? "w-2 h-2 bg-white"
                          : "w-1.5 h-1.5 bg-gray-400"
                      } rounded-full transition-all duration-300`}
                    />
                  );
                })}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={
                activeImageIndex === (stationDetails?.images?.length ?? 0) - 1
              }
              className="disabled:opacity-50 cursor-pointer"
            >
              <CircleChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomInfoWindow;
