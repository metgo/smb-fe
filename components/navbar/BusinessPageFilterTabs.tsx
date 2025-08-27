"use client";

import { usePathname } from "next/navigation";

import { filterTabs } from "@/lib/utils";
import { IconImage } from "@/components/ui";
import useGeneralStore from "@/stores/generalStore";
import { useEffect, useState } from "react";

const BusinessPageFilterTabs = () => {
  const pathname = usePathname();

  const { setActiveFilterTab, activeFilterTab, setClickedBusinessId } =
    useGeneralStore();

  const [filteredTabs, setFilteredTabs] = useState<
    { key: string; label: string; icon: string }[]
  >([]);

  useEffect(() => {
    if (pathname === "/trails") {
      setFilteredTabs(filterTabs.slice(0, 2));
    } else {
      setFilteredTabs(filterTabs);
    }
  }, [pathname]);

  function handleTabSwitch(key: string) {
    setActiveFilterTab(key);
    setClickedBusinessId("");
  }
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center gap-2 px-0.5 bg-[#EAEAEA] rounded-lg h-9 py-1">
        {filteredTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleTabSwitch(item.key)}
            className={`${activeFilterTab === item.key ? "flex items-center gap-1.5 px-2.5 py-1.5 bg-white font-bold h-8 border-[1px] border-[#EAEAEA]" : "px-2 py-2  font-normal"} rounded-lg custom-cursor text-sm text-theme`}
          >
            {activeFilterTab === item.key && (
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
