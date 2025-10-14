"use client";

import useGeneralStore from "@/stores/generalStore";
import { FaRegMap } from "react-icons/fa6";
import { LuLayoutDashboard } from "react-icons/lu";

const filterItems = [
  {
    key: "gallery",
    icon: <LuLayoutDashboard size={24} />,
  },
  {
    key: "map",
    icon: <FaRegMap size={24} />,
  },
];

const MobileFilterTab = () => {
  const { activeFilterTabMobile, setActiveFilterTabMobile } = useGeneralStore();

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-1 bg-[#EAEAEA] rounded-lg px-1 py-0.75">
        {filterItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveFilterTabMobile(item.key)}
            className={`${
              activeFilterTabMobile === item.key
                ? " bg-white border border-[#EAEAEA]"
                : ""
            } rounded-lg custom-cursor text-sm flex items-center p-1`}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileFilterTab;
