import React from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface RegistrantDetailModalProps {
  selectedRegistrant: Registrant | null;
  setSelectedRegistrant: React.Dispatch<
    React.SetStateAction<Registrant | null>
  >;
}

const RegistrantDetailModal: React.FC<RegistrantDetailModalProps> = ({
  selectedRegistrant,
  setSelectedRegistrant,
}) => {
  const { t } = useTranslation("events");
  const { textPrimary, textTertiary } = useThemeClasses();
  const { theme } = useAppSelector((state) => state.settings);

  if (!selectedRegistrant) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return t("paid");
      case "pending":
        return t("pending");
      case "refunded":
        return t("refunded");
      default:
        return status;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedRegistrant(null);
      }}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className={`text-2xl font-bold ${textPrimary}`}>
            {t("registrant_details")}
          </h3>
          <button
            onClick={() => setSelectedRegistrant(null)}
            className={`p-3 rounded-xl transition-all ${
              theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          >
            <X className={`w-6 h-6 ${textTertiary}`} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info */}
            <div>
              <label
                className={`block text-xs font-medium mb-2 ${textTertiary}`}
              >
                {t("full_name")}
              </label>
              <p className={`text-lg font-semibold ${textPrimary}`}>
                {selectedRegistrant.fullName}
              </p>
            </div>

            <div>
              <label
                className={`block text-xs font-medium mb-2 ${textTertiary}`}
              >
                {t("phone")}
              </label>
              <p className={`text-lg ${textPrimary}`}>
                {selectedRegistrant.phone}
              </p>
            </div>

            <div className="md:col-span-2">
              <label
                className={`block text-xs font-medium mb-2 ${textTertiary}`}
              >
                {t("email")}
              </label>
              <p className={`text-lg ${textPrimary}`}>
                {selectedRegistrant.email}
              </p>
            </div>

            {/* Ticket Details */}
            <div>
              <label
                className={`block text-xs font-medium mb-2 ${textTertiary}`}
              >
                {t("quantity")}
              </label>
              <p className={`text-lg ${textPrimary}`}>
                {selectedRegistrant.quantity} {t("tickets")}
              </p>
            </div>

            <div>
              <label
                className={`block text-xs font-medium mb-2 ${textTertiary}`}
              >
                {t("ticket_type")}
              </label>
              <p className={`text-lg ${textPrimary}`}>
                {selectedRegistrant.ticketType}
              </p>
            </div>

            <div>
              <label
                className={`block text-xs font-medium mb-2 ${textTertiary}`}
              >
                {t("total")} {t("price")}
              </label>
              <p className={`text-lg font-bold text-teal-500`}>
                ₪{selectedRegistrant.totalPrice}
              </p>
            </div>

            <div>
              <label
                className={`block text-xs font-medium mb-2 ${textTertiary}`}
              >
                {t("payment_status")}
              </label>
              <p className={`text-lg capitalize ${textPrimary}`}>
                {getPaymentStatusText(selectedRegistrant.paymentStatus)}
              </p>
            </div>

            <div>
              <label
                className={`block text-xs font-medium mb-2 ${textTertiary}`}
              >
                {t("registration_date")}
              </label>
              <p className={`text-lg ${textPrimary}`}>
                {formatDate(selectedRegistrant.registrationDate)}
              </p>
            </div>

            <div>
              <label
                className={`block text-xs font-medium mb-2 ${textTertiary}`}
              >
                {t("source_website")}
              </label>
              <p className={`text-lg ${textPrimary}`}>
                {selectedRegistrant.sourceWebsite}
              </p>
            </div>

            {/* Attending Days (Multi-day events) */}
            {selectedRegistrant.attendingDays &&
              selectedRegistrant.attendingDays.length > 0 && (
                <div className="md:col-span-2">
                  <label
                    className={`block text-xs font-medium mb-3 ${textTertiary}`}
                  >
                    {t("attending_days")}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {selectedRegistrant.attendingDays.map((day, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-teal-500/20 text-teal-500 rounded-xl text-sm font-medium flex items-center"
                      >
                        {formatShortDate(day)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrantDetailModal;
