"use client";

import useGeneralStore from "@/stores/generalStore";
import IconImage from "./../../components/ui/IconImage";

export default function FeedNavbarCategoriesRow() {
  const { presetFeedFilters } = useGeneralStore();

  const allCategories = presetFeedFilters?.siteTopics
    ?.flatMap((topic) => topic.siteCategories ?? [])
    .filter((cat) => !cat.isArchived) ?? [];

  if (allCategories.length === 0) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-2.5 px-16 scrollbar-hide">
      {allCategories.map((cat, i) => (
        <button
          key={i}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EAEAEA] rounded-2xl text-sm text-theme custom-cursor hover:bg-[#F5F5F5] transition-colors whitespace-nowrap flex-shrink-0"
        >
          {cat.icon && (
            <IconImage icon={cat.icon} width={18} height={18} />
          )}
          <span>{cat.titleHe ?? cat.title}</span>
        </button>
      ))}
    </div>
  );
}
