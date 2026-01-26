import { Activity, useState, type FC } from "react";
import { Plus, X, MapPin } from "lucide-react";
import PickupLocationModal from "./PickupLocationModal";

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

interface BusinessDeliveryFormData {
  vendorDelivers: boolean;
  pickupAvailable: boolean;
  deliveryAreas: DeliveryArea[];
  deliveryReturnExchange: string[];
  deliveryAdditionalInfo: string;
  deliverySpecificSellerInfo: string[];
}

interface BusinessDeliveryPolicyProps {
  theme: Theme;
  isRTL: boolean;

  formData: BusinessDeliveryFormData;
  setFormData: (data: BusinessDeliveryFormData) => void;

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
        <label className="flex items-center gap-2 cursor-pointer">
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
        </label>

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
                  deliveryAreas: [
                    ...formData.deliveryAreas,
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
            {formData.deliveryAreas.map((deliveryArea, areaIdx) => (
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
                  <div className="col-span-5">
                    <label className="block text-xs mb-1 text-gray-500">
                      {t("delivery_area")}
                    </label>
                    <input
                      type="text"
                      value={deliveryArea.area}
                      onChange={(e) => {
                        const areas = [...formData.deliveryAreas];
                        areas[areaIdx].area = e.target.value;
                        setFormData({ ...formData, deliveryAreas: areas });
                      }}
                      placeholder={isRTL ? "באר שבע" : "Be'er Sheva"}
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Price */}
                  <div className="col-span-3">
                    <label className="block text-xs mb-1 text-gray-500">
                      {t("delivery_price")}
                    </label>
                    <input
                      type="number"
                      value={deliveryArea.price}
                      onChange={(e) => {
                        const areas = [...formData.deliveryAreas];
                        areas[areaIdx].price = e.target.value;
                        setFormData({ ...formData, deliveryAreas: areas });
                      }}
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500"
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
                      className="w-full px-3 py-2 rounded-lg border text-sm flex justify-center gap-1"
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
                          deliveryAreas: formData.deliveryAreas.filter(
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return & Exchange */}
      <div>
        <label className="block text-sm mb-2">
          {t("return_exchange_policy")}
        </label>

        <div className="space-y-2">
          {DELIVERY_RETURN_EXCHANGE_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-start gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.deliveryReturnExchange.includes(option)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryReturnExchange: e.target.checked
                      ? [...formData.deliveryReturnExchange, option]
                      : formData.deliveryReturnExchange.filter(
                          (p) => p !== option,
                        ),
                  })
                }
                className="mt-1 w-4 h-4"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <label className="block text-sm mb-2">{t("additional_details")}</label>
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
          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Seller Info */}
      <div>
        <label className="block text-sm mb-2">
          {t("specific_seller_delivery_info")}
        </label>

        <div className="space-y-2">
          {DELIVERY_SPECIFIC_SELLER_INFO_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-start gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.deliverySpecificSellerInfo.includes(option)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliverySpecificSellerInfo: e.target.checked
                      ? [...formData.deliverySpecificSellerInfo, option]
                      : formData.deliverySpecificSellerInfo.filter(
                          (i) => i !== option,
                        ),
                  })
                }
                className="mt-1 w-4 h-4"
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
