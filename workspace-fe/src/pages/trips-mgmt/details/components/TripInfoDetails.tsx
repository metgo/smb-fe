import clsx from "clsx";
import {
  AlignLeft,
  FileText,
  Mail,
  MapPinned,
  Phone,
  User,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";
import { ConnectedDmoAuthorityWebsites } from "@/components/details-sections";
import { clientSitePath } from "@/lib/clientSitePathnames";

interface TripInfoDetailsProps {
  t: (key: string) => string;
  trip?: ITripDetailsRes;
}

const TripInfoDetails: React.FC<TripInfoDetailsProps> = ({ t, trip }) => {
  const { isDark, textTertiary, textPrimary, borderColor, bgSecondary } =
    useThemeClasses();

  return (
    <div className="space-y-6">
      <DescriptionCard
        title={t("short_description")}
        content={trip?.shortDescription || ""}
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

      <DescriptionCard
        title={t("description")}
        content={trip?.description || ""}
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
        preWrap
      />

      <div
        className={clsx(
          "rounded-xl border p-4",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={clsx(
              "p-2 rounded-lg",
              isDark ? "bg-teal-500/20" : "bg-teal-100",
            )}
          >
            <MapPinned
              className={clsx(
                "w-5 h-5",
                isDark ? "text-teal-400" : "text-teal-600",
              )}
            />
          </div>
          <h3 className={clsx("text-md font-semibold", textPrimary)}>
            {t("total_distance_covered")}
          </h3>
        </div>
        <p className={clsx("text-sm md:text-base md:pl-11", textPrimary)}>
          {trip?.totalDistanceCovered ?? "-"}
        </p>
      </div>

      <div
        className={clsx(
          "rounded-xl border p-4",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={clsx(
              "p-2 rounded-lg",
              isDark ? "bg-green-500/20" : "bg-green-100",
            )}
          >
            <User
              className={clsx(
                "w-5 h-5",
                isDark ? "text-green-400" : "text-green-600",
              )}
            />
          </div>
          <h3 className={clsx("text-md font-semibold", textPrimary)}>
            {t("contact_details")}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:pl-11">
          <div
            className={clsx("rounded-lg border p-3", borderColor, bgSecondary)}
          >
            <span className={clsx("text-xs", textTertiary)}>
              {t("contact_name")}
            </span>
            <p className={clsx("text-sm mt-1", textPrimary)}>
              {trip?.contactDetails?.name || "-"}
            </p>
          </div>

          <div
            className={clsx("rounded-lg border p-3", borderColor, bgSecondary)}
          >
            <span
              className={clsx("text-xs flex items-center gap-1", textTertiary)}
            >
              <Phone className="w-3 h-3" />
              {t("contact_phone_number")}
            </span>
            <p className={clsx("text-sm mt-1", textPrimary)}>
              {trip?.contactDetails?.phoneNumber || "-"}
            </p>
          </div>

          <div
            className={clsx("rounded-lg border p-3", borderColor, bgSecondary)}
          >
            <span
              className={clsx("text-xs flex items-center gap-1", textTertiary)}
            >
              <Mail className="w-3 h-3" />
              {t("contact_email")}
            </span>
            <p className={clsx("text-sm mt-1", textPrimary)}>
              {trip?.contactDetails?.email || "-"}
            </p>
          </div>
        </div>
      </div>

      <ConnectedDmoAuthorityWebsites
        dmoId={trip?.dmoId}
        authorityId={trip?.authorityId}
        websiteIds={trip?.associatedWebsiteIds || []}
        pathname={clientSitePath.trailDetails + "/" + trip?.slug}
      />
    </div>
  );
};

export default TripInfoDetails;
