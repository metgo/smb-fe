import clsx from "clsx";
import { type FC } from "react";
import { AlignLeft, BadgePercent, FileText, Gift } from "lucide-react";

import { getLngWiseStr } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";
import {
  ConnectedDmoAuthorityWebsites,
  DiscountWebsiteQR,
  LocationDetailsclosed,
} from "@/components/details-sections";
import { clientSitePath } from "@/lib/clientSitePathnames";

interface Business {
  slug: string;
  geoLocation: {
    lat: string | number;
    long: string | number;
  };
  location?: {
    coordinates?: [number, number] | number[];
  };
  address: {
    location: string;
    city: string;
    country: string;
  };
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
  dmoId: string;
  authorityId: string;
  associatedWebsiteIds: string[];
  _id?: string;
  providesDiscount?: boolean;
  discountBoxes: string[];
  discountConfigType: string;

  // Superadmin-only flag marking this business as a regional discount supplier
  markedAsSupplier?: boolean;
}

interface BusinessInfoDetailsProps {
  t: (key: string) => string;
  business: Business;
}

/* ---------- Component ---------- */

const BusinessInfoDetails: FC<BusinessInfoDetailsProps> = ({ t, business }) => {
  const { isDark, language } = useThemeClasses();
  // const { userRole } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      {/* Short Description */}
      <DescriptionCard
        title={t("short_description")}
        content={getLngWiseStr(
          language,
          business?.shortDescription,
          business?.shortDescriptionHe,
          business?.shortDescriptionAr,
        )}
        icon={
          <FileText
            className={clsx(isDark ? "text-blue-400" : "text-blue-600")}
          />
        }
        iconBgClass={isDark ? "bg-blue-500/20" : "bg-blue-100"}
        isDark={isDark}
      />
      {/* Full Description */}
      <DescriptionCard
        title={t("full_description")}
        content={getLngWiseStr(
          language,
          business?.description,
          business?.descriptionHe,
          business?.descriptionAr,
        )}
        icon={
          <AlignLeft
            className={clsx(isDark ? "text-purple-400" : "text-purple-600")}
          />
        }
        iconBgClass={isDark ? "bg-purple-500/20" : "bg-purple-100"}
        isDark={isDark}
        preWrap={true} // preserves line breaks
      />

      {/* Location details */}
      <LocationDetailsclosed
        purpose="Business"
        address={business?.address}
        lat={business?.geoLocation?.lat ?? business?.location?.coordinates?.[0]}
        long={
          business?.geoLocation?.long ?? business?.location?.coordinates?.[1]
        }
      />

      {/* Traveller discount / gift offer */}
      {business?.providesDiscount && business?.discountBoxes?.length > 0 && (
        <div
          className={clsx(
            "rounded-xl border p-4",
            isDark
              ? "border-teal-800/40 bg-teal-950/20"
              : "border-teal-200 bg-teal-50/60",
          )}
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className={clsx(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                isDark
                  ? "bg-teal-900/40 text-teal-300"
                  : "bg-teal-100 text-teal-700",
              )}
            >
              {business?.discountConfigType === "GIFT" ? (
                <Gift className="h-5 w-5" />
              ) : (
                <BadgePercent className="h-5 w-5" />
              )}
            </span>
            <h3
              className={clsx(
                "text-sm font-medium",
                isDark ? "text-gray-100" : "text-gray-900",
              )}
            >
              {business?.discountConfigType === "GIFT"
                ? t("gift")
                : t("discount")}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {business.discountBoxes.map((box, index) => (
              <div
                key={index}
                className={clsx(
                  "rounded-lg border px-3 py-2 text-sm",
                  isDark
                    ? "border-gray-700 bg-gray-900 text-gray-100"
                    : "border-gray-200 bg-white text-gray-900",
                )}
              >
                {business?.discountConfigType === "DISCOUNT" ? `${box}%` : box}
              </div>
            ))}
          </div>
        </div>
      )}

      <ConnectedDmoAuthorityWebsites
        dmoId={business?.dmoId}
        authorityId={business?.authorityId}
        websiteIds={business?.associatedWebsiteIds}
        pathname={clientSitePath.businessDetails + "/" + business?.slug}
      />

      {/* Regional discount website QR — shown whenever the business is marked as
          a supplier, independent of the vendor's providesDiscount flag */}
      {business?.markedAsSupplier && (
        <DiscountWebsiteQR businessId={business?._id} />
      )}

      {/* Internal Notes */}
      {/* {userRole === UserRole.SUPERADMIN && business?.internalNotes && (
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
      )} */}

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
