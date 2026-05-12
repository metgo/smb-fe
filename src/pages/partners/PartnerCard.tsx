import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import {
  Edit,
  ExternalLink,
  Handshake,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface PartnerCardProps {
  partner: IPartnersRes;
  websiteMap: Record<string, IWebsite>;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function PartnerCard({
  partner,
  websiteMap,
  onEdit,
  onDelete,
  onToggleActive,
}: PartnerCardProps) {
  const { t } = useTranslation("website_settings");
  const {
    cardClasses,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    isDark,
  } = useThemeClasses();

  const assignedWebsites = (partner.websites ?? [])
    .map((id) => websiteMap[id])
    .filter(Boolean);

  return (
    <div
      className={clsx("rounded-xl overflow-hidden group relative", cardClasses)}
    >
      {/* Logo area */}
      <div
        className={clsx(
          "relative h-28 flex items-center justify-center",
          isDark ? "bg-gray-700/60" : "bg-gray-100",
        )}
      >
        {partner.logo ? (
          <ImageWithFallback
            src={partner.logo}
            alt={partner.name}
            className="h-16 w-auto object-contain"
          />
        ) : (
          <Handshake className="w-12 h-12 text-gray-400" />
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-2.5">
        {/* Name */}
        <h3 className={clsx("text-base font-semibold truncate", textPrimary)}>
          {partner.name}
        </h3>

        {/* Description – 2 lines max */}
        {partner.description && (
          <p
            className={clsx(
              "text-xs line-clamp-2 leading-relaxed",
              textSecondary,
            )}
          >
            {partner.description}
          </p>
        )}

        {/* Site URL */}
        {partner.siteUrl && (
          <a
            href={partner.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "flex items-center gap-1.5 text-xs truncate transition-colors hover:text-violet-500",
              textTertiary,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {partner.siteUrl.replace(/^https?:\/\//, "")}
            </span>
          </a>
        )}

        {/* Assigned website logos */}
        {assignedWebsites.length > 0 && (
          <div
            className={clsx(
              "flex items-center gap-1.5 pt-1 border-t",
              borderColor,
            )}
          >
            {assignedWebsites.slice(0, 5).map((website) =>
              website.logo ? (
                <img
                  key={website._id}
                  src={website.logo}
                  alt={website.name}
                  title={website.name}
                  className={clsx(
                    "w-6 h-6 rounded-full object-contain border",
                    isDark
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-200 bg-white",
                  )}
                />
              ) : (
                <div
                  key={website._id}
                  title={website.name}
                  className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center border text-[9px] font-bold",
                    isDark
                      ? "border-gray-600 bg-gray-700 text-gray-300"
                      : "border-gray-200 bg-gray-100 text-gray-500",
                  )}
                >
                  {website.name.slice(0, 2).toUpperCase()}
                </div>
              ),
            )}
            {assignedWebsites.length > 5 && (
              <span className={clsx("text-[10px] font-medium", textTertiary)}>
                +{assignedWebsites.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      <div
        className={clsx(
          "absolute top-2 left-0 z-50 shadow-md px-4 py-0.5 text-white rounded-r-xl font-bold text-sm",
          partner.isActive ? "bg-green-600 " : "bg-red-500",
        )}
      >
        <span>
          {partner.isActive ? t("partner_active") : t("partner_inactive")}
        </span>
      </div>

      {/* Hover actions */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        {[
          {
            title: t("edit"),
            icon: <Edit size={14} />,
            colorClass: "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20",
            onClick: onEdit,
          },
          {
            title: partner.isActive ? t("deactivate") : t("activate"),
            icon: partner.isActive ? (
              <ToggleRight size={14} />
            ) : (
              <ToggleLeft size={14} />
            ),
            colorClass: partner.isActive
              ? "text-green-400 bg-green-500/10 hover:bg-green-500/20"
              : "text-gray-400 bg-gray-500/10 hover:bg-gray-500/20",
            onClick: onToggleActive,
          },
          {
            title: t("delete"),
            icon: <Trash2 size={14} />,
            colorClass: "text-red-400 bg-red-500/10 hover:bg-red-500/20",
            onClick: onDelete,
          },
        ].map((action, i) => (
          <div
            key={action.title}
            className="opacity-0 group-hover:opacity-100 transition-all duration-150 relative group/tip"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            <button
              onClick={action.onClick}
              className={clsx(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                action.colorClass,
              )}
            >
              {action.icon}
            </button>
            <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity shadow-lg z-10">
              {action.title}
              <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PartnerCard;
