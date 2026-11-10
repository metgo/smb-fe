"use client";

import useGeneralStore from "@/stores/generalStore";
import { FaRegMap } from "react-icons/fa6";
import { LuLayoutDashboard } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";

const filterItems = [
  {
    key: "gallery",
    icon: <LuLayoutDashboard color="#0F353A" size={24} />,
  },
  {
    key: "map",
    icon: <FaRegMap color="#0F353A" size={24} />,
  },
];

const MobileFilterTab = () => {
  const { activeFilterTabMobile, setActiveFilterTabMobile } = useGeneralStore();

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });

  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Update indicator position when active tab changes
    const activeTabElement = tabRefs.current[activeFilterTabMobile];
    const container = containerRef.current;

    if (activeTabElement && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeFilterTabMobile]);

  return (
    <div className="flex items-center justify-center">
      <div
        ref={containerRef}
        className="relative flex items-center gap-1 bg-[#EAEAEA] rounded-lg px-1 py-0.75"
      >
        {/* Animated indicator */}
        <div
          className="absolute top-0.75 h-[calc(100%-0.375rem)] bg-white rounded-lg border border-[#EAEAEA] transition-all duration-300 ease-in-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />

        {filterItems.map((item) => (
          <button
            key={item.key}
            ref={(el) => {
              tabRefs.current[item.key] = el;
            }}
            type="button"
            onClick={() => setActiveFilterTabMobile(item.key)}
            className="relative z-10 rounded-lg custom-cursor text-sm flex items-center p-1 transition-all duration-300"
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileFilterTab;
