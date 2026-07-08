import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, MapPin, Edit } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import PickupLocationModal from "./PickupLocationModal";
import { FormFieldWrapper, ReactMultiSelect } from "../form-fields";
import {
  DELIVERY_RETURN_EXCHANGE_OPTIONS,
  DELIVERY_SPECIFIC_SELLER_INFO_OPTIONS,
} from "@/lib/utils";

interface PickupLocation {
  address: string;
  isAlwaysOpen: boolean;
  openingHrs: { day: string; open: string; close: string }[];
}

interface DeliveryArea {
  area: string;
  price: string;
  pickUpLocation: PickupLocation[];
}

export interface DeliveryFormData {
  type?: string;
  serviceDuration?: string;
  serviceLocation?: string;
  sameAsBusiness?: boolean;

  vendorDelivers: boolean;
  pickupAvailable: boolean;
  globalDelivery: boolean;
  deliveryArea: DeliveryArea[];
  vendorDeliveryArea: DeliveryArea[];
  globalDeliveryArea: DeliveryArea[];
  deliveryReturnExchange: string[];
  deliveryAdditionalInfo: string;
  deliverySpecificSellerInfo: string[];
}

interface DeliveryPolicyOptionProps {
  isSameAsBusiness?: boolean;
  setIsSameAsBusiness?: (v: boolean) => void;
  isProduct?: boolean;
  formData: DeliveryFormData;
  setFormData: React.Dispatch<React.SetStateAction<DeliveryFormData>>;
}

