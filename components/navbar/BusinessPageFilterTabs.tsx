"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { filterTabs } from "@/lib/utils";
import { IconImage } from "@/components/ui";
import { pathNames } from "@/lib/endpoints";
import useGeneralStore from "@/stores/generalStore";
import { startLoading } from "../wrappers/ProgressBar";

const BusinessPageFilterTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isHomepage = pathname === "/";

  const { setClickedBusinessId, activeFilterTab, setActiveFilterTab } =
    useGeneralStore();

  const [filteredTabs, setFilteredTabs] = useState<
    { key: string; label: string; icon: string }[]
  >([]);

  useEffect(() => {
    if (pathname === pathNames.trails) {
      setFilteredTabs(filterTabs.slice(0, 2));
    } else {
      setFilteredTabs(filterTabs);
    }
  }, [pathname]);

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
    startLoading();
    router.push(`?${params.toString()}`, { scroll: false });
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
              activeFilterTab === item.key
                ? "flex items-center gap-1.5 px-2.5 py-1.5 bg-white font-bold h-8 border border-[#EAEAEA]"
                : "flex items-center gap-1.5 px-2 py-2 font-normal"
            } rounded-lg custom-cursor text-sm text-theme`}
          >
            <IconImage icon={item.icon} width={30} height={30} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BusinessPageFilterTabs;
