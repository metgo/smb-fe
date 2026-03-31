"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Truck, Users, X, Building } from "lucide-react";
import { useRouter } from "next/navigation";

const ProductInfoCards = ({
  deliveryArea,
  quantity,
  // openingHrs,
  businessId,
}: {
  deliveryArea: DeliveryArea[];
  quantity: ProductDetailsProps["quantity"];
  // openingHrs: OpeningHrs[];
  businessId: any;
}) => {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const router = useRouter();
  const hasDelivery = deliveryArea?.length > 0;
  const firstDelivery = deliveryArea?.[0];
  const isFreeDelivery = firstDelivery?.price === "0";

  // const availabilityText = quantity?.isUnlimited
  //   ? "ללא הגבלה"
  //   : openingHrs?.[0]
  //     ? `${openingHrs[0].days} ${openingHrs[0].open}-${openingHrs[0].close}`
  //     : "לפי פניה";

  return (
    <>
      {/* Delivery Modal */}
      {showDeliveryModal && hasDelivery && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
          onClick={() => setShowDeliveryModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl shadow-2xl p-8 bg-white"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">אזורי משלוח</h3>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="p-2 rounded-xl transition-colors hover:bg-gray-100"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              {deliveryArea.map((zone, index) => (
                <div key={index} className="rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      {zone.area}
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        zone.price === "0" ? "text-teal-600" : "text-orange-600"
                      }`}
                    >
                      {zone.price === "0" ? "חינם" : `₪${zone.price}`}
                    </span>
                  </div>
                  {zone.pickUpLocation?.[0]?.address && (
                    <p className="text-sm text-gray-600">
                      {zone.pickUpLocation[0].address}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-teal-50 border border-teal-200">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 flex-shrink-0 mt-0.5 text-teal-600" />
                <p className="text-sm text-gray-700">
                  עלות המשלוח תתווסף למחיר הסופי בעמוד התשלום
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Info Cards */}
      <div className="flex flex-col gap-4">
        <motion.button
          onClick={() => hasDelivery && setShowDeliveryModal(true)}
          whileTap={{ scale: 0.98 }}
          className={`rounded-2xl shadow-lg p-6 flex items-start gap-4 transition-all ${
            hasDelivery ? "cursor-pointer hover:shadow-xl" : "cursor-default"
          } bg-white`}
        >
          <div
            className={`p-3 rounded-xl ${
              hasDelivery
                ? isFreeDelivery
                  ? "bg-teal-50"
                  : "bg-orange-50"
                : "bg-gray-100"
            }`}
          >
            <Truck
              className={`w-6 h-6 ${
                hasDelivery
                  ? isFreeDelivery
                    ? "text-teal-600"
                    : "text-orange-600"
                  : "text-gray-400"
              }`}
            />
          </div>
          <div className="text-right flex-1">
            <p className="text-sm mb-1 text-gray-600">משלוחים</p>
            <p className="text-lg font-bold text-gray-900">
              {hasDelivery ? firstDelivery.area : "לא זמין"}
            </p>
          </div>
        </motion.button>

        <div className="rounded-2xl shadow-lg p-6 flex items-start gap-4 bg-white">
          <div className="p-3 rounded-xl bg-purple-50">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm mb-1 text-gray-600">עד היום נרכשו</p>
            <p className="text-lg font-bold text-gray-900">
              {quantity?.sold ?? 0}
            </p>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg p-6 flex items-start gap-4 bg-white">
          <div className="p-3 rounded-xl bg-blue-50">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div
            className="cursor-pointer"
            onClick={() => router.push(`/business-details/${businessId?.slug}`)}
          >
            {" "}
            <p className="text-sm mb-1 text-gray-600">שם העסק</p>
            <p className="text-base font-bold text-gray-900">
              {businessId?.name}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductInfoCards;
