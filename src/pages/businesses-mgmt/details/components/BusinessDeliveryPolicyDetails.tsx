import type { FC } from "react";
import {
  Truck,
  ArrowLeft,
  FileText,
  CheckCircle,
  Package,
  MapPin,
  LocationEdit,
} from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";

/* ---------- Types ---------- */

type Theme = "light" | "dark";
interface PickupLocation {
  address: string;
  isAlwaysOpen?: boolean;
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
  const { isRTL } = useAppSelector((state) => state.settings);

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
          className={`p-4 rounded-lg  ${
            theme === "dark" ? " " : " border-gray-200"
          }`}
        >
          {business.deliveryArea.map((deliveryArea, areaIdx) => (
            <div
              key={areaIdx}
              className={`mb-6 p-4 rounded-lg ${
                theme === "dark"
                  ? "bg-gray-900 border border-gray-700"
                  : " border border-gray-200 shadow-sm"
              }`}
            >
              <div className="grid grid-cols-12 gap-3 mb-3">
                {/* Area */}
                <div className="col-span-5">
                  <label
                    className={`block text-md mb-1 font-semibold ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("delivery_area")}
                  </label>

                  <p
                    className={`text-md ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {deliveryArea.area || (isRTL ? "באר שבע" : "Be'er Sheva")}
                  </p>
                </div>

                {/* Price */}
                <div className="col-span-3">
                  <label
                    className={`block text-md mb-1 font-semibold ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("delivery_price")}
                  </label>

                  <p
                    className={`text-md ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {deliveryArea.price}
                  </p>
                </div>
              </div>

              {/* Pickup locations title  */}
              <div
                className={`mb-2 font-semibold flex flex-wrap items-center gap-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <div>Pickup Locations:</div>
                {deliveryArea.pickUpLocation?.map((pickup, pickupIdx) => (
                  <div
                    key={pickupIdx}
                    className="border px-6 h-12 rounded-md mb-2 bg-white dark:bg-gray-800 flex items-center gap-2"
                  >
                    <LocationEdit size={16} className="text-green-500" />
                    <div className="flex items-center gap-5">
                      <div className="font-semibold">{pickup.address}</div>
                      {pickup.isAlwaysOpen && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t("open_24_7")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
