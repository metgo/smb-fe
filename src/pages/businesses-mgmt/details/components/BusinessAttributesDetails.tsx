import type { FC } from "react";
import { Accessibility, Users } from "lucide-react";

/* ---------- Props ---------- */

interface BusinessAttributesDetailsProps {
  theme: Theme;
  t: (key: string) => string;
  business: any;
}

/* ---------- Component ---------- */

const BusinessAttributesDetails: FC<BusinessAttributesDetailsProps> = ({
  t,
  theme,
  business,
}) => {
  return (
    <div className="space-y-6">
      {/* Accessibility Options */}
      <div>
        <h3
          className={`mb-3 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
        >
          {t("accessibility")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(business?.accessibilitiesId) &&
          business.accessibilitiesId.length > 0 ? (
            business.accessibilitiesId.map((option: any, idx: number) => (
              <span
                key={option?.id ?? idx} // Use option.id if exists, fallback to idx
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                  theme === "dark"
                    ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                <Accessibility className="w-4 h-4" />
                {option?.name ? option.name : "Unnamed Accessibility"}
              </span>
            ))
          ) : (
            <p className="text-sm italic text-gray-500">
              No accessibilities available
            </p>
          )}
        </div>
      </div>

      {/* Group Types */}
      <div>
        <h3
          className={`mb-3 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
        >
          {t("group_types")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(business?.groupTypesId) &&
          business.groupTypesId.length > 0 ? (
            business.groupTypesId.map((type: any, idx: number) => (
              <span
                key={type?.id ?? idx} // Use type.id if available, fallback to idx
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                  theme === "dark"
                    ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                    : "bg-purple-100 text-purple-800 border border-purple-300"
                }`}
              >
                <Users className="w-4 h-4" />
                {type?.name ? type.name : "Unnamed Group"}
              </span>
            ))
          ) : (
            <p className="text-sm italic text-gray-500">
              No group types available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessAttributesDetails;
