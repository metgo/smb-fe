"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { filterTabs } from "@/lib/utils";
import { IconImage } from "@/components/ui";
import { pathNames } from "@/lib/endpoints";
import useGeneralStore from "@/stores/generalStore";

const MobileFilterTab = () => {
  const pathname = usePathname();
  const { isMobile, activeFilterTabMobile, setActiveFilterTabMobile } =
    useGeneralStore();

  const [filteredTabs, setFilteredTabs] = useState<
    { key: string; label: string; icon: string }[]
  >([]);

  useEffect(() => {
    if (isMobile) {
      setFilteredTabs([filterTabs[0], filterTabs[2]]);
    } else if (pathname === pathNames.trails) {
      setFilteredTabs(filterTabs.slice(0, 2));
    } else {
      setFilteredTabs(filterTabs);
    }
  }, [pathname, isMobile]);

  function handleTabSwitch(key: string) {
    setActiveFilterTabMobile(key);
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center gap-2 px-0.5 bg-[#EAEAEA] rounded-lg h-9 py-1">
        {filteredTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleTabSwitch(item.key)}
            className={`${
              activeFilterTabMobile === item.key
                ? "flex items-center gap-1.5 px-2.5 py-1.5 bg-white font-bold h-8 border border-[#EAEAEA]"
                : "flex items-center gap-1.5 px-2 py-2 font-normal"
            } rounded-lg custom-cursor text-sm text-theme`}
          >
            <IconImage icon={item.icon} width={24} height={24} />
            {!isMobile && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileFilterTab;
