import type { FC } from "react";
import { Accessibility, Users } from "lucide-react";

/* ---------- Props ---------- */

interface BusinessAttributesDetailsProps {
  theme: Theme;
  t: (key: string) => string;
  business: Business;
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
          {business?.accessibility?.map((option, idx) => (
            <span
              key={idx}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                  : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}
            >
              <Accessibility className="w-4 h-4" />
              {option}
            </span>
          ))}
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
          {business.groupTypes.map((type, idx) => (
            <span
              key={idx}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                  : "bg-purple-100 text-purple-800 border border-purple-300"
              }`}
            >
              <Users className="w-4 h-4" />
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessAttributesDetails;
