import type { FC } from "react"
import { Truck, ArrowLeft, FileText, CheckCircle, Package } from "lucide-react"

/* ---------- Types ---------- */

type Theme = "light" | "dark"

interface BusinessDeliveryData {
  deliveryAdditionalInfo?: string
  deliveryReturnExchange?: string[]
  deliverySpecificSellerInfo?: string[]
}

interface BusinessDeliveryPolicyDetailsProps {
  theme: Theme
  t: (key: string) => string
  business: BusinessDeliveryData
}

/* ---------- Component ---------- */

const BusinessDeliveryPolicyDetails: FC<BusinessDeliveryPolicyDetailsProps> = ({
  theme,
  t,
  business,
}) => {
  const hasDeliveryInfo =
    business.deliveryAdditionalInfo ||
    (business.deliveryReturnExchange && business.deliveryReturnExchange.length > 0) ||
    (business.deliverySpecificSellerInfo && business.deliverySpecificSellerInfo.length > 0)

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
          {t('no_delivery_policy')}
        </p>
        <p
          className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
        >
          {t('add_delivery_policy_description')}
        </p>
      </div>
    )
  }

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
              {t('delivery_additional_info')}
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
      {business.deliveryReturnExchange && business.deliveryReturnExchange.length > 0 && (
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
              {t('return_exchange_policy')}
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

      {/* Specific Seller Information */}
      {business.deliverySpecificSellerInfo && business.deliverySpecificSellerInfo.length > 0 && (
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
              {t('delivery_specific_seller_info')}
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
  )
}

export default BusinessDeliveryPolicyDetails
