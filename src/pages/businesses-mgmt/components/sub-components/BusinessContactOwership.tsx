import { useEffect, type FC } from "react";
import { Mail, Phone, User } from "lucide-react";
import { useTranslation } from "react-i18next";

/* ---------------- Types ---------------- */

type ThemeMode = "dark" | "light";

interface ContactPerson {
  name: string;
  email: string;
  phone: string;
  address: string;
  countryCode: string;
  whatsAppCountryCode: string;
  whatsAppNumber: string;
  prefferedChannel: string;
}

interface BusinessContactFormData {
  email: string;
  phone: string;
  contactDetails: ContactPerson;
}

interface FormErrors {
  email?: string;
  phone?: string;
}

interface BusinessContactOwershipProps {
  theme: ThemeMode;
  isRTL: boolean;
  business: any;
  formData: BusinessContactFormData;
  setFormData: (data: BusinessContactFormData) => void;
  errors: FormErrors;
  currentView: View;
}
type View = "list" | "details" | "create" | "edit" | undefined;

/* ---------------- Component ---------------- */

const BusinessContactOwership: FC<BusinessContactOwershipProps> = ({
  theme,
  isRTL,
  business,
  formData,
  setFormData,
  errors,
  currentView,
}) => {
  const { t } = useTranslation("businesses");
  useEffect(() => {
    if (!business || currentView !== "edit") return;

    setFormData({
      email: business.busiEmail || "",
      phone: business.phoneNumber || "",
      contactDetails: {
        name: business.contactDetails?.name,
        countryCode: business.contactDetails?.countryCode,
        phone: business.contactDetails?.phone,
        address: business.contactDetails?.address,
        email: business.contactDetails?.email,
        whatsAppCountryCode: business.contactDetails?.whatsAppCountryCode,
        whatsAppNumber: business.contactDetails?.whatsAppNumber,
        prefferedChannel: business.contactDetails?.prefferedChannel,
      },
    });
  }, [business]);

  return (
    <div className="space-y-6">
      {/* Business Email */}
      <div>
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("business_email")} <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Mail
            className={`absolute ${
              isRTL ? "right-3" : "left-3"
            } top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`}
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder={t("business@example.com")}
            className={`w-full ${
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2 rounded-lg border ${
              errors.email
                ? "border-red-500"
                : theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>

        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("phone_number")} <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Phone
            className={`absolute ${
              isRTL ? "right-3" : "left-3"
            } top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`}
          />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+972-XX-XXXXXXX"
            className={`w-full ${
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2 rounded-lg border ${
              errors.phone
                ? "border-red-500"
                : theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>

        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Contact Person */}
      <div
        className={`p-4 rounded-lg ${
          theme === "dark"
            ? "bg-gray-800/50 border border-gray-700"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <h3
          className={`mb-4 flex items-center gap-2 ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          }`}
        >
          <User className="w-5 h-5" />
          {t("contact_person_details")}
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            value={formData.contactDetails?.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactDetails: {
                  ...formData.contactDetails,
                  name: e.target.value,
                },
              })
            }
            placeholder={t("full_name")}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />

          <input
            type="email"
            value={formData.contactDetails?.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactDetails: {
                  ...formData.contactDetails,
                  email: e.target.value,
                },
              })
            }
            placeholder={t("email")}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />

          <input
            type="tel"
            value={formData.contactDetails?.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactDetails: {
                  ...formData.contactDetails,
                  phone: e.target.value,
                },
              })
            }
            placeholder={t("phone")}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessContactOwership;
