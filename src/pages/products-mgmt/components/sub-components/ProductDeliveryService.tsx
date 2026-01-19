import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ProductDeliveryServiceProps {
  t: (key: string) => string;
  formData: ProductFormData
  setFormData: (data: ProductFormData) => void;
}

const ProductDeliveryService = ({
  t,
  formData,
  setFormData,
}: ProductDeliveryServiceProps) => {
  const { bgTertiary, textPrimary, textSecondary, textTertiary, borderColor, hoverBg } = useThemeClasses()

  return (
    <div className="space-y-6">
      {/* Delivery Options for Physical / Table Order */}
      {(formData.type === "physical" || formData.type === "table-order") && (
        <>
          <h3 className={`text-lg font-medium ${textPrimary}`}>
            {t("delivery_options")}
          </h3>

          <div className="space-y-4">
            {/* Home Delivery */}
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border ${borderColor} cursor-pointer ${hoverBg}`}
            >
              <input
                type="checkbox"
                checked={formData.enableHomeDelivery}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enableHomeDelivery: e.target.checked,
                  })
                }
                className="rounded"
              />
              <div>
                <div className={`font-medium ${textPrimary}`}>
                  {t("enable_home_delivery")}
                </div>
                <div className={`text-sm ${textTertiary}`}>
                  {t("home_delivery_description")}
                </div>
              </div>
            </label>

            {/* Home Delivery Fee & Time */}
            {formData.enableHomeDelivery && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-8">
                <div>
                  <label
                    className={`block text-sm ${textSecondary} mb-2`}
                  >
                    {t("delivery_fee")} (₪)
                  </label>
                  <input
                    type="number"
                    value={formData.deliveryFee}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryFee: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm ${textSecondary} mb-2`}
                  >
                    {t("estimated_delivery_time")}
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryTime}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryTime: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                    placeholder={t("example_delivery_time")}
                  />
                </div>
              </div>
            )}

            {/* Store Pickup */}
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border ${borderColor} cursor-pointer ${hoverBg}`}
            >
              <input
                type="checkbox"
                checked={formData.enableStorePickup}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enableStorePickup: e.target.checked,
                  })
                }
                className="rounded"
              />
              <div>
                <div className={`font-medium ${textPrimary}`}>
                  {t("enable_store_pickup")}
                </div>
                <div className={`text-sm ${textTertiary}`}>
                  {t("store_pickup_description")}
                </div>
              </div>
            </label>
          </div>
        </>
      )}

      {/* Service / Experience Details */}
      {(formData.type === "service" || formData.type === "experience") && (
        <>
          <h3 className={`text-lg font-medium ${textPrimary}`}>
            {t("service_details")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>
                {t("service_duration")}
              </label>
              <input
                type="text"
                value={formData.serviceDuration}
                onChange={(e) =>
                  setFormData({ ...formData, serviceDuration: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                placeholder={t("example_service_duration")}
              />
            </div>

            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>
                {t("service_location")}
              </label>
              <input
                type="text"
                value={formData.serviceLocation}
                onChange={(e) =>
                  setFormData({ ...formData, serviceLocation: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
                placeholder={t("example_service_location")}
              />
            </div>
          </div>
        </>
      )}

      {/* Hotel Room Info */}
      {formData.type === "hotel-room" && (
        <div className={`p-6 rounded-xl ${bgTertiary} text-center`}>
          <p className={`${textSecondary}`}>
            {t("hotel_room_info")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductDeliveryService;
