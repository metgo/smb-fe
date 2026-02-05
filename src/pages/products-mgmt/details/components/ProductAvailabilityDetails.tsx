import React from "react";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProductAvailability {
  activeStartDate: string | null;
  activeEndDate: string | null;
}

interface ProductAvailabilityDetailsProps {
  product: ProductAvailability;
  theme: Theme;
  language: Language;
}

const ProductAvailabilityDetails: React.FC<ProductAvailabilityDetailsProps> = ({
  product,
  theme,
  language,
}) => {
  const { t } = useTranslation("products");

  const { activeStartDate, activeEndDate } = product;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(language);

  const availabilityStatus = () => {
    if (!activeStartDate && !activeEndDate) {
      return t("always_available");
    }

    if (activeStartDate && !activeEndDate) {
      return `${t("available_from")} ${formatDate(activeStartDate)}`;
    }

    if (!activeStartDate && activeEndDate) {
      return `${t("available_until")} ${formatDate(activeEndDate)}`;
    }

    return `${formatDate(activeStartDate!)} - ${formatDate(activeEndDate!)}`;
  };

  return (
    <div className="space-y-6">
      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date */}
        <div
          className={`p-4 rounded-lg border ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h3
            className={`text-sm mb-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("start_date")}
          </h3>

          <div
            className={`flex items-center gap-2 ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <p className="text-xl font-semibold">
              {activeStartDate ? formatDate(activeStartDate) : t("not_set")}
            </p>
          </div>
        </div>

        {/* End Date */}
        <div
          className={`p-4 rounded-lg border ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h3
            className={`text-sm mb-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("end_date")}
          </h3>

          <div
            className={`flex items-center gap-2 ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <p className="text-xl font-semibold">
              {activeEndDate ? formatDate(activeEndDate) : t("not_set")}
            </p>
          </div>
        </div>
      </div>

      {/* Availability Status */}
      <div
        className={`p-4 rounded-lg border ${
          theme === "dark"
            ? "border-teal-700 bg-teal-950/30"
            : "border-teal-200 bg-teal-50"
        }`}
      >
        <h3
          className={`text-sm mb-2 ${
            theme === "dark" ? "text-teal-400" : "text-teal-700"
          }`}
        >
          {t("availability_status")}
        </h3>

        <p
          className={`text-lg ${
            theme === "dark" ? "text-teal-300" : "text-teal-800"
          }`}
        >
          {availabilityStatus()}
        </p>
      </div>
    </div>
  );
};

export default ProductAvailabilityDetails;