const DeliveryPolicyOption: FC<DeliveryPolicyOptionProps> = ({
  formData,
  setFormData,
  isSameAsBusiness,
  setIsSameAsBusiness,
  isProduct = false,
}) => {
  const { t } = useTranslation("businesses");
  const { t: tc } = useTranslation("common");

  const { isDark, isRTL, textPrimary, textSecondary, bgTertiary, borderColor } =
    useThemeClasses();

  const [isDeliveryChecked, setIsDeliveryChecked] = useState(false);

  const [pickupLocationModal, setPickupLocationModal] = useState<{
    show: boolean;
    areaIndex: number;
    locationIndex: number | null;
    data: PickupLocation;
  } | null>(null);

  const [vendorPickupLocationModal, setVendorPickupLocationModal] = useState<{
    show: boolean;
    areaIndex: number;
    locationIndex: number | null;
    data: PickupLocation;
  } | null>(null);

  const [globalPickupLocationModal, setGlobalPickupLocationModal] = useState<{
    show: boolean;
    areaIndex: number;
    locationIndex: number | null;
    data: PickupLocation;
  } | null>(null);

  const handleDeleteVendorPickup = (areaIdx: number, pickupIdx: number) => {
    const updatedAreas = formData?.vendorDeliveryArea?.map((area, idx) => {
      if (idx === areaIdx) {
        const updatedPickups = area.pickUpLocation.filter(
          (_, pIdx) => pIdx !== pickupIdx,
        );
        return { ...area, pickUpLocation: updatedPickups };
      }
      return area;
    });
    setFormData((prev) => ({ ...prev, vendorDeliveryArea: updatedAreas }));
  };

  const handleDeletePickup = (areaIdx: number, pickupIdx: number) => {
    const updatedAreas = formData?.deliveryArea?.map((area, idx) => {
      if (idx === areaIdx) {
        const updatedPickups = area.pickUpLocation.filter(
          (_, pIdx) => pIdx !== pickupIdx,
        );
        return { ...area, pickUpLocation: updatedPickups };
      }
      return area;
    });
    setFormData((prev) => ({ ...prev, deliveryArea: updatedAreas }));
  };

  const handleDeleteGlobalPickup = (areaIdx: number, pickupIdx: number) => {
    const updatedAreas = formData?.globalDeliveryArea?.map((area, idx) => {
      if (idx === areaIdx) {
        const updatedPickups = area.pickUpLocation.filter(
          (_, pIdx) => pIdx !== pickupIdx,
        );
        return { ...area, pickUpLocation: updatedPickups };
      }
      return area;
    });
    setFormData((prev) => ({ ...prev, globalDeliveryArea: updatedAreas }));
  };

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {t("delivery")}
      </h3>

      {/* Same as business checkbox */}
      {isProduct && (
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSameAsBusiness}
              onChange={(e) => setIsSameAsBusiness?.(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span
              className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("same_as_business")}
            </span>
          </label>
        </div>
      )}

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDeliveryChecked}
            onChange={(e) => setIsDeliveryChecked(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <span
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {/* {t("pickup_available")} */}
            Delivery
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.pickupAvailable}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pickupAvailable: e.target.checked,
              }))
            }
            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <span
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("pickup_available")}
          </span>
        </label>
      </div>

      {/* Delivery Options */}
      {isDeliveryChecked && (
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="deliveryType"
              checked={formData.vendorDelivers}
              disabled={isSameAsBusiness}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  vendorDelivers: true,
                  globalDelivery: false,
                  globalDeliveryArea: [],
                }))
              }
              className="w-4 h-4 border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span
              className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("vendor_delivers")}
            </span>
          </label>

          {!isProduct && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="deliveryType"
                checked={formData.globalDelivery}
                disabled={isSameAsBusiness}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    globalDelivery: true,
                    vendorDelivers: false,
                    vendorDeliveryArea: [],
                  }))
                }
                className="w-4 h-4 border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span
                className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {t("global_delivery")}
              </span>
            </label>
          )}
        </div>
      )}

      {/* Vendor Delivery Areas */}
      {formData.vendorDelivers && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              className={`block text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("vendor_delivers")} — {t("delivery_areas_pricing")}
            </label>
            {!isSameAsBusiness && (
              <button
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    vendorDeliveryArea: [
                      ...(prev.vendorDeliveryArea ?? []),
                      { area: "", price: "", pickUpLocation: [] },
                    ],
                  }))
                }
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                {t("add_area")}
              </button>
            )}
          </div>
          <div className="space-y-4">
            {formData?.vendorDeliveryArea?.map((deliveryArea, areaIdx) => (
              <div
                key={areaIdx}
                className={`p-4 rounded-lg border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}
              >
                <div className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-5">
                    <label
                      className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {t("delivery_area")}
                    </label>
                    <input
                      type="text"
                      value={deliveryArea?.area}
                      disabled={isSameAsBusiness}
                      onChange={(e) => {
                        const areas = formData.vendorDeliveryArea?.map(
                          (area, idx) =>
                            idx === areaIdx
                              ? { ...area, area: e.target.value }
                              : area,
                        );
                        setFormData((prev) => ({
                          ...prev,
                          vendorDeliveryArea: areas,
                        }));
                      }}
                      placeholder={isRTL ? "באר שבע" : "Be'er Sheva"}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500 ${isDark ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <label
                      className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {t("delivery_price")}
                    </label>
                    <input
                      type="number"
                      value={deliveryArea.price}
                      disabled={isSameAsBusiness}
                      onChange={(e) => {
                        const areas = [...formData.vendorDeliveryArea];
                        areas[areaIdx].price = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          vendorDeliveryArea: areas,
                        }));
                      }}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500 ${isDark ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                    />
                  </div>
                  <div className="col-span-3 flex items-end">
                    <button
                      disabled={isSameAsBusiness}
                      onClick={() =>
                        setVendorPickupLocationModal({
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
                      className={`w-full px-3 py-2 rounded-lg border text-sm flex justify-center gap-1 ${isDark ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                    >
                      <MapPin className="w-4 h-4" />
                      {t("add_location")}
                    </button>
                  </div>
                  {!isSameAsBusiness && (
                    <div className="col-span-1 flex items-end">
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            vendorDeliveryArea: prev.vendorDeliveryArea?.filter(
                              (_, i) => i !== areaIdx,
                            ),
                          }))
                        }
                        className="w-8 p-2 rounded-lg bg-red-600 text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {deliveryArea?.pickUpLocation?.length > 0 && (
                  <label
                    className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {t("pickup_locations")} :
                  </label>
                )}
                {deliveryArea?.pickUpLocation?.map((pickup, pickupIdx) => (
                  <div
                    key={pickupIdx}
                    className={`border p-3 rounded-md mb-2 ${isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-200"}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-green-500" />
                          {pickup.address}
                        </div>
                        {pickup.isAlwaysOpen && (
                          <span className="text-xs flex items-center bg-green-600 px-2 mt-2 py-1 rounded-sm text-white mb-1 ml-2">
                            {t("open_24_7")}
                          </span>
                        )}
                      </div>
                      {!isSameAsBusiness && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setVendorPickupLocationModal({
                                show: true,
                                areaIndex: areaIdx,
                                locationIndex: pickupIdx,
                                data: pickup,
                              })
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                          >
                            <Edit
                              size={12}
                              className={
                                isDark ? "text-gray-300" : "text-gray-600"
                              }
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteVendorPickup(areaIdx, pickupIdx)
                            }
                            className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                          >
                            &#x2715;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Areas — for Pickup Available only */}
      {formData.pickupAvailable && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              className={`block text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("delivery_areas_pricing")}
            </label>

            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryArea: [
                    ...prev.deliveryArea,
                    { area: "", price: "", pickUpLocation: [] },
                  ],
                }))
              }
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" />
              {t("add_area")}
            </button>
          </div>

          <div className="space-y-4">
            {formData?.deliveryArea?.map((deliveryArea, areaIdx) => (
              <div
                key={areaIdx}
                className={`p-4 rounded-lg border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}
              >
                <div className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-5">
                    <label
                      className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {t("delivery_area")}
                    </label>
                    <input
                      type="text"
                      value={deliveryArea?.area}
                      onChange={(e) => {
                        const areas = formData.deliveryArea?.map((area, idx) =>
                          idx === areaIdx
                            ? { ...area, area: e.target.value }
                            : area,
                        );
                        setFormData((prev) => ({
                          ...prev,
                          deliveryArea: areas,
                        }));
                      }}
                      placeholder={isRTL ? "באר שבע" : "Be'er Sheva"}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500 ${isDark ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                    />
                  </div>

                  <div className="col-span-3">
                    <label
                      className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {t("delivery_price")}
                    </label>
                    <input
                      type="number"
                      value={deliveryArea.price}
                      onChange={(e) => {
                        const areas = [...formData.deliveryArea];
                        areas[areaIdx].price = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          deliveryArea: areas,
                        }));
                      }}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500 ${isDark ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                    />
                  </div>

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
                      className={`w-full px-3 py-2 rounded-lg border text-sm flex justify-center gap-1 ${isDark ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                    >
                      <MapPin className="w-4 h-4" />
                      {t("add_location")}
                    </button>
                  </div>

                  <div className="col-span-1 flex items-end">
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryArea: prev.deliveryArea?.filter(
                            (_, i) => i !== areaIdx,
                          ),
                        }))
                      }
                      className="w-8 p-2 rounded-lg bg-red-600 text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {deliveryArea?.pickUpLocation?.length > 0 && (
                  <label
                    className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {t("pickup_locations")} :
                  </label>
                )}
                {deliveryArea?.pickUpLocation?.map((pickup, pickupIdx) => (
                  <div
                    key={pickupIdx}
                    className={`border p-3 rounded-md mb-2 ${isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-200"}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-green-500" />
                          {pickup.address}
                        </div>
                        {pickup.isAlwaysOpen && (
                          <span className="text-xs flex items-center bg-green-600 px-2 mt-2 py-1 rounded-sm text-white mb-1 ml-2">
                            {t("open_24_7")}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setPickupLocationModal({
                              show: true,
                              areaIndex: areaIdx,
                              locationIndex: pickupIdx,
                              data: pickup,
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
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
                          className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                        >
                          &#x2715;
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

      {/* Global Delivery Areas */}
      {formData.globalDelivery && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              className={`block text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("global_delivery")} — {t("delivery_areas_pricing")}
            </label>

            {!isSameAsBusiness && (
              <button
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    globalDeliveryArea: [
                      ...(prev.globalDeliveryArea ?? []),
                      { area: "", price: "", pickUpLocation: [] },
                    ],
                  }))
                }
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                {t("add_area")}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {formData?.globalDeliveryArea?.map((deliveryArea, areaIdx) => (
              <div
                key={areaIdx}
                className={`p-4 rounded-lg border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}
              >
                <div className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-5">
                    <label
                      className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {t("delivery_area")}
                    </label>
                    <input
                      type="text"
                      value={deliveryArea?.area}
                      disabled={isSameAsBusiness}
                      onChange={(e) => {
                        const areas = formData.globalDeliveryArea?.map(
                          (area, idx) =>
                            idx === areaIdx
                              ? { ...area, area: e.target.value }
                              : area,
                        );
                        setFormData((prev) => ({
                          ...prev,
                          globalDeliveryArea: areas,
                        }));
                      }}
                      placeholder={isRTL ? "ניו יורק" : "New York"}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500 ${isDark ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                    />
                  </div>

                  <div className="col-span-3">
                    <label
                      className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {t("delivery_price")}
                    </label>
                    <input
                      type="number"
                      value={deliveryArea.price}
                      disabled={isSameAsBusiness}
                      onChange={(e) => {
                        const areas = [...formData.globalDeliveryArea];
                        areas[areaIdx].price = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          globalDeliveryArea: areas,
                        }));
                      }}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500 ${isDark ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                    />
                  </div>

                  <div className="col-span-3 flex items-end">
                    <button
                      disabled={isSameAsBusiness}
                      onClick={() =>
                        setGlobalPickupLocationModal({
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
                      className={`w-full px-3 py-2 rounded-lg border text-sm flex justify-center gap-1 ${isDark ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                    >
                      <MapPin className="w-4 h-4" />
                      {t("add_location")}
                    </button>
                  </div>

                  {!isSameAsBusiness && (
                    <div className="col-span-1 flex items-end">
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            globalDeliveryArea: prev.globalDeliveryArea?.filter(
                              (_, i) => i !== areaIdx,
                            ),
                          }))
                        }
                        className="w-8 p-2 rounded-lg bg-red-600 text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {deliveryArea?.pickUpLocation?.length > 0 && (
                  <label
                    className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {t("pickup_locations")} :
                  </label>
                )}
                {deliveryArea?.pickUpLocation?.map((pickup, pickupIdx) => (
                  <div
                    key={pickupIdx}
                    className={`border p-3 rounded-md mb-2 ${isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-200"}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-green-500" />
                          {pickup.address}
                        </div>
                        {pickup.isAlwaysOpen && (
                          <span className="text-xs flex items-center bg-green-600 px-2 mt-2 py-1 rounded-sm text-white mb-1 ml-2">
                            {t("open_24_7")}
                          </span>
                        )}
                      </div>
                      {!isSameAsBusiness && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setGlobalPickupLocationModal({
                                show: true,
                                areaIndex: areaIdx,
                                locationIndex: pickupIdx,
                                data: pickup,
                              })
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                          >
                            <Edit
                              size={12}
                              className={
                                isDark ? "text-gray-300" : "text-gray-600"
                              }
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteGlobalPickup(areaIdx, pickupIdx)
                            }
                            className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                          >
                            &#x2715;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Details */}
      {isProduct &&
        (formData.type === "SERVICE" || formData.type === "EXPERIENCE") && (
          <>
            <h3 className={`text-lg font-medium ${textPrimary}`}>
              {t("service_details")}
            </h3>
            <div className="space-y-4 grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className={`block text-sm ${textSecondary} mb-2`}>
                  {t("service_duration")}
                </label>
                <input
                  type="text"
                  value={formData.serviceDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      serviceDuration: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                  placeholder={t("example_service_duration")}
                />
              </div>
              <div className="col-span-8">
                <label className={`block text-sm ${textSecondary} mb-2`}>
                  {t("service_location")}
                </label>
                <input
                  type="text"
                  value={formData.serviceLocation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      serviceLocation: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                  placeholder={t("example_service_location")}
                />
              </div>
            </div>
          </>
        )}

      {/* Return & Exchange */}
      <ReactMultiSelect
        label={t("return_exchange_policy")}
        options={DELIVERY_RETURN_EXCHANGE_OPTIONS.map((opt) => ({
          label: t(opt),
          value: opt,
        }))}
        value={formData.deliveryReturnExchange}
        onChange={(values) =>
          setFormData((prev) => ({ ...prev, deliveryReturnExchange: values }))
        }
      />

      {/* Specific Seller Info */}
      <ReactMultiSelect
        label={t("specific_seller_delivery_info")}
        options={DELIVERY_SPECIFIC_SELLER_INFO_OPTIONS.map((opt) => ({
          label: t(opt),
          value: opt,
        }))}
        value={formData.deliverySpecificSellerInfo}
        onChange={(values) =>
          setFormData((prev) => ({
            ...prev,
            deliverySpecificSellerInfo: values,
          }))
        }
      />

      {/* Additional Info */}
      <FormFieldWrapper
        label={t("additional_details")}
        inputHintText={`${formData.deliveryAdditionalInfo?.length ?? 0}/100 ${tc("max_characters")}`}
      >
        <textarea
          maxLength={100}
          value={formData.deliveryAdditionalInfo}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              deliveryAdditionalInfo: e.target.value,
            }))
          }
          rows={3}
          placeholder={t("additional_details_placeholder")}
          className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 ${isDark ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
        />
      </FormFieldWrapper>

      {vendorPickupLocationModal && (
        <PickupLocationModal
          isRTL={isRTL}
          formData={{ ...formData, deliveryArea: formData.vendorDeliveryArea }}
          setFormData={(data: any) =>
            setFormData((prev) => ({
              ...prev,
              vendorDeliveryArea: data.deliveryArea,
            }))
          }
          pickupLocationModal={vendorPickupLocationModal}
          setPickupLocationModal={setVendorPickupLocationModal}
        />
      )}

      {pickupLocationModal && (
        <PickupLocationModal
          isRTL={isRTL}
          formData={formData}
          setFormData={setFormData}
          pickupLocationModal={pickupLocationModal}
          setPickupLocationModal={setPickupLocationModal}
        />
      )}

      {globalPickupLocationModal && (
        <PickupLocationModal
          isRTL={isRTL}
          formData={{ ...formData, deliveryArea: formData.globalDeliveryArea }}
          setFormData={(data: any) =>
            setFormData((prev) => ({
              ...prev,
              globalDeliveryArea: data.deliveryArea,
            }))
          }
          pickupLocationModal={globalPickupLocationModal}
          setPickupLocationModal={setGlobalPickupLocationModal}
        />
      )}
    </div>
  );
};

export default DeliveryPolicyOption;
