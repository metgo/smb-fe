import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Copy,
  Edit,
  ExternalLink,
  // Eye,
  // EyeOff,
  Globe,
  ScanEye,
  Trash2,
} from "lucide-react";

import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  website: IWebsiteListRes;
  onToggleActive: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function WebsiteCard({
  website,
  // onToggleActive,
  onPreview,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation("common");
  const { t: tw } = useTranslation("website_settings");
  const { cardClasses, textPrimary, textSecondary, textTertiary, isDark } =
    useThemeClasses();

  const [copied, setCopied] = useState(false);

  const score = website.score || 0;
  const scoreColor =
    score >= 72 ? "bg-teal-500" : score >= 43 ? "bg-amber-500" : "bg-red-500";
  const scoreTextColor =
    score >= 72
      ? "text-teal-500"
      : score >= 43
        ? "text-amber-500"
        : "text-red-500";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(website.identifierId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={clsx(
        "rounded-xl overflow-hidden group relative flex flex-col",
        cardClasses,
      )}
    >
      {/* Active badge */}
      <div
        className={clsx(
          "absolute top-2 left-0 z-20 shadow-md px-4 py-0.5 text-white rounded-r-xl font-bold text-xs",
          website.isActive ? "bg-green-800/60" : "bg-red-800/60",
        )}
      >
        {website.isActive ? t("active") : t("inactive")}
      </div>

      {/* Logo banner */}
      <div
        className={clsx(
          "relative h-24 sm:h-32 flex items-center justify-center shrink-0",
          isDark ? "bg-gray-700/60" : "bg-gray-100",
        )}
      >
        {website.logo ? (
          <ImageWithFallback
            src={website.logo}
            alt={website.websiteName}
            className="h-12 sm:h-20 w-auto max-w-[70%] object-contain"
          />
        ) : (
          <Globe className="w-12 h-12 text-gray-400" />
        )}
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4 flex flex-col gap-1.5 flex-1">
        {/* Name */}
        <h3
          className={clsx(
            "text-sm font-bold truncate leading-snug",
            textPrimary,
          )}
        >
          {website.websiteName}
        </h3>

        {/* Slogan */}
        {website.slogan && (
          <p className={clsx("text-xs truncate", textSecondary)}>
            {website.slogan}
          </p>
        )}

        {/* URL */}
        {website.url && (
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={clsx(
              "flex items-center gap-1 text-xs truncate hover:underline",
              textTertiary,
            )}
          >
            <ExternalLink size={11} className="shrink-0" />
            {website.url}
          </a>
        )}

        {/* Colors + copyable identifier */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1.5">
            {website.primaryColor && (
              <span
                title={`Primary: ${website.primaryColor}`}
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                style={{ background: website.primaryColor }}
              />
            )}
            {website.secondaryColor && (
              <span
                title={`Secondary: ${website.secondaryColor}`}
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                style={{ background: website.secondaryColor }}
              />
            )}
          </div>

          {website.identifierId && (
            <button
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy ID"}
              className={clsx(
                "flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors cursor-pointer",
                copied
                  ? "text-teal-500 bg-teal-500/10"
                  : clsx(
                      textTertiary,
                      "hover:text-teal-500 hover:bg-teal-500/10",
                    ),
              )}
            >
              <span className="text-xs font-mono truncate max-w-20">
                #{website.identifierId}
              </span>
              {copied ? (
                <Check size={11} className="shrink-0" />
              ) : (
                <Copy size={11} className="shrink-0" />
              )}
            </button>
          )}
        </div>

        {/* Completeness score bar */}
        <div
          className={clsx(
            "mt-auto pt-2.5 border-t",
            isDark ? "border-gray-700/50" : "border-gray-100",
          )}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={clsx("text-xs", textTertiary)}>
              {tw("completeness") || "Completeness"}
            </span>
            <span
              className={clsx("text-xs font-bold tabular-nums", scoreTextColor)}
            >
              {score}%
            </span>
          </div>
          <div
            className={clsx(
              "h-1.5 rounded-full overflow-hidden",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          >
            <div
              className={clsx(
                "h-full rounded-full transition-all duration-500",
                scoreColor,
              )}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        {/* <ActionBtn
          title={website.isActive ? "Deactivate" : "Activate"}
          colorClass={
            website.isActive
              ? "text-white bg-green-500/80 hover:bg-green-500"
              : "text-white/70 bg-black/30 hover:bg-black/50"
          }
          onClick={onToggleActive}
        >
          {website.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
        </ActionBtn> */}

        <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150 delay-[20ms]">
          <ActionBtn
            title="Preview details"
            colorClass="text-teal-400 bg-teal-500/10 hover:bg-teal-500/20"
            onClick={onPreview}
          >
            <ScanEye size={14} />
          </ActionBtn>
        </div>

        <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150 delay-[40ms]">
          <ActionBtn
            title="Edit"
            colorClass="text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
            onClick={onEdit}
          >
            <Edit size={14} />
          </ActionBtn>
        </div>

        <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150 delay-[80ms]">
          <ActionBtn
            title="Delete"
            colorClass="text-red-400 bg-red-500/10 hover:bg-red-500/20"
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </ActionBtn>
        </div>
      </div>
    </div>
  );
}

interface ActionBtnProps {
  title: string;
  colorClass: string;
  onClick: () => void;
  children: React.ReactNode;
}

function ActionBtn({ title, colorClass, onClick, children }: ActionBtnProps) {
  return (
    <div className="relative group/tip">
      <button
        onClick={onClick}
        className={clsx(
          "p-1.5 rounded-md transition-colors cursor-pointer",
          colorClass,
        )}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity shadow-lg z-10">
        {title}
        <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
      </span>
    </div>
  );
}
