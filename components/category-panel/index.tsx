import { categories } from '@/lib/utils'
import React from 'react'

const CategoryPanel = () => {
  return (
    <div className="w-full fixed bottom-4 right-0 flex items-center justify-center">

      <div className="bg-secondary flex items-center justify-center gap-2.5 p-2.5 rounded-3xl">
        {categories.map(item => (
          <div
            key={item.id}
            className="w-16.5 h-16.5 flex items-center flex-col gap-2"
          >
            <item.icon />
            <div>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryPanel