"use client"

import { filterTabs } from "@/lib/utils"
import useGeneralStore from "@/stores/generalStore"

const BusinessPageFilterTabs = () => {
  const { setActiveFilterTab, activeFilterTab } = useGeneralStore()

  return (
    <div className="flex items-center gap-2 py-0.5 px-1 bg-primary rounded-lg">
      {filterTabs.map(item => (
        <button
          key={item.key}
          type="button"
          onClick={() => setActiveFilterTab(item.key)}
          className={`${activeFilterTab === item.key ? "flex items-center gap-1.5 px-2.5 py-1.75 bg-white" : "px-5 py-2"} rounded-lg cursor-pointer`}
        >
          {activeFilterTab === item.key && <item.icon />}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export default BusinessPageFilterTabs