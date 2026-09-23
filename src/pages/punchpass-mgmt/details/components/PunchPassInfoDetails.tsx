import clsx from "clsx";
import {
  AlignLeft,
  BriefcaseBusinessIcon,
  CalendarClock,
  DollarSign,
  FileText,
  Package,
  Percent,
  Tag,
} from "lucide-react";

import { getLngWiseStr } from "@/helpers";
import { formatILS } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";

const TILE_COLORS = {
  blue: {
    text: "text-blue-600",
    darkText: "text-blue-400",
    bg: "bg-blue-100",
    darkBg: "bg-blue-500/20",
  },
  purple: {
    text: "text-purple-600",
    darkText: "text-purple-400",
    bg: "bg-purple-100",
    darkBg: "bg-purple-500/20",
  },
  green: {
    text: "text-green-600",
    darkText: "text-green-400",
    bg: "bg-green-100",
    darkBg: "bg-green-500/20",
  },
  orange: {
    text: "text-orange-600",
    darkText: "text-orange-400",
    bg: "bg-orange-100",
    darkBg: "bg-orange-500/20",
  },
  gray: {
    text: "text-gray-600",
    darkText: "text-gray-400",
    bg: "bg-gray-100",
    darkBg: "bg-gray-500/20",
  },
};

type TTileColor = keyof typeof TILE_COLORS;

interface PunchPassInfoDetailsProps {
  t: (key: string) => string;
  punchPass?: IPunchPassDetailsRes;
}

interface InfoTileProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
}

const InfoTile = ({ icon, iconBg, label, value, subValue }: InfoTileProps) => {
  const { isDark } = useThemeClasses();

  return (
    <div
      className={clsx(
        "flex items-start gap-3 rounded-lg p-3 md:p-4",
        isDark ? "bg-gray-900/50" : "bg-gray-50",
      )}
    >
      <div className={clsx("p-2 rounded-lg shrink-0", iconBg)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            "text-xs font-semibold uppercase tracking-wide mb-1",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {label}
        </p>
        <p
          className={clsx(
            "text-sm md:text-base font-medium truncate",
            isDark ? "text-gray-200" : "text-gray-800",
          )}
        >
          {value}
        </p>
        {subValue && <p className="text-xs mt-0.5 text-gray-500">{subValue}</p>}
      </div>
    </div>
  );
};

const PunchPassInfoDetails: React.FC<PunchPassInfoDetailsProps> = ({
  t,
  punchPass,
}) => {
  const { isDark, language } = useThemeClasses();

  const price = punchPass?.price;
  const quantity = punchPass?.quantity;
  const hasDiscount =
    price?.markedPrice != null &&
    price?.sellingPrice != null &&
    price.markedPrice !== price.sellingPrice;

  const iconClass = (color: TTileColor) =>
    clsx(
      "w-5 h-5",
      isDark ? TILE_COLORS[color].darkText : TILE_COLORS[color].text,
    );
  const iconBg = (color: TTileColor) =>
    isDark ? TILE_COLORS[color].darkBg : TILE_COLORS[color].bg;

  return (
    <div className="space-y-6">
      <DescriptionCard
        title={t("name")}
        content={getLngWiseStr(
          language,
          punchPass?.name,
          punchPass?.nameHe,
          punchPass?.nameAr,
        )}
        icon={<FileText className={iconClass("blue")} />}
        iconBgClass={iconBg("blue")}
        isDark={isDark}
      />

      <DescriptionCard
        title={t("description")}
        content={getLngWiseStr(
          language,
          punchPass?.description,
          punchPass?.descriptionHe,
          punchPass?.descriptionAr,
        )}
        icon={<AlignLeft className={iconClass("purple")} />}
        iconBgClass={iconBg("purple")}
        isDark={isDark}
        preWrap
      />

      <DescriptionCard
        title={t("business_name")}
        content={punchPass?.businessId?.name || "-"}
        icon={<BriefcaseBusinessIcon className={iconClass("purple")} />}
        iconBgClass={iconBg("purple")}
        isDark={isDark}
        preWrap
      />

      <div
        className={clsx(
          "rounded-xl border p-3 md:p-6",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <h3
          className={clsx(
            "text-xs md:text-sm font-semibold uppercase tracking-wide mb-2 md:mb-4",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {t("pricing_stock_dates")}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <InfoTile
            icon={<Tag className={iconClass("gray")} />}
            iconBg={iconBg("gray")}
            label={t("marked_price")}
            value={
              price?.markedPrice != null ? formatILS(price.markedPrice) : "-"
            }
          />
          <InfoTile
            icon={<DollarSign className={iconClass("green")} />}
            iconBg={iconBg("green")}
            label={t("selling_price")}
            value={
              price?.sellingPrice != null ? formatILS(price.sellingPrice) : "-"
            }
            subValue={
              hasDiscount && price?.discountPercent ? (
                <span className="inline-flex items-center gap-0.5">
                  <Percent className="w-3 h-3" />
                  {price.discountPercent}
                </span>
              ) : undefined
            }
          />
          <InfoTile
            icon={<Package className={iconClass("blue")} />}
            iconBg={iconBg("blue")}
            label={t("quantity")}
            value={
              quantity?.isUnlimited
                ? t("unlimited")
                : (quantity?.initial ?? "-")
            }
            subValue={
              !quantity?.isUnlimited && quantity?.remaining != null
                ? `${t("remaining")}: ${quantity.remaining}`
                : undefined
            }
          />
          <InfoTile
            icon={<CalendarClock className={iconClass("orange")} />}
            iconBg={iconBg("orange")}
            label={t("expiry_months")}
            value={punchPass?.expiryDate ?? "-"}
          />
        </div>
      </div>
    </div>
  );
};

export default PunchPassInfoDetails;
