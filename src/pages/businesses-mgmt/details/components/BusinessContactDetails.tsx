import { useState, type FC } from "react";
import {
  UserCog,
  Mail,
  Phone,
  Plus,
  Calendar,
  Clock,
  UserX,
} from "lucide-react";

import ChangeOwnerModal from "./ChangeOwnerModal";
import { useUserRoles } from "@/hooks/useUserRoles";

interface BusinessContactDetailsProps {
  isDark: boolean;
  t: (key: string) => string;
  refetch: () => void;
  business: {
    busiEmail: string;
    phoneNumber: string;
    contactDetails: {
      name: string;
      email: string;
      phone: string;
    };
    userId: {
      _id: string;
      role: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      lastLogin: string;
      createdAt: string;
      updatedAt: string;
    };
    collabrationUser?: any[];
  };
  on_invite_collaborator?: () => void;
}

const BusinessContactDetails: FC<BusinessContactDetailsProps> = ({
  t,
  isDark,
  business,
  refetch,
  on_invite_collaborator,
}) => {
  const { isTraveller } = useUserRoles();

  const [isOwnerChangeModalOpen, setIsOwnerChangeModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        {/* Business Owner */}
        <div className={`p-4 rounded-xl border-2 transition-all duration-200`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCog
                className={`w-5 h-5 ${isDark ? "text-teal-400" : "text-teal-700"}`}
                aria-hidden="true"
              />
              <h3
                className={`font-semibold ${isDark ? "text-teal-300" : "text-teal-900"}`}
                id="business-owner-heading"
              >
                {t("business_owner")}
              </h3>
            </div>

            {!isTraveller && (
              <button
                onClick={() => setIsOwnerChangeModalOpen(true)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 
          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
            isDark
              ? "bg-teal-600 hover:bg-teal-700 text-white focus:ring-offset-gray-900"
              : "bg-teal-600 hover:bg-teal-700 text-white focus:ring-offset-white"
          }`}
                aria-label={t("change_owner_label") || "Change business owner"}
              >
                <UserCog className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("change_owner")}</span>
                <span className="sm:hidden">{t("change")}</span>
              </button>
            )}
          </div>

          {/* Owner Details or Empty State */}
          {business?.userId ? (
            <div
              className="space-y-3"
              role="region"
              aria-labelledby="business-owner-heading"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div
                  className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                    isDark
                      ? "bg-teal-900/50 text-teal-300 border border-teal-700"
                      : "bg-teal-100 text-teal-700 border border-teal-200"
                  }`}
                  aria-hidden="true"
                >
                  {(business.userId.firstName?.[0] || "?").toUpperCase()}
                  {(business.userId.lastName?.[0] || "").toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {business.userId.firstName} {business.userId.lastName}
                  </p>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t(business.userId.role) || business.userId.role}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}">
                {/* Email */}
                {business.userId.email && (
                  <a
                    target="_blank"
                    href={`mailto:${business.userId.email}`}
                    className={`flex items-center gap-2 text-sm group ${
                      isDark
                        ? "text-gray-300 hover:text-teal-300"
                        : "text-gray-600 hover:text-teal-700"
                    }`}
                    aria-label={`Email: ${business.userId.email}`}
                  >
                    <Mail
                      className={`w-4 h-4 shrink-0 ${isDark ? "text-gray-500 group-hover:text-teal-400" : "text-gray-400 group-hover:text-teal-600"}`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{business.userId.email}</span>
                  </a>
                )}

                {/* Phone */}
                {business.userId.phoneNumber && (
                  <a
                    href={`tel:${business.userId.phoneNumber}`}
                    className={`flex items-center gap-2 text-sm group ${
                      isDark
                        ? "text-gray-300 hover:text-teal-300"
                        : "text-gray-600 hover:text-teal-700"
                    }`}
                    aria-label={`Phone: ${business.userId.phoneNumber}`}
                  >
                    <Phone
                      className={`w-4 h-4 shrink-0 ${isDark ? "text-gray-500 group-hover:text-teal-400" : "text-gray-400 group-hover:text-teal-600"}`}
                      aria-hidden="true"
                    />
                    <span>{business.userId.phoneNumber}</span>
                  </a>
                )}

                {/* Member Since */}
                {business.userId.createdAt && (
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>
                      {t("member_since")}:{" "}
                      {new Date(business.userId.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                )}

                {/* Last Active (if available) */}
                {business.userId.lastLogin && (
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>
                      {t("last_active")}:{" "}
                      {new Date(business.userId.lastLogin).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="text-center py-6"
              role="status"
              aria-live="polite"
              aria-label={t("no_owner_assigned") || "No owner assigned"}
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDark ? "bg-gray-800" : "bg-gray-100"
                }`}
                aria-hidden="true"
              >
                <UserX
                  className={`w-8 h-8 ${isDark ? "text-gray-600" : "text-gray-400"}`}
                />
              </div>
              <p
                className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                {t("no_owner_assigned")}
              </p>
              <p
                className={`text-xs mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {t("no_owner_desc") ||
                  "Assign an owner to manage this business"}
              </p>
              {!isTraveller && (
                <button
                  onClick={() => setIsOwnerChangeModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2 mx-auto focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  aria-label={
                    t("assign_owner_label") || "Assign a business owner"
                  }
                >
                  <UserCog className="w-4 h-4" aria-hidden="true" />
                  {t("assign_owner")}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Business Contact */}
        <div
          className={`p-4 rounded-lg ${
            isDark
              ? "bg-gray-800/50 border border-gray-700"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <h3 className={`mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            {t("business_email")}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail
                className={`w-5 h-5 ${
                  isDark ? "text-gray-400" : "text-gray-600"
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
                  isDark ? "text-gray-400" : "text-gray-600"
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
            isDark
              ? "bg-gray-800/50 border border-gray-700"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <h3 className={`mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            {t("contact_person")}
          </h3>

          <div className="space-y-2">
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
              <span className={isDark ? "text-gray-500" : "text-gray-500"}>
                {t("name")}:
              </span>{" "}
              {business?.contactDetails?.name || "-"}
            </p>
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
              <span className={isDark ? "text-gray-500" : "text-gray-500"}>
                {t("email")}:
              </span>{" "}
              {business?.contactDetails?.email || "-"}
            </p>
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
              <span className={isDark ? "text-gray-500" : "text-gray-500"}>
                {t("phone")}:
              </span>{" "}
              {business?.contactDetails?.phone || "-"}
            </p>
          </div>
        </div>

        {/* Collaborators */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className={isDark ? "text-gray-200" : "text-gray-800"}>
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
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            {t("no_collaborators") || t("no_collaborators_added_yet")}
          </p>
        </div>
      </div>
      {isOwnerChangeModalOpen && (
        <ChangeOwnerModal
          refetch={refetch}
          setIsOpen={setIsOwnerChangeModalOpen}
        />
      )}
    </>
  );
};

export default BusinessContactDetails;
