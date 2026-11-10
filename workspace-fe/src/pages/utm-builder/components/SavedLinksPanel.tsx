import clsx from "clsx";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link2, Loader, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { IUtmCampaign } from "@/store/api/utmCampaignApi";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { useUtmFormStyles } from "../hooks/useUtmFormStyles";
import { getHost, toReadableUrl } from "../utils/utm";
import SavedLinkItem from "./SavedLinkItem";

interface SavedLinksPanelProps {
  links: IUtmCampaign[];
  isLoading: boolean;
  editingId: string | null;
  websiteByHost: Map<string, IWebsite>;
  onDuplicate: (link: IUtmCampaign) => void;
  onEdit: (link: IUtmCampaign) => void;
  onDelete: (id: string) => void;
  onViewAnalytics: (
    link: IUtmCampaign,
    gaDataStudioId: string,
    pageId: string,
  ) => void;
}

const SavedLinksPanel = ({
  links,
  isLoading,
  editingId,
  websiteByHost,
  onDuplicate,
  onEdit,
  onDelete,
  onViewAnalytics,
}: SavedLinksPanelProps) => {
  const { t } = useTranslation("utm_campaign");
  const { cardClasses, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();
  const { inputClass } = useUtmFormStyles();
  const { copiedId, copyToClipboard } = useCopyToClipboard();

  const [search, setSearch] = useState("");
  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return links;
    return links.filter((link) =>
      [
        link.influencer,
        link.influencerEmail,
        link.influencerPhone,
        link.campaign,
        link.campaignId,
        link.source,
        link.medium,
        link.term,
        link.content,
        toReadableUrl(link.url),
      ].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [links, search]);

  return (
    <div className={clsx("rounded-xl p-2 flex flex-col h-[60vh]", cardClasses)}>
      <h2 className={clsx("text-lg font-semibold mb-4 shrink-0", textPrimary)}>
        {t("saved_links_title")}
        <span className={clsx("ml-1.5 text-sm font-normal", textTertiary)}>
          ({links.length})
        </span>
      </h2>

      {links.length > 0 && (
        <div className="relative mb-4 shrink-0">
          <Search
            className={clsx(
              "absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
              textTertiary,
            )}
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_links_placeholder")}
            className={clsx(inputClass, "ps-9")}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-teal-500" />
        </div>
      ) : links.length === 0 ? (
        <div
          className={clsx(
            "flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed",
            borderColor,
          )}
        >
          <Link2 className={clsx("w-8 h-8 mb-2", textTertiary)} />
          <p className={clsx("text-sm", textSecondary)}>
            {t("no_links_title")}
          </p>
          <p className={clsx("text-xs mt-1", textTertiary)}>
            {t("no_links_description")}
          </p>
        </div>
      ) : filteredLinks.length === 0 ? (
        <p className={clsx("text-sm text-center py-8", textSecondary)}>
          {t("search_no_results")}
        </p>
      ) : (
        <ul className="space-y-3 overflow-y-auto pr-1 -mr-1 flex-1 min-h-0">
          {filteredLinks.map((link) => (
            <SavedLinkItem
              key={link._id}
              link={link}
              website={websiteByHost.get(getHost(link.baseUrl))}
              isEditing={editingId === link._id}
              copiedId={copiedId}
              onCopy={copyToClipboard}
              onDuplicate={onDuplicate}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewAnalytics={onViewAnalytics}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedLinksPanel;
