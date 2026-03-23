import clsx from "clsx";
import { type FC } from "react";
import { AlignLeft, FileText } from "lucide-react";
import { UserRole } from "@/enums/user.types";
import { useAppSelector } from "@/hooks/hooks";
import { ConnectedWebsites } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";

interface Business {
  shortDescription: string;
  shortDescriptionAr: string;
  shortDescriptionHe: string;
  description: string;
  descriptionHe: string;
  descriptionAr: string;
  primaryCategoryId: string;
  subcategories: string[];
  tags: string[];
  impact: number;
  internalNotes?: string;
  status: string;
  rejectionNote?: string;
  associatedWebsites: { name: string; url: string }[];
}

interface BusinessInfoDetailsProps {
  t: (key: string) => string;
  business: Business;
}

/* ---------- Component ---------- */

const BusinessInfoDetails: FC<BusinessInfoDetailsProps> = ({ t, business }) => {
  const { isDark } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      {/* Short Description */}
      <DescriptionCard
        title={t("short_description")}
        content={
          business?.shortDescriptionHe ||
          business?.shortDescription ||
          business?.shortDescriptionAr ||
          "-"
        }
        icon={
          <FileText
            className={clsx(
              "w-5 h-5",
              isDark ? "text-blue-400" : "text-blue-600",
            )}
          />
        }
        iconBgClass={isDark ? "bg-blue-500/20" : "bg-blue-100"}
        isDark={isDark}
      />
      {/* Full Description */}
      <DescriptionCard
        title={t("full_description")}
        content={
          business?.descriptionHe ||
          business?.description ||
          business?.descriptionAr ||
          "-"
        }
        icon={
          <AlignLeft
            className={clsx(
              "w-5 h-5",
              isDark ? "text-purple-400" : "text-purple-600",
            )}
          />
        }
        iconBgClass={isDark ? "bg-purple-500/20" : "bg-purple-100"}
        isDark={isDark}
        preWrap={true} // preserves line breaks
      />
      {/* Website Connections */}
      {business?.associatedWebsites &&
        business?.associatedWebsites.length > 0 && (
          <ConnectedWebsites
            t={t}
            associatedWebsites={business?.associatedWebsites}
          />
        )}
      {/* Internal Notes */}
      {userRole === UserRole.SUPERADMIN && business?.internalNotes && (
        <div
          className={`p-4 rounded-lg ${isDark ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-200"}`}
        >
          <h3
            className={`text-sm mb-2 ${isDark ? "text-yellow-400" : "text-yellow-800"}`}
          >
            {t("internal_notes")}
          </h3>
          <p className={isDark ? "text-yellow-300" : "text-yellow-900"}>
            {business?.internalNotes}
          </p>
        </div>
      )}
      {/* Rejection Note */}
      {business?.status === "rejected" && business?.rejectionNote && (
        <div
          className={`p-4 rounded-lg ${isDark ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"}`}
        >
          <h3
            className={`text-sm mb-2 ${isDark ? "text-red-400" : "text-red-800"}`}
          >
            {t("rejection_note")}
          </h3>
          <p className={isDark ? "text-red-300" : "text-red-900"}>
            {business?.rejectionNote || t("no_rejection_note")}
          </p>
        </div>
      )}
    </div>
  );
};

export default BusinessInfoDetails;
