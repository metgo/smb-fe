import { X } from "lucide-react";

interface PickupLocationModalProps {
  theme: Theme;
  t: (key: string) => string;
  pickupLocationModal: {
    locationIndex: number | null;
    areaIndex: number;
    data: {
      address: string;
      isAlwaysOpen: boolean;
      openingHrs: { day: string; open: string; close: string }[];
    };
  } | null;
  setPickupLocationModal: (modal: any) => void;
  formData: any;
  setFormData: (data: any) => void;
  isRTL?: boolean;
}

const PickupLocationModal = ({
  theme,
  t,
  pickupLocationModal,
  setPickupLocationModal,
  formData,
  setFormData,
  isRTL = false,
}: PickupLocationModalProps) => {
  if (!pickupLocationModal) return null;

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  console.log(
    "🚀 ~ PickupLocationModal ~ pickupLocationModal:",
    pickupLocationModal,
  );

  console.log("picup data", formData.deliveryArea);
  const pickupAddresses =
    formData.deliveryArea?.flatMap((area: any) =>
      area.pickUpLocation.map((location: any) => location),
    ) || [];
  console.log(" ~ pickupAddresses:", pickupAddresses);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`w-full max-w-lg rounded-lg shadow-2xl ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {pickupLocationModal.locationIndex !== null
                ? t("edit_location")
                : t("add_location")}
            </h3>
            <button
              onClick={() => setPickupLocationModal(null)}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-gray-400"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Address */}
          <div>
            <label
              className={`block text-sm mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("address")} *
            </label>
            <input
              type="text"
              value={pickupLocationModal.data.address}
              onChange={(e) =>
                setPickupLocationModal({
                  ...pickupLocationModal,
                  data: {
                    ...pickupLocationModal.data,
                    address: e.target.value,
                  },
                })
              }
              placeholder={isRTL ? "מבצע ניצנן 52/37" : "52/37 Mivtza Nitzan"}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>

          {/* Opening Hours */}
          <div>
            <label
              className={`block text-sm mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("opening_hours")}
            </label>

            {/* Open 24/7 Toggle */}
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pickupLocationModal.data.isAlwaysOpen}
                onChange={(e) =>
                  setPickupLocationModal({
                    ...pickupLocationModal,
                    data: {
                      ...pickupLocationModal.data,
                      isAlwaysOpen: e.target.checked,
                      openingHrs: e.target.checked
                        ? []
                        : pickupLocationModal.data.openingHrs,
                    },
                  })
                }
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("open_24_7")}
              </span>
            </label>

            {!pickupLocationModal.data.isAlwaysOpen && (
              <div className="space-y-2">
                {/* Day Selector */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day) => {
                    const hasDay = pickupLocationModal.data.openingHrs.some(
                      (h) => h.day === day,
                    );
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          const newHrs = hasDay
                            ? pickupLocationModal.data.openingHrs.filter(
                                (h) => h.day !== day,
                              )
                            : [
                                ...pickupLocationModal.data.openingHrs,
                                { day, open: "09:00", close: "18:00" },
                              ];
                          setPickupLocationModal({
                            ...pickupLocationModal,
                            data: {
                              ...pickupLocationModal.data,
                              openingHrs: newHrs,
                            },
                          });
                        }}
                        className={`px-2 py-3 rounded-full text-xs transition-colors ${
                          hasDay
                            ? "bg-teal-600 text-white"
                            : theme === "dark"
                              ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Time Inputs */}
                {pickupLocationModal.data.openingHrs.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {pickupLocationModal.data.openingHrs.map(
                      (timeSlot, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span
                            className={`text-xs w-12 ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {timeSlot.day}
                          </span>
                          <input
                            type="time"
                            value={timeSlot.open}
                            onChange={(e) => {
                              const newHrs = [
                                ...pickupLocationModal.data.openingHrs,
                              ];
                              newHrs[idx].open = e.target.value;
                              setPickupLocationModal({
                                ...pickupLocationModal,
                                data: {
                                  ...pickupLocationModal.data,
                                  openingHrs: newHrs,
                                },
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-sm ${
                              theme === "dark"
                                ? "bg-gray-800 border-gray-700 text-gray-200"
                                : "bg-white border-gray-300 text-gray-900"
                            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          />
                          <span
                            className={
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-500"
                            }
                          >
                            -
                          </span>
                          <input
                            type="time"
                            value={timeSlot.close}
                            onChange={(e) => {
                              const newHrs = [
                                ...pickupLocationModal.data.openingHrs,
                              ];
                              newHrs[idx].close = e.target.value;
                              setPickupLocationModal({
                                ...pickupLocationModal,
                                data: {
                                  ...pickupLocationModal.data,
                                  openingHrs: newHrs,
                                },
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-sm ${
                              theme === "dark"
                                ? "bg-gray-800 border-gray-700 text-gray-200"
                                : "bg-white border-gray-300 text-gray-900"
                            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          />
                          <button
                            onClick={() => {
                              const newHrs =
                                pickupLocationModal.data.openingHrs.filter(
                                  (_, i) => i !== idx,
                                );
                              setPickupLocationModal({
                                ...pickupLocationModal,
                                data: {
                                  ...pickupLocationModal.data,
                                  openingHrs: newHrs,
                                },
                              });
                            }}
                            className="p-1 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p
                    className={`text-xs text-center py-2 ${
                      theme === "dark" ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {t("select_days_to_set_hours")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <button
            onClick={() => setPickupLocationModal(null)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              theme === "dark"
                ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                : "border-gray-300 hover:bg-gray-100 text-gray-700"
            }`}
          >
            {t("cancel")}
          </button>
          <button
            onClick={() => {
              if (!pickupLocationModal.data.address) return;

              const newAreas = formData.deliveryArea.map(
                (area: any, idx: any) => {
                  if (idx === pickupLocationModal.areaIndex) {
                    const newPickUpLocation = [...area.pickUpLocation];

                    if (pickupLocationModal.locationIndex !== null) {
                      newPickUpLocation[pickupLocationModal.locationIndex] =
                        pickupLocationModal.data;
                    } else {
                      newPickUpLocation.push(pickupLocationModal.data);
                    }

                    return {
                      ...area,
                      pickUpLocation: newPickUpLocation,
                    };
                  }
                  return area;
                },
              );

              setFormData({
                ...formData,
                deliveryArea: newAreas,
              });

              setPickupLocationModal(null);
            }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            disabled={!pickupLocationModal.data.address}
          >
            {pickupLocationModal.locationIndex !== null
              ? t("update")
              : t("add")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickupLocationModal;
