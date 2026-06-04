import type { FC } from "react";
import {
  Truck,
  ArrowLeft,
  FileText,
  CheckCircle,
  Package,
  House,
  IndianRupee,
  Globe,
} from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

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
interface DeliveryData {
  deliveryAdditionalInfo?: string;
  deliveryReturnExchange?: string[];
  deliverySpecificSellerInfo?: string[];
  deliveryArea?: DeliveryAreaItem[];
  vendorDelivers?: boolean;
  vendorDeliveryArea?: DeliveryAreaItem[];
  globalDelivery?: boolean;
  globalDeliveryArea?: DeliveryAreaItem[];
}

interface DeliveryPolicyOptionDetailsProps {
  data: DeliveryData;
  isProduct?: boolean;
}

/* ---------- Component ---------- */

const DeliveryPolicyOptionDetails: FC<DeliveryPolicyOptionDetailsProps> = ({
  data,
  isProduct = false,
}) => {
  const { t } = useTranslation("businesses");
  const { isDark } = useThemeClasses();

  const hasDeliveryInfo =
    data?.deliveryAdditionalInfo ||
    (data?.deliveryReturnExchange && data?.deliveryReturnExchange.length > 0) ||
    (data?.deliverySpecificSellerInfo &&
      data?.deliverySpecificSellerInfo.length > 0) ||
    (data?.deliveryArea && data?.deliveryArea?.length > 0) ||
    (data?.vendorDelivers &&
      data?.vendorDeliveryArea &&
      data?.vendorDeliveryArea.length > 0) ||
    (!isProduct &&
      data?.globalDelivery &&
      data?.globalDeliveryArea &&
      data?.globalDeliveryArea.length > 0);

  if (!hasDeliveryInfo) {
    return (
      <div
        className={`p-8 text-center rounded-lg border ${
          isDark
            ? "bg-gray-800/30 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <Package
          className={`w-16 h-16 mx-auto mb-4 ${
            isDark ? "text-gray-600" : "text-gray-400"
          }`}
        />
        <p
          className={`text-lg mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("no_delivery_policy")}
        </p>
        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
          {t("add_delivery_policy_description")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Additional Delivery Information */}
      {data?.deliveryAdditionalInfo && (
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "bg-gray-800/50 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-2 rounded-lg ${isDark ? "bg-teal-900/30" : "bg-teal-100"}`}
            >
              <Truck
                className={`w-5 h-5 ${isDark ? "text-teal-400" : "text-teal-700"}`}
              />
            </div>
            <h3
              className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}
            >
              {t("delivery_additional_info")}
            </h3>
          </div>
          <p
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"} whitespace-pre-line`}
          >
            {data?.deliveryAdditionalInfo}
          </p>
        </div>
      )}

      {/* Return & Exchange Policy */}
      {data?.deliveryReturnExchange &&
        data?.deliveryReturnExchange.length > 0 && (
          <div
            className={`p-4 rounded-lg border ${
              isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${isDark ? "bg-blue-900/30" : "bg-blue-100"}`}
              >
                <ArrowLeft
                  className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-700"}`}
                />
              </div>
              <h3
                className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}
              >
                {t("return_exchange_policy")}
              </h3>
            </div>
            <ul className="space-y-2">
              {data?.deliveryReturnExchange.map((policy, idx) => (
                <li
                  key={idx}
                  className={`flex items-start gap-2 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  <CheckCircle
                    className={`w-4 h-4 mt-0.5 shrink-0 ${isDark ? "text-teal-400" : "text-teal-600"}`}
                  />
                  <span>{t(policy)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      {/* Delivery Area */}
      {data?.deliveryArea && data?.deliveryArea.length > 0 && (
        <div className={` rounded-lg ${isDark ? "" : "border-gray-200"}`}>
          {data?.deliveryArea.map((deliveryArea, areaIdx) => (
            <div
              key={areaIdx}
              className={` p-4 gap-5 flex flex-col rounded-lg ${
                isDark
                  ? "bg-gray-900 border border-gray-700"
                  : "border border-gray-200 shadow-sm"
              }`}
            >
              <div className="grid grid-cols-12 gap-3 mb-3">
                {/* Area */}
                <div className="col-span-5">
                  <label
                    className={` text-md mb-1 font-semibold flex items-center gap-2 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <Truck size={16} />
                    {t("delivery_area")}
                  </label>

                  <p
                    className={`text-lg ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {deliveryArea.area ? deliveryArea.area : "-"}
                  </p>
                </div>

                {/* Price */}
                <div className="col-span-3">
                  <label
                    className={` text-md mb-1 font-semibold flex items-center gap-2 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <IndianRupee size={16} />
                    {t("delivery_price")}
                  </label>

                  <p
                    className={`text-md ${
                      isDark ? "text-gray-200" : "text-gray-800"
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
                    isDark ? "text-gray-300" : "text-gray-700"
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
                              isDark ? "text-gray-300" : "text-gray-700"
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

      {/* Vendor Delivery Areas */}
      {data?.vendorDelivers &&
        data?.vendorDeliveryArea &&
        data?.vendorDeliveryArea.length > 0 && (
          <div className={`rounded-lg ${isDark ? "" : "border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Truck
                className={`w-5 h-5 ${isDark ? "text-teal-400" : "text-teal-600"}`}
              />
              <h3
                className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}
              >
                {t("vendor_delivers")}
              </h3>
            </div>
            {data.vendorDeliveryArea.map((deliveryArea, areaIdx) => (
              <div
                key={areaIdx}
                className={`p-4 gap-5 flex flex-col rounded-lg mb-3 ${
                  isDark
                    ? "bg-gray-900 border border-gray-700"
                    : "border border-gray-200 shadow-sm"
                }`}
              >
                <div className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-5">
                    <label
                      className={`text-md mb-1 font-semibold flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <Truck size={16} />
                      {t("delivery_area")}
                    </label>
                    <p
                      className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}
                    >
                      {deliveryArea.area ? deliveryArea.area : "-"}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <label
                      className={`text-md mb-1 font-semibold flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <IndianRupee size={16} />
                      {t("delivery_price")}
                    </label>
                    <p
                      className={`text-md ${isDark ? "text-gray-200" : "text-gray-800"}`}
                    >
                      {deliveryArea.price ? deliveryArea.price : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div
                    className={`font-semibold flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    <House size={16} />
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
                          <div
                            className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                          >
                            {pickup.address}
                          </div>
                          {pickup.isAlwaysOpen ? (
                            <div className="text-sm bg-green-600 text-white px-2 py-2 rounded-sm">
                              {t("open_24_7")}
                            </div>
                          ) : pickup.openingHrs &&
                            pickup.openingHrs.length > 0 ? (
                            <div
                              className={`text-sm flex flex-col gap-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
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

      {/* Global Delivery Areas */}
      {!isProduct &&
        data?.globalDelivery &&
        data?.globalDeliveryArea &&
        data?.globalDeliveryArea.length > 0 && (
          <div className={`rounded-lg ${isDark ? "" : "border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Globe
                className={`w-5 h-5 ${isDark ? "text-teal-400" : "text-teal-600"}`}
              />
              <h3
                className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}
              >
                {t("global_delivery")}
              </h3>
            </div>
            {data.globalDeliveryArea.map((deliveryArea, areaIdx) => (
              <div
                key={areaIdx}
                className={`p-4 gap-5 flex flex-col rounded-lg mb-3 ${
                  isDark
                    ? "bg-gray-900 border border-gray-700"
                    : "border border-gray-200 shadow-sm"
                }`}
              >
                <div className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-5">
                    <label
                      className={`text-md mb-1 font-semibold flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <Globe size={16} />
                      {t("delivery_area")}
                    </label>
                    <p
                      className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}
                    >
                      {deliveryArea.area ? deliveryArea.area : "-"}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <label
                      className={`text-md mb-1 font-semibold flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <IndianRupee size={16} />
                      {t("delivery_price")}
                    </label>
                    <p
                      className={`text-md ${isDark ? "text-gray-200" : "text-gray-800"}`}
                    >
                      {deliveryArea.price ? deliveryArea.price : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div
                    className={`font-semibold flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    <House size={16} />
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
                              className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                            >
                              {pickup.address}
                            </div>
                          </div>
                          {pickup.isAlwaysOpen ? (
                            <div className="text-sm bg-green-600 text-white px-2 py-2 rounded-sm">
                              {t("open_24_7")}
                            </div>
                          ) : pickup.openingHrs &&
                            pickup.openingHrs.length > 0 ? (
                            <div
                              className={`text-sm flex flex-col gap-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
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
      {data?.deliverySpecificSellerInfo &&
        data?.deliverySpecificSellerInfo.length > 0 && (
          <div
            className={`p-4 rounded-lg border ${
              isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${isDark ? "bg-purple-900/30" : "bg-purple-100"}`}
              >
                <FileText
                  className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-700"}`}
                />
              </div>
              <h3
                className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}
              >
                {t("delivery_specific_seller_info")}
              </h3>
            </div>
            <ul className="space-y-2">
              {data?.deliverySpecificSellerInfo.map((info, idx) => (
                <li
                  key={idx}
                  className={`flex items-start gap-2 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  <CheckCircle
                    className={`w-4 h-4 mt-0.5 shrink-0 ${isDark ? "text-teal-400" : "text-teal-600"}`}
                  />
                  <span>{t(info)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
};

export default DeliveryPolicyOptionDetails;
