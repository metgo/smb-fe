"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import useGeneralStore from "@/stores/generalStore";
import IconImage from "@/components/ui/IconImage";
import { CATEGORY_COLORS } from "@/components/layouts/FeedCategoryButtons";

function stripHtml(html: string): string {
  let text = html.replace(/<[^>]*>/g, "");
  text = text.replace(/&nbsp;/g, " "); // replace non-breaking space with normal space
  text = text.replace(/&amp;/g, "&"); // replace &amp; with &
  text = text.replace(/&quot;/g, '"'); // replace &quot; with "
  text = text.replace(/&lt;/g, "<"); // replace &lt; with <
  text = text.replace(/&gt;/g, ">"); // replace &gt; with >
  return text.trim();
}
export default function FeedNavbarCenter() {
  const {
    presetFeedFilters,
    isCategoryHeaderInView,
    selectedSiteCategories,
    toggleSiteCategory,
  } = useGeneralStore();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const headerText = stripHtml(presetFeedFilters?.header ?? "");
  const allCategories =
    presetFeedFilters?.siteTopics
      ?.flatMap((topic) => topic.siteCategories ?? [])
      .filter((cat) => !cat.isArchived) ?? [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!headerText && allCategories.length === 0) return null;
  if (isCategoryHeaderInView) return null;

  return (
    <div className="flex items-center gap-3 justify-center">
      {headerText && (
        <span className="text-theme font-bold text-base whitespace-nowrap">
          {headerText}
        </span>
      )}

      {allCategories.length > 0 && (
        <div ref={wrapperRef} className="relative">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#EAEAEA] rounded-xl text-sm font-medium text-theme custom-cursor shadow-sm hover:shadow-md hover:bg-[#F5F5F5] transition-all"
          >
            <span>קטגוריות</span>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isOpen && (
            <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white border border-[#EAEAEA] rounded-2xl shadow-lg z-50 p-2 flex flex-wrap gap-2 w-max max-w-[480px]">
              {allCategories.map((cat, i) => {
                const isSelected = selectedSiteCategories.some(
                  (c) => c.title === cat.title,
                );
                const gradient = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                return (
                  <button
                    key={i}
                    onClick={() => toggleSiteCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm custom-cursor transition-colors whitespace-nowrap ${
                      isSelected
                        ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                        : "bg-white text-theme border border-[#EAEAEA] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    {cat.icon && (
                      <IconImage icon={cat.icon} width={18} height={18} />
                    )}
                    <span>{cat.titleHe ?? cat.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
