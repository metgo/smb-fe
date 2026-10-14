import clsx from "clsx";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Check,
  Copy,
  CopyPlus,
  Globe,
  Mail,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";

import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { websitesAnalyticsReport } from "@/lib/utils";
import type { IUtmCampaign } from "@/store/api/utmCampaignApi";
import { toReadableUrl } from "../utils/utm";

interface ActionButtonProps {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}

const ActionButton = ({
  title,
  onClick,
  danger,
  children,
}: ActionButtonProps) => {
  const { isDark } = useThemeClasses();
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        "p-1.5 rounded-md transition-colors",
        danger
          ? isDark
            ? "hover:bg-red-500/10 text-red-400"
            : "hover:bg-red-50 text-red-500"
          : isDark
            ? "hover:bg-gray-800 text-gray-300"
            : "hover:bg-gray-200 text-gray-600",
      )}
    >
      {children}
    </button>
  );
};

interface SavedLinkItemProps {
  link: IUtmCampaign;
  website: IWebsite | undefined;
  isEditing: boolean;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onDuplicate: (link: IUtmCampaign) => void;
  onEdit: (link: IUtmCampaign) => void;
  onDelete: (id: string) => void;
  onViewAnalytics: (
    link: IUtmCampaign,
    gaDataStudioId: string,
    pageId: string,
  ) => void;
}

const SavedLinkItem = ({
  link,
  website,
  isEditing,
  copiedId,
  onCopy,
  onDuplicate,
  onEdit,
  onDelete,
  onViewAnalytics,
}: SavedLinkItemProps) => {
  const { t } = useTranslation("utm_campaign");
  const { isDark, textPrimary, textTertiary, borderColor } = useThemeClasses();
  const campaignCopyId = `campaign:${link._id}`;

  const analyticsReport = website
    ? websitesAnalyticsReport.find((site) => site._id === website._id)
    : undefined;
  const gaDataStudioId = analyticsReport?.gaDataStudioId;
  const utmCampaignResultsPageId = analyticsReport?.utmCampaignResultsPageId;

  return (
    <li
      className={clsx(
        "rounded-lg border p-3.5 transition-colors",
        isEditing ? "border-violet-500 ring-1 ring-violet-500/30" : borderColor,
        isDark ? "bg-gray-900/40" : "bg-gray-50",
      )}
    >
      <div className="">
        <div className="flex items-center justify-between ">
          <div className="flex gap-2">
            {website ? (
              <ImageWithFallback
                src={website.logo}
                alt={website.name}
                className="w-8 h-8 rounded object-contain shrink-0 mt-0.5"
              />
            ) : (
              <span
                className={clsx(
                  "w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5",
                  isDark ? "bg-gray-800" : "bg-gray-200",
                )}
              >
                <Globe className="w-4 h-4 text-gray-400" />
              </span>
            )}
            <div>
              {link.influencer && (
                <p
                  className={clsx(
                    "text-sm font-semibold truncate",
                    textPrimary,
                  )}
                >
                  {link.influencer}
                </p>
              )}
              <button
                type="button"
                onClick={() => onCopy(link.campaign, campaignCopyId)}
                title={t("copy_campaign_name")}
                className={clsx(
                  "group inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                  isDark
                    ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                )}
              >
                <span className={clsx("shrink-0", textTertiary)}>
                  {t("campaign_name_short")}:
                </span>
                <span className="truncate font-semibold">{link.campaign}</span>
                {copiedId === campaignCopyId ? (
                  <Check className="w-3 h-3 shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {gaDataStudioId && utmCampaignResultsPageId && (
              <ActionButton
                title={t("action_view_analytics")}
                onClick={() =>
                  onViewAnalytics(
                    link,
                    gaDataStudioId,
                    utmCampaignResultsPageId,
                  )
                }
              >
                <BarChart3 className="w-4 h-4" />
              </ActionButton>
            )}
            <ActionButton
              title={t("action_duplicate")}
              onClick={() => onDuplicate(link)}
            >
              <CopyPlus className="w-4 h-4" />
            </ActionButton>
            <ActionButton title={t("action_edit")} onClick={() => onEdit(link)}>
              <Pencil className="w-4 h-4" />
            </ActionButton>
            <ActionButton
              title={t("action_delete")}
              onClick={() => onDelete(link._id)}
              danger
            >
              <Trash2 className="w-4 h-4" />
            </ActionButton>
          </div>
        </div>

        <div className="flex gap-x-2 flex-wrap">
          {(link.influencerEmail || link.influencerPhone) && (
            <div
              className={clsx(
                "flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px]",
                textTertiary,
              )}
            >
              {link.influencerEmail && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {link.influencerEmail}
                </span>
              )}
              {link.influencerPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {link.influencerPhone}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <p
        className={clsx(
          "text-[11px] mt-2 break-all font-semibold px-2 py-1.5 rounded italic",
          isDark
            ? "bg-gray-900 text-gray-200"
            : "bg-white text-gray-500 border border-gray-100",
        )}
      >
        {toReadableUrl(link.url)}
        <button
          type="button"
          onClick={() => onCopy(link.url, link._id)}
          title={t("action_copy")}
          className={clsx(
            "p-1 rounded-md transition-colors ms-4 ",
            isDark
              ? "hover:bg-gray-800 text-gray-300"
              : "hover:bg-gray-200 text-gray-600",
          )}
        >
          {copiedId === link._id ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </p>
    </li>
  );
};

export default SavedLinkItem;
