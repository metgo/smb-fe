"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Heart,
  Share2,
  Phone,
  Mail,
  Accessibility,
  Car,
  PawPrint,
  Navigation,
  MapPinned,
} from "lucide-react";
import { BusinessProducts, OpeningHoursModal } from ".";
import UrlCopyInfoModal from "../../_components/UrlCopyInfoModal";
import { sanitizeHtml } from "@/lib/helpers";
import { Map } from "../../_components";
import { sendGAEvent } from "@/lib/analytics";
import { triggerName } from "@/lib/googleEventsConfig";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";

function DescriptionBlock({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setIsClamped(ref.current.scrollHeight > ref.current.clientHeight);
    }
  }, [html]);

  return (
    <div>
      <div
        ref={ref}
        className={`text-base sm:text-lg leading-relaxed text-gray-700 overflow-hidden ${!expanded ? "line-clamp-2" : ""}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      />
      {(isClamped || expanded) && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-sm font-medium text-blue-600 underline cursor-pointer"
        >
          {expanded ? "קרא פחות" : "קרא עוד"}
        </button>
      )}
    </div>
  );
}

interface Props {
  businessDetails: BusinessDetailsProps;
}

const getAttributeIcon = (name: string) => {
  const lower = (name ?? "").toLowerCase();
  if (lower.includes("נגיש") || lower.includes("accessible"))
    return <Accessibility className="w-4 h-4" />;
  if (lower.includes("חניה") || lower.includes("parking"))
    return <Car className="w-4 h-4" />;
  if (lower.includes("חיות") || lower.includes("pet"))
    return <PawPrint className="w-4 h-4" />;
  return null;
};

const BusinessDetailsContent = ({ businessDetails }: Props) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { addFavoriteFeedItemId, favoriteFeedItemIds } =
    useFavoriteFeedItemStore();

  useEffect(() => {
    const calculateIsOpen = () => {
      if (businessDetails.isAlwaysOpen) {
        setIsOpen(true);
        return;
      }

      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Map JS day number to your "days" format (SUN, MON, ...)
      const dayMap: Record<number, string> = {
        0: "SUN",
        1: "MON",
        2: "TUE",
        3: "WED",
        4: "THU",
        5: "FRI",
        6: "SAT",
      };

      const todayStr = dayMap[currentDay];
      const todayHours = businessDetails?.openingHrs?.find(
        (h) => h.days === todayStr,
      );

      if (
        !todayHours ||
        todayHours.isHoliday ||
        !todayHours.open ||
        !todayHours.close
      ) {
        setIsOpen(false);
        return;
      }

      // Parse open and close times (format "HH:mm")
      const [openH, openM] = todayHours.open.split(":").map(Number);
      const [closeH, closeM] = todayHours.close.split(":").map(Number);

      if (isNaN(openH) || isNaN(openM) || isNaN(closeH) || isNaN(closeM)) {
        setIsOpen(false);
        return;
      }

      // Convert everything to minutes since midnight for easy comparison
      const currentMinutes = currentHour * 60 + currentMinute;
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      // Handle overnight shifts (close time < open time, e.g. 22:00 -> 06:00 next day)
      const isCurrentlyOpen =
        closeMinutes > openMinutes
          ? currentMinutes >= openMinutes && currentMinutes < closeMinutes
          : currentMinutes >= openMinutes || currentMinutes < closeMinutes;

      setIsOpen(isCurrentlyOpen);
    };

    calculateIsOpen();

    // Re-check every minute so the status updates live
    const interval = setInterval(calculateIsOpen, 60000);

    return () => clearInterval(interval);
  }, [businessDetails.openingHrs, businessDetails.isAlwaysOpen]);

  const isFavorite = favoriteFeedItemIds.includes(businessDetails?._id);
  const images = businessDetails.images ?? [];

  const lat = businessDetails.geoLocation?.lat;
  const lng = businessDetails.geoLocation?.long;
  const phone =
    businessDetails.phoneNumber || businessDetails.contactDetails?.phone;
  const email =
    businessDetails.busiEmail || businessDetails.contactDetails?.email;
  const addressLabel = [
    businessDetails.address?.location,
    businessDetails.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const handleCopy = async () => {
    const url = window.location.href;
    try {
      sendGAEvent(triggerName.clickToShareUrl, { share_url: url });
      await navigator.clipboard.writeText(url);
      setShowShareModal(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    thumbnailRefs.current[selectedImage]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedImage]);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50">
      {showShareModal && (
        <UrlCopyInfoModal onClose={() => setShowShareModal(false)} />
      )}

      {showHoursModal && (
        <OpeningHoursModal
          setShowHoursModal={setShowHoursModal}
          openingHrs={businessDetails.openingHrs}
          isAlwaysOpen={businessDetails.isAlwaysOpen}
        />
      )}

      {/* Back Button & Action Buttons */}
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 md:pt-8 flex items-end justify-end">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <div className="flex gap-2 sm:gap-3 justify-start ">
            <motion.button
              onClick={() => addFavoriteFeedItemId(businessDetails?._id)}
              className="p-2.5 sm:p-3  cursor-pointer rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center bg-white"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={
                  isFavorite
                    ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, -5, 0] }
                    : {}
                }
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Heart
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              </motion.div>
            </motion.button>

            {lat && lng && (
              <a
                href={`https://waze.com/ul?ll=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center bg-white"
              >
                <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
              </a>
            )}

            {phone && (
              <a
                target="_blank"
                href={`tel:${phone}`}
                className="p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center bg-white"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </a>
            )}

            {email && (
              <a
                target="_blank"
                href={`mailto:${email}`}
                className="p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center bg-white"
              >
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </a>
            )}

            <button
              onClick={handleCopy}
              className="p-2.5 sm:p-3 rounded-2xl shadow-md hover:shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center bg-white"
            >
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl shadow-lg overflow-hidden mb-8 bg-white"
        >
          {/* Logo & Title Header */}
          <div className="relative p-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              {businessDetails.logo?.image && (
                <div className="flex-shrink-0">
                  <img
                    src={businessDetails.logo.image}
                    alt={businessDetails.logo.alt ?? businessDetails.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-xl ring-4 ring-white"
                  />
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                  {businessDetails.name}
                </h1>
                {businessDetails.shortDescription && (
                  <div
                    className="text-lg sm:text-xl text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(businessDetails?.shortDescription),
                    }}
                  />
                )}
              </div>

              {/* Open/Closed Badge */}
              <motion.button
                onClick={() => setShowHoursModal(true)}
                whileTap={{ scale: 0.95 }}
                className="absolute top-8 left-8 cursor-pointer"
              >
                {isOpen ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all bg-teal-500 hover:bg-teal-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white font-bold text-sm">
                      פתוח עכשיו
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all bg-red-500 hover:bg-red-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    <span className="text-white font-bold text-sm">סגור</span>
                  </div>
                )}
              </motion.button>
            </div>

            {/* Description */}
            {businessDetails.description && (
              <DescriptionBlock html={businessDetails.description} />
            )}
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div className="relative h-[400px] sm:h-[500px] bg-gray-200">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                src={images[selectedImage]?.image}
                alt={images[selectedImage]?.alt ?? businessDetails.name}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-xl hover:scale-110 hover:bg-gray-100 transition-all z-5"
                  >
                    <ArrowRight className="w-6 h-6 text-gray-900 rotate-180" />
                  </button>

                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-xl hover:scale-110 hover:bg-gray-100 transition-all z-5"
                  >
                    <ArrowRight className="w-6 h-6 text-gray-900" />
                  </button>

                  {/* Thumbnails */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-5">
                    <div className="flex gap-2">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-all ${
                            selectedImage === index
                              ? "ring-3 ring-teal-400 opacity-100 scale-105 shadow-2xl"
                              : "opacity-60 hover:opacity-100 hover:scale-105 shadow-xl"
                          }`}
                          style={{
                            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
                          }}
                          ref={(el) => {
                            thumbnailRefs.current[index] = el;
                          }}
                        >
                          <img
                            src={img.image}
                            alt={img.alt ?? `תמונה ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Attributes Section */}
        {((businessDetails.groupTypesId?.length ?? 0) > 0 ||
          (businessDetails.accessibilitiesId?.length ?? 0) > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl shadow-lg p-8 mb-8 bg-white"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              פרטים שחשוב להכיר
            </h2>

            <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2">
              {businessDetails.groupTypesId?.map((attr) => (
                <div
                  key={attr._id}
                  className="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap bg-gray-100 text-gray-700"
                >
                  <span className="text-sm font-medium">
                    {attr.hebrewName || attr.name}
                  </span>
                </div>
              ))}

              {businessDetails.accessibilitiesId?.map((attr) => {
                const icon = getAttributeIcon(attr.hebrewName || attr.name);
                return (
                  <div
                    key={attr._id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap bg-gray-100 text-gray-700"
                  >
                    {icon}
                    <span className="text-sm font-medium">
                      {attr.hebrewName || attr.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Products Section */}
        <BusinessProducts bussinessId={businessDetails._id} />

        {/* Map Section */}
        {lat && lng && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl shadow-lg overflow-hidden bg-white"
          >
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <MapPinned className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  אנחנו על המפה
                </h2>
              </div>
              {addressLabel && (
                <p className="text-gray-500 text-sm">{addressLabel}</p>
              )}
            </div>
            <Map
              className="w-full flex-initial h-[35vh]"
              primaryCategoryId={businessDetails?.primaryCategoryId}
              geoLocation={businessDetails?.geoLocation}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BusinessDetailsContent;
