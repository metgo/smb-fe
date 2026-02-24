import { useState, type FC } from "react";
import { Mail, Phone, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import InviteCollaboratorModal from "./InviteCollaboratorModal";

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
  collaborators: any[];
}

interface FormErrors {
  email?: string;
  phone?: string;
}

interface BusinessContactOwershipProps {
  isRTL: boolean;
  business: any;
  formData: BusinessContactFormData;
  setFormData: (data: BusinessContactFormData) => void;
  errors: FormErrors;
  currentView: View;
}
type View = "list" | "details" | "create" | "edit" | undefined;

const BusinessContactOwership: FC<BusinessContactOwershipProps> = ({
  isRTL,
  formData,
  setFormData,
  errors,
}) => {
  const { t } = useTranslation("businesses");
  const { isDark } = useThemeClasses();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteCollaborator = (collaborator: {
    email: string;
    name?: string;
    phone?: string;
    role: string;
    status: string;
  }) => {
    setFormData({
      ...formData,
      collaborators: [...formData.collaborators, collaborator],
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Business Email */}
        <div>
          <label
            className={`block text-sm mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
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
                  : isDark
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
              isDark ? "text-gray-300" : "text-gray-700"
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
              type="number"
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
                  : isDark
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
            isDark
              ? "bg-gray-800/50 border border-gray-700"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <h3
            className={`mb-4 flex items-center gap-2 ${
              isDark ? "text-gray-200" : "text-gray-800"
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
                isDark
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
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />

            <input
              type="number"
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
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
        </div>

        {/* Collaborators */}
        {/* <div
          className={`p-4 rounded-lg ${
            isDark
              ? "bg-gray-800/50 border border-gray-700"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`flex items-center gap-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}
            >
              <Users className="w-5 h-5" />
              {t("collaborators")}
            </h3>
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {t("inviteUser")}
            </button>
          </div>

          {formData?.collaborators?.length === 0 ? (
            <p
              className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
            >
              No collaborators added yet
            </p>
          ) : (
            <div className="space-y-2">
              {formData?.collaborators?.map((collab, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}
                      >
                        {collab.email}
                      </p>
                      <p
                        className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                      >
                        {collab.role} • {collab.status}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        collaborators: formData.collaborators.filter(
                          (_, i) => i !== idx,
                        ),
                      });
                    }}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div> */}
      </div>

      {/* Invite Collaborator Modal */}
      <InviteCollaboratorModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteCollaborator}
      />
    </>
  );
};

export default BusinessContactOwership;
