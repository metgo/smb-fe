"use client"

import { filterTabs } from "@/lib/utils"
import useGeneralStore from "@/stores/generalStore"
import { IconImage } from "../ui"

const BusinessPageFilterTabs = () => {
  const { setActiveFilterTab, activeFilterTab, setClickedBusinessId } = useGeneralStore()

  function handleTabSwitch(key: string) {
    setActiveFilterTab(key)
    setClickedBusinessId("")
  }
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center gap-2 px-0.5 bg-[#EAEAEA] rounded-lg h-9 py-1">
        {filterTabs.map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleTabSwitch(item.key)}
            className={`${activeFilterTab === item.key ? "flex items-center gap-1.5 px-2.5 py-1.5 bg-white font-bold h-8 border-[1px] border-[#EAEAEA]" : "px-2 py-2  font-normal"} rounded-lg cursor-pointer text-sm text-theme`}
          >
            {activeFilterTab === item.key && <IconImage icon={item.icon} width={20} height={20} />}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default BusinessPageFilterTabs