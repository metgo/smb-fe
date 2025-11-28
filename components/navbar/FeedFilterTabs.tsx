"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useState, useRef, useEffect } from "react";

import { filterTabs } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { IconImage } from "@/components/ui";

// Smooth scroll helper
const scrollToFeed = (isHomepage: boolean) => {
  window.scrollTo({
    top: isHomepage ? window.innerHeight : 0,
    behavior: "smooth",
  });
};

export default function FeedLyoutSwitcTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isHomepage = pathname === "/";

  const { setClickedBusinessId, activeFilterTab, setActiveFilterTab } =
    useGeneralStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  /* -------------------------------------------------------------
     01 — Initialize tab from URL on mount
  ------------------------------------------------------------- */
  useEffect(() => {
    const urlTab = searchParams.get("filterTab");

    if (urlTab && filterTabs.some((t) => t.key === urlTab)) {
      setActiveFilterTab(urlTab);
    } else {
      setActiveFilterTab("gallery"); // default
    }
  }, []);

  /* -------------------------------------------------------------
     02 — Recalculate indicator whenever tab changes
  ------------------------------------------------------------- */
  const calculateIndicator = () => {
    const container = containerRef.current;
    const activeEl = tabRefs.current[activeFilterTab || "gallery"];
    if (!container || !activeEl) return;

    const cr = container.getBoundingClientRect();
    const tr = activeEl.getBoundingClientRect();

    setIndicator({
      left: tr.left - cr.left,
      width: tr.width,
    });
  };

  useLayoutEffect(() => {
    calculateIndicator();

    // Extra frame for font load / SSR hydration shift
    const t = setTimeout(calculateIndicator, 20);

    return () => clearTimeout(t);
  }, [activeFilterTab]);

  /* -------------------------------------------------------------
     03 — Debounced resize listener
  ------------------------------------------------------------- */
  useEffect(() => {
    let t: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (t) clearTimeout(t);
      t = setTimeout(calculateIndicator, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeFilterTab]);

  /* -------------------------------------------------------------
     04 — Handle tab switching cleanly
  ------------------------------------------------------------- */
  const handleTabSwitch = (key: string) => {
    if (key === activeFilterTab) return;

    setActiveFilterTab(key);
    setClickedBusinessId("");
    scrollToFeed(isHomepage);
  };

  /* -------------------------------------------------------------
     05 — UI
  ------------------------------------------------------------- */
  return (
    <div className="flex items-center justify-center w-full">
      <div
        ref={containerRef}
        className="relative flex items-center gap-2 px-0.5 bg-[#EAEAEA] rounded-lg h-9 py-1"
      >
        {/* Indicator Bar */}
        <div
          className="absolute top-[2px] h-8 bg-white rounded-lg border border-[#EAEAEA] transition-all duration-300 ease-out"
          style={{
            left: indicator.left,
            width: indicator.width,
          }}
        />

        {filterTabs.map((item) => {
          return (
            <button
              key={item.key}
              ref={(el) => {
                tabRefs.current[item.key] = el;
              }}
              onClick={() => handleTabSwitch(item.key)}
              className={`relative z-10 flex items-center gap-1.5 rounded-lg custom-cursor text-sm transition-all duration-300 ${
                activeFilterTab
                  ? "px-2.5 py-1.5 font-bold text-theme"
                  : "px-2 py-2 font-normal text-theme"
              }`}
            >
              {activeFilterTab === item.key && (
                <IconImage icon={item.icon} width={20} height={20} />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
