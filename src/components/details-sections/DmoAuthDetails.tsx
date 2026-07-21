import clsx from "clsx";
import { Building2, Globe, Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ImageWithFallback from "@/components/shared/ImageWithFallback";

interface DmoAuthDetailsProps {
  dmoId?: string;
  authorityId?: string;
  associatedWebsiteIds?: string[];
}

const DmoAuthDetails: React.FC<DmoAuthDetailsProps> = ({
  dmoId,
  authorityId,
  associatedWebsiteIds,
}) => {
  const { t } = useTranslation("common");
  const { isDark, textTertiary, textPrimary, borderColor, bgSecondary } =
    useThemeClasses();
  const { dmosAuthorities, allWebsites } = useCommon();

  const selectedDmo = dmosAuthorities?.find((d) => d._id === dmoId);
  const selectedAuthority = selectedDmo?.authorities?.find(
    (a: any) => a._id === authorityId,
  );
  const selectedWebsites =
    allWebsites?.filter((w) => associatedWebsiteIds?.includes(w._id)) ?? [];

  return (
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
  );
};

export default DmoAuthDetails;
