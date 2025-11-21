"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { filterTabs } from "@/lib/utils";
import { IconImage } from "@/components/ui";
import useGeneralStore from "@/stores/generalStore";
import { useEffect, useState, useRef } from "react";

const BusinessPageFilterTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isHomepage = pathname === "/";

  const { setClickedBusinessId, activeFilterTab, setActiveFilterTab } =
    useGeneralStore();

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: -1,
    width: 0,
  });

  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Update indicator position when active tab changes
    const activeTabElement = tabRefs.current[activeFilterTab];
    const container = containerRef.current;

    if (activeTabElement && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeFilterTab, filterTabs]);

  function handleTabSwitch(key: string) {
    setActiveFilterTab(key);
    setClickedBusinessId("");
    const params = new URLSearchParams(searchParams.toString());
    params.set("filterTab", key);
    window.scrollTo({
      top: isHomepage ? window.innerHeight : 0,
      left: 0,
      behavior: "smooth",
    });
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div
        ref={containerRef}
        className="relative flex items-center gap-2 px-0.5 bg-[#EAEAEA] rounded-lg h-9 py-1"
      >
        {/* Animated indicator */}
        <div
          className="absolute top-[2px] h-8 bg-white rounded-lg border-[1px] border-[#EAEAEA] transition-all duration-400 ease-in-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />

        {filterTabs.map((item) => (
          <button
            key={item.key}
            ref={(el) => {
              tabRefs.current[item.key] = el;
            }}
            type="button"
            onClick={() => handleTabSwitch(item.key)}
            className={`${
              (activeFilterTab || "gallery") === item.key
                ? "flex items-center gap-1.5 px-2.5 py-1.5 font-bold"
                : "px-2 py-2 font-normal"
            } relative z-10 rounded-lg custom-cursor text-sm text-theme transition-all duration-300`}
          >
            {(activeFilterTab || "gallery") === item.key && (
              <IconImage icon={item.icon} width={20} height={20} />
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BusinessPageFilterTabs;
