"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { filterTabs } from "@/lib/utils";
import { IconImage } from "@/components/ui";
import { ThreeLineIcon } from "../ui/icons";
import useGeneralStore from "@/stores/generalStore";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";

const scrollToFeed = (isHomepage: boolean) => {
  window.scrollTo({
    top: isHomepage ? window.innerHeight : 0,
    behavior: "smooth",
  });
};

export default function FeedLayoutDropdown({
  showFilterTab,
}: {
  showFilterTab: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHomepage = pathname === "/";

  const { setClickedBusinessId, activeFilterTab, setActiveFilterTab } =
    useGeneralStore();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlTab = searchParams.get("filterTab");
    if (urlTab && filterTabs.some((t) => t.key === urlTab)) {
      setActiveFilterTab(urlTab);
    } else {
      setActiveFilterTab("gallery");
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleTabSwitch = (key: string) => {
    if (key === activeFilterTab) {
      setIsOpen(false);
      return;
    }
    setActiveFilterTab(key);
    setClickedBusinessId("");
    setIsOpen(false);
    scrollToFeed(isHomepage);
    sendGAEvent(triggerName.clickToLayoutSwitchBtn, { layout: key });
  };

  return (
    <div className="flex justify-center ">
      {showFilterTab && (
        <div ref={rootRef} className="relative inline-block">
          {/* Hamburger Trigger */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="flex items-center gap-2 h-12 px-3 bg-white rounded-lg text-sm font-bold text-theme custom-cursor hover:bg-[#F5F5F5] transition-colors"
          >
            <ThreeLineIcon />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 bg-white border border-[#EAEAEA] rounded-xl z-50 p-1 min-w-[160px] shadow-sm">
              {filterTabs.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleTabSwitch(item.key)}
                  className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm custom-cursor transition-colors
                    ${
                      activeFilterTab === item.key
                        ? "bg-[#EAEAEA] font-bold text-theme"
                        : "font-normal text-theme hover:bg-[#F5F5F5]"
                    }`}
                >
                  <IconImage icon={item.icon} width={18} height={18} />
                  <span>{item.label}</span>
                  {activeFilterTab === item.key && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
