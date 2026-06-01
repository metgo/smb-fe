import clsx from "clsx";
import { type FC } from "react";
import { AlignLeft, FileText } from "lucide-react";
import { UserRole } from "@/enums/user.types";
import { useAppSelector } from "@/hooks/hooks";
import { ConnectedWebsites } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";

interface PoiInfoDetailsProps {
  t: (key: string) => string;
  poi: any;
}

const PoiInfoDetails: FC<PoiInfoDetailsProps> = ({ t, poi }) => {
  const { isDark } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <DescriptionCard
        title={t("short_description")}
        content={
          poi?.shortDescriptionHe ||
          poi?.shortDescription ||
          poi?.shortDescriptionAr ||
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
      <DescriptionCard
        title={t("full_description")}
        content={
          poi?.descriptionHe || poi?.description || poi?.descriptionAr || "-"
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
        preWrap={true}
      />
      {poi?.associatedWebsites?.length > 0 && (
        <ConnectedWebsites t={t} associatedWebsites={poi.associatedWebsites} />
      )}
      {userRole === UserRole.SUPERADMIN && poi?.internalNotes && (
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
