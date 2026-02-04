import type { FC } from "react";
import {
  Truck,
  ArrowLeft,
  FileText,
  CheckCircle,
  Package,
  LocationEdit,
  MapPin,
  House,
  IndianRupee,
} from "lucide-react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";

/* ---------- Types ---------- */

type Theme = "light" | "dark";
interface PickupLocation {
  address: string;
  isAlwaysOpen?: boolean;
  openingHrs?: any[];
}

interface DeliveryAreaItem {
  area?: string;
  price?: string | number;
  pickUpLocation?: PickupLocation[];
}
interface BusinessDeliveryData {
  deliveryAdditionalInfo?: string;
  deliveryReturnExchange?: string[];
  deliverySpecificSellerInfo?: string[];
  deliveryArea?: DeliveryAreaItem[];
}

interface BusinessDeliveryPolicyDetailsProps {
  theme: Theme;
  t: (key: string) => string;
  business: BusinessDeliveryData;
}

/* ---------- Component ---------- */

const BusinessDeliveryPolicyDetails: FC<BusinessDeliveryPolicyDetailsProps> = ({
  theme,
  t,
  business,
}) => {
  const { isDark } = useThemeClasses();

  const hasDeliveryInfo =
    business.deliveryAdditionalInfo ||
    (business.deliveryReturnExchange &&
      business.deliveryReturnExchange.length > 0) ||
    (business.deliverySpecificSellerInfo &&
      business.deliverySpecificSellerInfo.length > 0) ||
    (business.deliveryArea && business.deliveryArea?.length > 0);

  if (!hasDeliveryInfo) {
    return (
      <div
        className={`p-8 text-center rounded-lg border ${
          theme === "dark"
            ? "bg-gray-800/30 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <Package
          className={`w-16 h-16 mx-auto mb-4 ${
            theme === "dark" ? "text-gray-600" : "text-gray-400"
          }`}
        />
        <p
          className={`text-lg mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("no_delivery_policy")}
        </p>
        <p
          className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
        >
          {t("add_delivery_policy_description")}
        </p>
      </div>
    );
  }

  console.log(
    "BusinessDeliveryPolicyDetails ~ business:",
    business?.deliveryArea,
  );
  return (
    <div className="space-y-6">
      {/* Additional Delivery Information */}
      {business.deliveryAdditionalInfo && (
        <div
          className={`p-4 rounded-lg border ${
            theme === "dark"
              ? "bg-gray-800/50 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-2 rounded-lg ${theme === "dark" ? "bg-teal-900/30" : "bg-teal-100"}`}
            >
              <Truck
                className={`w-5 h-5 ${theme === "dark" ? "text-teal-400" : "text-teal-700"}`}
              />
            </div>
            <h3
              className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
            >
              {t("delivery_additional_info")}
            </h3>
          </div>
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} whitespace-pre-line`}
          >
            {business.deliveryAdditionalInfo}
          </p>
        </div>
      )}

      {/* Return & Exchange Policy */}
      {business.deliveryReturnExchange &&
        business.deliveryReturnExchange.length > 0 && (
          <div
            className={`p-4 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"}`}
              >
                <ArrowLeft
                  className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}
                />
              </div>
              <h3
                className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
              >
                {t("return_exchange_policy")}
              </h3>
            </div>
            <ul className="space-y-2">
              {business.deliveryReturnExchange.map((policy, idx) => (
                <li
                  key={idx}
                  className={`flex items-start gap-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  <CheckCircle
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}
                  />
                  <span>{policy}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      {/* Delivery Area */}
      {business.deliveryArea && business.deliveryArea.length > 0 && (
        <div
          className={`p-4 rounded-lg ${
            theme === "dark" ? "" : "border-gray-200"
          }`}
        >
          {business.deliveryArea.map((deliveryArea, areaIdx) => (
            <div
              key={areaIdx}
              className={`mb-6 p-4 gap-5 flex flex-col rounded-lg ${
                theme === "dark"
                  ? "bg-gray-900 border border-gray-700"
                  : "border border-gray-200 shadow-sm"
              }`}
            >
              <div className="grid grid-cols-12 gap-3 mb-3">
                {/* Area */}
                <div className="col-span-5">
                  <label
                    className={` text-md mb-1 font-semibold flex items-center gap-2 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <Truck size={16} />
                    {t("delivery_area")}
                  </label>

                  <p
                    className={`text-lg ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {deliveryArea.area ? deliveryArea.area : "-"}
                  </p>
                </div>

                {/* Price */}
                <div className="col-span-3">
                  <label
                    className={` text-md mb-1 font-semibold flex items-center gap-2 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <IndianRupee size={16} />
                    {t("delivery_price")}
                  </label>

                  <p
                    className={`text-md ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {deliveryArea.price ? deliveryArea.price : "-"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col">
                {/* Pickup locations title */}
                <div
                  className={`font-semibold flex items-center gap-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <House size={16} className="" />

                  <div>{t("pickup_locations")}:</div>
                </div>
                <div className="flex gap-20">
                  {deliveryArea.pickUpLocation &&
                  deliveryArea.pickUpLocation.length > 0 ? (
                    deliveryArea.pickUpLocation.map((pickup, pickupIdx) => (
                      <div
                        key={pickupIdx}
                        className="py-3 mb-2 rounded-md dark:bg-gray-800"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`font-semibold mb-2 flex items-center gap-2 ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            {pickup.address}
                          </div>
                        </div>

                        {/* Opening Hours or 24/7 */}
                        {pickup.isAlwaysOpen ? (
                          <div className="text-sm  bg-green-600 text-white px-2 py-2 rounded-sm dark:text-gray-400">
                            {t("open_24_7")}
                          </div>
                        ) : pickup.openingHrs &&
                          pickup.openingHrs.length > 0 ? (
                          <div
                            className={`text-sm flex flex-col gap-4 ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {pickup.openingHrs.map((hours, idx) => (
                              <div
                                key={idx}
                                className="flex justify-start gap-3"
                              >
                                <span className="font-medium">
                                  {hours.day}:
                                </span>
                                <span>
                                  {hours.open} - {hours.close}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {/* Fallback if no hours and not always open */}
                            {t("no_opening_hours_available")}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      -
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Specific Seller Information */}
      {business.deliverySpecificSellerInfo &&
        business.deliverySpecificSellerInfo.length > 0 && (
          <div
            className={`p-4 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${theme === "dark" ? "bg-purple-900/30" : "bg-purple-100"}`}
              >
                <FileText
                  className={`w-5 h-5 ${theme === "dark" ? "text-purple-400" : "text-purple-700"}`}
                />
              </div>
              <h3
                className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
              >
                {t("delivery_specific_seller_info")}
              </h3>
            </div>
            <ul className="space-y-2">
              {business.deliverySpecificSellerInfo.map((info, idx) => (
                <li
                  key={idx}
                  className={`flex items-start gap-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  <CheckCircle
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}
                  />
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
};

export default BusinessDeliveryPolicyDetails;
