"use client"

import { categoryBgClasses, foodSubCategories } from "@/lib/utils"
import { FilterIcon, LeftAngleArrow, RightAngleArrow } from "../ui/icons"
import useGeneralStore from "@/stores/generalStore"
import { useState } from "react"

const SubcategoryFilterPanel = () => {
  const { activeCategoryKey } = useGeneralStore()
  const [activeSubCategory, setActiveSubCategory] = useState<number>()


  return (
    <div className="max-w-5xl bg-white/80 backdrop-blur-md border border-white/20 shadow-md p-2.5 rounded-2xl">

      <div className="flex items-center gap-2.5">
        <div className="px-4 py-2.5 rounded-xl border border-theme flex items-center gap-2">
          <FilterIcon />
          <span>מסננים</span>
        </div>


        <div className="flex items-center gap-1">
          <button
            type="button"
            className="border border-theme rounded-full p-1"
          >
            <RightAngleArrow />
          </button>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 overflow-x-auto flex-nowrap hide-scrollbar">
              {foodSubCategories?.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSubCategory(item.id)}
                  className={`${activeSubCategory === item.id ? `${categoryBgClasses[activeCategoryKey]} text-white` : "bg-white"} cursor-pointer px-5 py-3 rounded-4xl font-bold text-sm whitespace-nowrap shrink-0`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="border border-theme rounded-full p-1"
          >
            <LeftAngleArrow />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubcategoryFilterPanel
