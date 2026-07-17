import clsx from "clsx";
import {
  AlignLeft,
  Building2,
  FileText,
  Globe,
  Landmark,
  Mail,
  MapPinned,
  Phone,
  User,
} from "lucide-react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";
import ImageWithFallback from "@/components/shared/ImageWithFallback";

interface TripInfoDetailsProps {
  t: (key: string) => string;
  trip?: ITripDetailsRes;
}

const TripInfoDetails: React.FC<TripInfoDetailsProps> = ({ t, trip }) => {
  const { isDark, textTertiary, textPrimary, borderColor, bgSecondary } =
    useThemeClasses();
  const { dmosAuthorities, allWebsites } = useCommon();

  const selectedDmo = dmosAuthorities?.find((d) => d._id === trip?.dmoId);
  const selectedAuthority = selectedDmo?.authorities?.find(
    (a: any) => a._id === trip?.authorityId,
  );
  const selectedWebsites =
    allWebsites?.filter((w) => trip?.associatedWebsiteIds?.includes(w._id)) ??
    [];

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
      <div
        className={clsx(
          "rounded-xl border p-4",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className={clsx("rounded-lg border p-3", borderColor, bgSecondary)}
          >
            <span
              className={clsx("text-xs flex items-center gap-1", textTertiary)}
            >
              <Landmark className="w-3 h-3" />
              {t("select_dmo")}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <ImageWithFallback
                src={selectedDmo?.logoPath}
                alt={selectedDmo?.name}
                className="w-6 h-6 object-contain rounded"
              />
              <p className={clsx("text-sm", textPrimary)}>
                {selectedDmo?.name || "-"}
              </p>
            </div>
          </div>

          <div
            className={clsx("rounded-lg border p-3", borderColor, bgSecondary)}
          >
            <span
              className={clsx("text-xs flex items-center gap-1", textTertiary)}
            >
              <Building2 className="w-3 h-3" />
              {t("select_authority")}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <ImageWithFallback
                src={selectedAuthority?.logoPath}
                alt={selectedAuthority?.name}
                className="w-6 h-6 object-contain rounded"
              />
              <p className={clsx("text-sm", textPrimary)}>
                {selectedAuthority?.name || "-"}
              </p>
            </div>
          </div>
        </div>

        {selectedWebsites.length > 0 && (
          <div className="mt-3">
            <span
              className={clsx("text-xs flex items-center gap-1", textTertiary)}
            >
              <Globe className="w-3 h-3" />
              {t("website_visibility")}
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedWebsites.map((website) => (
                <div
                  key={website._id}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg border px-2 py-1",
                    borderColor,
                    bgSecondary,
                  )}
                >
                  <ImageWithFallback
                    src={website.logo}
                    alt={website.name}
                    className="w-5 h-5 object-contain rounded"
                  />
                  <span className={clsx("text-sm", textPrimary)}>
                    {website.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripInfoDetails;
