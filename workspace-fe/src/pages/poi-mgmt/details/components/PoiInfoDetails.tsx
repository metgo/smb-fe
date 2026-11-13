import clsx from "clsx";
import { type FC } from "react";
import { AlignLeft, FileText } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";
import {
  ConnectedDmoAuthorityWebsites,
  LocationDetailsclosed,
} from "@/components/details-sections";
import { clientSitePath } from "@/lib/clientSitePathnames";
import { useUserRoles } from "@/hooks/useUserRoles";

interface PoiInfoDetailsProps {
  t: (key: string) => string;
  poi: any;
}

const PoiInfoDetails: FC<PoiInfoDetailsProps> = ({ t, poi }) => {
  const { isDark } = useThemeClasses();
  const { isSuperadmin } = useUserRoles();

  return (
    <div className="space-y-6">
      <DescriptionCard
        title={t("short_description")}
        content={poi?.shortDescription}
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
        title={t("full_description")}
        content={poi?.description}
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
        preWrap={true}
      />

      <LocationDetailsclosed
        purpose="POI"
        address={poi?.address}
        lat={poi?.geoLocation?.lat ?? poi?.location?.coordinates?.[0]}
        long={poi?.geoLocation?.long ?? poi?.location?.coordinates?.[1]}
      />

      <ConnectedDmoAuthorityWebsites
        dmoId={poi?.dmoId}
        authorityId={poi?.authorityId}
        websiteIds={poi?.associatedWebsiteIds || []}
        pathname={clientSitePath.poiDetails + "/" + poi?.slug}
      />

      {isSuperadmin && poi?.internalNotes && (
        <div
          className={`p-4 rounded-lg ${isDark ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-200"}`}
        >
          <h3
            className={`text-sm mb-2 ${isDark ? "text-yellow-400" : "text-yellow-800"}`}
          >
            {t("internal_notes")}
          </h3>
          <p className={isDark ? "text-yellow-300" : "text-yellow-900"}>
            {poi?.internalNotes}
          </p>
        </div>
      )}
    </div>
  );
};

export default PoiInfoDetails;
