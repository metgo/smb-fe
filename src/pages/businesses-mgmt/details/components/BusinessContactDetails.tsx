import { useState, type FC } from "react";
import { UserCog, Mail, Phone, Plus } from "lucide-react";
import ChangeOwnerModal from "./ChangeOwnerModal";

interface BusinessContactDetailsProps {
  theme: "light" | "dark";
  t: (key: string) => string;
  business: {
    busiEmail: string;
    phoneNumber: string;
    contactDetails: {
      name: string;
      email: string;
      phone: string;
    };
    collabrationUser?: any[]; // For collaborators list (not used here)
  };
  USER_ROLE: string;
  // on_change_owner?: () => void;
  on_invite_collaborator?: () => void;
}

const BusinessContactDetails: FC<BusinessContactDetailsProps> = ({
  theme,
  t,
  business,
  USER_ROLE,
  // on_change_owner,
  on_invite_collaborator,
}) => {
  const [showChangeOwnerModal, setShowChangeOwnerModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Business Owner */}
      <div
        className={`p-4 rounded-lg border-2 ${
          theme === "dark"
            ? "bg-linear-to-br from-teal-900/20 to-blue-900/20 border-teal-800"
            : "bg-linear-to-br from-teal-50 to-blue-50 border-teal-300"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCog
              className={`w-5 h-5 ${
                theme === "dark" ? "text-teal-400" : "text-teal-700"
              }`}
            />
            <h3
              className={theme === "dark" ? "text-teal-300" : "text-teal-900"}
            >
              {t("business_owner")}
            </h3>
          </div>

          {USER_ROLE === "admin" && (
            <button
              onClick={() => setShowChangeOwnerModal(true)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                theme === "dark"
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              <UserCog className="w-4 h-4" />
              {t("change_owner")}
            </button>
          )}
          <ChangeOwnerModal
            isOpen={showChangeOwnerModal}
            onClose={() => setShowChangeOwnerModal(false)}
            theme={theme}
            USER_ROLE={USER_ROLE}
            // currentOwner={business?.owner}
            onOwnerChange={(ownerData) => {
              console.log("🚀 ~ BusinessDetails ~ ownerData:", ownerData);
              setShowChangeOwnerModal(false);
            }}
          />
        </div>

        {/* If no owner assigned */}
        <div className="text-center py-4">
          <p
            className={`text-sm mb-3 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("no_owner_assigned")}
          </p>
          {USER_ROLE === "admin" && (
            <button
              onClick={() => setShowChangeOwnerModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <UserCog className="w-4 h-4" />
              {t("assign_owner")}
            </button>
          )}
        </div>
      </div>

      {/* Business Contact */}
      <div
        className={`p-4 rounded-lg ${
          theme === "dark"
            ? "bg-gray-800/50 border border-gray-700"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <h3
          className={`mb-4 ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          }`}
        >
          {t("business_email")}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail
              className={`w-5 h-5 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            />
            <a
              href={`mailto:${business?.busiEmail}`}
              className="text-teal-600 hover:text-teal-700 transition-colors"
            >
              {business?.busiEmail ? business.busiEmail : "-"}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Phone
              className={`w-5 h-5 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            />
            <a
              href={`tel:${business?.phoneNumber}`}
              className="text-teal-600 hover:text-teal-700 transition-colors"
            >
              {business?.phoneNumber ? business.phoneNumber : "-"}
            </a>
          </div>
        </div>
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
          className={`mb-4 ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          }`}
        >
          {t("contact_person")}
        </h3>

        <div className="space-y-2">
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
            <span
              className={theme === "dark" ? "text-gray-500" : "text-gray-500"}
            >
              {t("name")}:
            </span>{" "}
            {business?.contactDetails?.name || "-"}
          </p>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
            <span
              className={theme === "dark" ? "text-gray-500" : "text-gray-500"}
            >
              {t("email")}:
            </span>{" "}
            {business?.contactDetails?.email || "-"}
          </p>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
            <span
              className={theme === "dark" ? "text-gray-500" : "text-gray-500"}
            >
              {t("phone")}:
            </span>{" "}
            {business?.contactDetails?.phone || "-"}
          </p>
        </div>
      </div>

      {/* Collaborators */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>
            {t("collaborators")}
          </h3>
          {on_invite_collaborator && (
            <button
              onClick={on_invite_collaborator}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {t("invite_user")}
            </button>
          )}
        </div>

        <p
          className={`text-sm ${
            theme === "dark" ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {t("no_collaborators") || t("no_collaborators_added_yet")}
        </p>
      </div>
    </div>
  );
};

export default BusinessContactDetails;
