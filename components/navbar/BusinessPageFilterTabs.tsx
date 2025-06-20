"use client"

import { filterTabs } from "@/lib/utils"
import useGeneralStore from "@/stores/generalStore"
import { IconImage } from "../ui"

const BusinessPageFilterTabs = () => {
  const { setActiveFilterTab, activeFilterTab } = useGeneralStore()

  return (
    <div className="flex items-center gap-2 py-0.5 px-1.5 bg-[#EAEAEA] rounded-lg">
      {filterTabs.map(item => (
        <button
          key={item.key}
          type="button"
          onClick={() => setActiveFilterTab(item.key)}
          className={`${activeFilterTab === item.key ? "flex items-center gap-1.5 px-2.5 py-1.75 bg-white font-bold" : "px-5 py-2  font-normal"} rounded-lg cursor-pointer text-sm text-theme`}
        >
          {activeFilterTab === item.key && <IconImage icon={item.icon} />}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export default BusinessPageFilterTabs