import { Activity, useState, type FC } from "react";
import { Plus, X, MapPin, Edit } from "lucide-react";
import PickupLocationModal from "./PickupLocationModal";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PickupLocation {
  address: string;
  isAlwaysOpen: boolean;
  openingHrs: string[];
}

interface DeliveryArea {
  area: string;
  price: string;
  pickUpLocation: PickupLocation[];
}
type View = "list" | "details" | "create" | "edit" | undefined;

interface BusinessDeliveryFormData {
  vendorDelivers: boolean;
  pickupAvailable: boolean;
  deliveryArea: DeliveryArea[];
  deliveryReturnExchange: string[];
  deliveryAdditionalInfo: string;
  deliverySpecificSellerInfo: string[];
}

interface BusinessDeliveryPolicyProps {
  theme: Theme;
  isRTL: boolean;
  currentView: View;

  formData: BusinessDeliveryFormData;
  setFormData: (data: BusinessDeliveryFormData) => void;
  business: any;
  t: (key: string) => string;
}

/* ---------------- Component ---------------- */

const BusinessDeliveryPolicy: FC<BusinessDeliveryPolicyProps> = ({
  t,
  theme,
  isRTL,
  formData,
  setFormData,
}) => {
  const [pickupLocationModal, setPickupLocationModal] = useState<{
    show: boolean;
    areaIndex: number;
    locationIndex: number | null;
    data: {
      address: string;
      isAlwaysOpen: boolean;
      openingHrs: { day: string; open: string; close: string }[];
    };
  } | null>(null);
  const { isDark } = useThemeClasses();
  //delete pickup
  const handleDeletePickup = (areaIdx: any, pickupIdx: any) => {
    const updatedAreas = formData.deliveryArea.map((area, idx) => {
      if (idx === areaIdx) {
        // Remove only the pickup at pickupIdx
        const updatedPickups = area.pickUpLocation.filter(
          (_, pIdx) => pIdx !== pickupIdx,
        );
        return { ...area, pickUpLocation: updatedPickups };
      }
      return area;
    });
    setFormData({ ...formData, deliveryArea: updatedAreas });
  };

  // Translated delivery options
  const DELIVERY_RETURN_EXCHANGE_OPTIONS = [
    t("return_option1"),
    t("return_option2"),
    t("return_option3"),
    t("return_option4"),
    t("return_option5"),
    t("return_option6"),
    t("return_option7"),
    t("return_option8"),
  ];
  const DELIVERY_SPECIFIC_SELLER_INFO_OPTIONS = [
    t("seller_info_option1"),
    t("seller_info_option2"),
    t("seller_info_option3"),
    t("seller_info_option4"),
    t("seller_info_option5"),
    t("seller_info_option6"),
    t("seller_info_option7"),
    t("seller_info_option8"),
    t("seller_info_option9"),
  ];

  return (
    <div className="space-y-6">
      <h3
        className={`text-lg ${
          theme === "dark" ? "text-gray-200" : "text-gray-800"
        }`}
      >
        {t("delivery")}
      </h3>

      {/* Delivery Options */}
      <div className="flex items-center gap-6">
        {/* <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.vendorDelivers}
            onChange={(e) =>
              setFormData({ ...formData, vendorDelivers: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <span
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {t("vendor_delivers")}
          </span>
        </label> */}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.pickupAvailable}
            onChange={(e) =>
              setFormData({ ...formData, pickupAvailable: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <span
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {t("pickup_available")}
          </span>
        </label>
      </div>

      {/* Delivery Areas */}
      {(formData.vendorDelivers || formData.pickupAvailable) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              className={`block text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("delivery_areas_pricing")}
            </label>

            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  deliveryArea: [
                    ...formData.deliveryArea,
                    { area: "", price: "", pickUpLocation: [] },
                  ],
                })
              }
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" />
              {t("add_area")}
            </button>
          </div>

          <div className="space-y-4">
            {formData.deliveryArea?.map((deliveryArea, areaIdx) => (
              <div
                key={areaIdx}
                className={`p-4 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="grid grid-cols-12 gap-3 mb-3">
                  {/* Area */}
                  {/* Delivery Area */}
                  <div className="col-span-5">
                    <label
                      className={`block text-xs mb-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("delivery_area")}
                    </label>

                    <input
                      type="text"
                      value={deliveryArea.area}
                      onChange={(e) => {
                        const areas = formData.deliveryArea.map((area, idx) =>
                          idx === areaIdx
                            ? { ...area, area: e.target.value }
                            : area,
                        );
                        setFormData({ ...formData, deliveryArea: areas });
                      }}
                      placeholder={isRTL ? "באר שבע" : "Be'er Sheva"}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500
                        ${
                          theme === "dark"
                            ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                        }
                      `}
                    />
                  </div>

                  {/* Price */}
                  <div className="col-span-3">
                    <label
                      className={`block text-xs mb-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("delivery_price")}
                    </label>

                    <input
                      type="number"
                      value={deliveryArea.price}
                      onChange={(e) => {
                        const areas = [...formData.deliveryArea];
                        areas[areaIdx].price = e.target.value;
                        setFormData({ ...formData, deliveryArea: areas });
                      }}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500
                      ${
                        theme === "dark"
                          ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      }
                    `}
                    />
                  </div>

                  {/* Add Location */}
                  <div className="col-span-3 flex items-end">
                    <button
                      onClick={() =>
                        setPickupLocationModal({
                          show: true,
                          areaIndex: areaIdx,
                          locationIndex: null,
                          data: {
                            address: "",
                            isAlwaysOpen: false,
                            openingHrs: [],
                          },
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border text-sm flex justify-center gap-1
                      ${
                        isDark
                          ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }
                    `}
                    >
                      <MapPin className="w-4 h-4" />
                      {t("add_location")}
                    </button>
                  </div>

                  {/* Delete */}
                  <div className="col-span-1 flex items-end">
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          deliveryArea: formData.deliveryArea?.filter(
                            (_, i) => i !== areaIdx,
                          ),
                        })
                      }
                      className="w-8 p-2 rounded-lg bg-red-600 text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {deliveryArea?.pickUpLocation.length > 0 && (
                  <label
                    className={`block text-xs mb-1 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {" "}
                    {t("pickup_locations")} :
                  </label>
                )}

                {deliveryArea?.pickUpLocation?.map((pickup, pickupIdx) => (
                  <div
                    key={pickupIdx}
                    className={`border p-3 rounded-md mb-2 ${
                      isDark
                        ? "bg-gray-800 text-white border-gray-700"
                        : "bg-white text-black border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1 ">
                      <div className="flex items-center gap-2 font-semibold ">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-green-500" />
                          {pickup.address}
                        </div>
                        <div className="flex items-center ">
                          {pickup.isAlwaysOpen && (
                            <span className="text-xs flex items-center bg-green-600 px-2 mt-2 py-1 rounded-sm text-white mb-1 ml-2">
                              {t("open_24_7")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setPickupLocationModal({
                              show: true,
                              areaIndex: areaIdx,
                              locationIndex: pickupIdx,
                              data: formData.deliveryArea[areaIdx]
                                .pickUpLocation[pickupIdx],
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Edit
                            size={12}
                            className={
                              isDark ? "text-gray-300" : "text-gray-600"
                            }
                          />
                        </button>

                        <button
                          onClick={() => handleDeletePickup(areaIdx, pickupIdx)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          &#x2715; {/* Cross symbol */}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return & Exchange */}
      <div>
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("return_exchange_policy")}
        </label>

        <div className="space-y-2">
          {DELIVERY_RETURN_EXCHANGE_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex items-start gap-3 cursor-pointer
          ${theme === "dark" ? "text-gray-300" : "text-gray-700"}
        `}
            >
              <input
                type="checkbox"
                checked={formData.deliveryReturnExchange?.includes(option)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryReturnExchange: e.target.checked
                      ? [...formData.deliveryReturnExchange, option]
                      : formData.deliveryReturnExchange?.filter(
                          (p) => p !== option,
                        ),
                  })
                }
                className={`mt-1 w-4 h-4 rounded
            ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700 text-teal-500"
                : "bg-white border-gray-300 text-teal-600"
            }
          `}
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("additional_details")}
        </label>

        <textarea
          value={formData.deliveryAdditionalInfo}
          onChange={(e) =>
            setFormData({
              ...formData,
              deliveryAdditionalInfo: e.target.value,
            })
          }
          rows={3}
          placeholder={t("additional_details_placeholder")}
          className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500
      ${
        theme === "dark"
          ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
      }
    `}
        />
      </div>

      {/* Seller Info */}
      <div>
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("specific_seller_delivery_info")}
        </label>

        <div className="space-y-2">
          {DELIVERY_SPECIFIC_SELLER_INFO_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex items-start gap-3 cursor-pointer
          ${theme === "dark" ? "text-gray-300" : "text-gray-700"}
        `}
            >
              <input
                type="checkbox"
                checked={formData.deliverySpecificSellerInfo?.includes(option)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliverySpecificSellerInfo: e.target.checked
                      ? [...formData.deliverySpecificSellerInfo, option]
                      : formData.deliverySpecificSellerInfo?.filter(
                          (i) => i !== option,
                        ),
                  })
                }
                className={`mt-1 w-4 h-4 rounded 
            ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700 text-teal-500"
                : "bg-white border-gray-300 text-teal-600"
            }
          `}
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <Activity mode={pickupLocationModal ? "visible" : "hidden"}>
        <PickupLocationModal
          t={t}
          theme={theme}
          isRTL={isRTL}
          formData={formData}
          setFormData={setFormData}
          pickupLocationModal={pickupLocationModal}
          setPickupLocationModal={setPickupLocationModal}
        />
      </Activity>
    </div>
  );
};

export default BusinessDeliveryPolicy;
