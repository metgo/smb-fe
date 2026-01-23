import type { FC } from "react"
import { UserCog, Mail, Phone, Globe, Plus } from "lucide-react"

interface BusinessContactDetailsProps {
  theme: Theme
  t: (key: string) => string
  business: Business
  userRole: string
  on_change_owner?: () => void
  on_invite_collaborator?: () => void
}

/* ---------- Component ---------- */

const BusinessContactDetails: FC<BusinessContactDetailsProps> = ({
  theme,
  t,
  business,
  userRole,
  on_change_owner,
  on_invite_collaborator,
}) => {
  return (
    <div className="space-y-6">
      {/* Business Owner */}
      <div
        className={`p-4 rounded-lg border-2 ${theme === "dark"
            ? "bg-linear-to-br from-teal-900/20 to-blue-900/20 border-teal-800"
            : "bg-linear-to-br from-teal-50 to-blue-50 border-teal-300"
          }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCog
              className={`w-5 h-5 ${theme === "dark" ? "text-teal-400" : "text-teal-700"}`}
            />
            <h3 className={theme === "dark" ? "text-teal-300" : "text-teal-900"}>
              {t('business_owner')}
            </h3>
          </div>

          {userRole === "admin" && on_change_owner && (
            <button
              onClick={on_change_owner}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${theme === "dark"
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
                }`}
            >
              <UserCog className="w-4 h-4" />
              {t('change_owner')}
            </button>
          )}
        </div>

        {business?.owner ? (
          <div className="space-y-2">
            <p className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>
              <span className={theme === "dark" ? "text-gray-500" : "text-gray-600"}>
                {t('name')}:
              </span>{" "}
              <strong>{business?.owner?.name}</strong>
            </p>
            <p className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>
              <span className={theme === "dark" ? "text-gray-500" : "text-gray-600"}>
                {t('email')}:
              </span>{" "}
              {business?.owner?.email}
            </p>
            <p className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>
              <span className={theme === "dark" ? "text-gray-500" : "text-gray-600"}>
                {t('phone')}:
              </span>{" "}
              {business?.owner?.phone}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className={`text-sm mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {t('no_owner_assigned')}
            </p>
            {userRole === "admin" && on_change_owner && (
              <button
                onClick={on_change_owner}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <UserCog className="w-4 h-4" />
                {t('assign_owner')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Business Contact */}
      <div
        className={`p-4 rounded-lg ${theme === "dark"
            ? "bg-gray-800/50 border border-gray-700"
            : "bg-gray-50 border border-gray-200"
          }`}
      >
        <h3 className={`mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
          {t('business_email')}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
            <a
              href={`mailto:${business?.email}`}
              className="text-teal-600 hover:text-teal-700 transition-colors"
            >
              {business?.email}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Phone className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
            <a
              href={`tel:${business.phone}`}
              className="text-teal-600 hover:text-teal-700 transition-colors"
            >
              {business?.phone}
            </a>
          </div>

          {business?.website && (
            <div className="flex items-center gap-3">
              <Globe className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <a
                href={business?.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 transition-colors"
              >
                {business?.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Contact Person */}
      <div
        className={`p-4 rounded-lg ${theme === "dark"
            ? "bg-gray-800/50 border border-gray-700"
            : "bg-gray-50 border border-gray-200"
          }`}
      >
        <h3 className={`mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
          {t('contact_person')}
        </h3>

        <div className="space-y-2">
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
            <span className={theme === "dark" ? "text-gray-500" : "text-gray-500"}>
              {t('name')}:
            </span>{" "}
            {business?.contactDetails?.name}
          </p>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
            <span className={theme === "dark" ? "text-gray-500" : "text-gray-500"}>
              {t('email')}:
            </span>{" "}
            {business.contactDetails?.email}
          </p>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
            <span className={theme === "dark" ? "text-gray-500" : "text-gray-500"}>
              {t('phone')}:
            </span>{" "}
            {business.contactDetails?.phone}
          </p>
        </div>
      </div>

      {/* Collaborators */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>
            {t('collaborators')}
          </h3>
          {on_invite_collaborator && (
            <button
              onClick={on_invite_collaborator}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {t('invite_user')}
            </button>
          )}
        </div>

        <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
          {t('no_collaborators') || t('no_collaborators_added_yet')}
        </p>
      </div>
    </div>
  )
}

export default BusinessContactDetails
