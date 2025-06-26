import React from 'react'
import Link from 'next/link'

import { features } from '@/lib/utils'
import { navbar } from '@/constant/hebrew'
import HamburgerMenu from './HamburgerMenu'
import { IconImage } from '@/components/ui'
import UserIconHoverCard from './UserIconHoverCard'
import CurrentTempOfYourCity from './CurrentTempOfYourCity'
import BusinessPageFilterTabs from './BusinessPageFilterTabs'
import { Logo, SearchIcon, ShopbagIcon } from '@/components/ui/icons'

const Navbar = async () => {

  return (
    <nav className="px-20 py-2.5 bg-white shadow-md fixed z-50 w-full mb-40">
      <div className="flex items-center justify-between">
        {/* Hamburger, Logo, Text */}
        <div className="flex items-center gap-4">
          <HamburgerMenu />
          <Logo />
          <Link
            href={"/"}
            className="text-theme font-bold ms-8"
          >
            {navbar.toJoinAsaBusiness}
          </Link>
        </div>


        <div className='flex items-center justify-end'>
          <BusinessPageFilterTabs />
          <div className="flex items-center gap-2 ms-9">
            {features.map(item => (
              <div
                key={item.key}
                className="flex flex-col items-center px-1 w-14"
              >
                <IconImage width={24} height={24} icon={item.icon} />
                <div className="text-sm font-normal text-theme w-14">{item.label}</div>
              </div>
            ))}
          </div>


          <div className="w-[1px] h-10 bg-[#D3D3D3] mx-4" />

          <div className="flex items-center gap-2.5">
            <div className="p-2">
              <SearchIcon />
            </div>
            <div className="p-2 relative">
              <div className="absolute -top-1 -left-0 bg-[#28C268] rounded-full text-center h-[14px] w-[14px]  flex justify-center items-center">
                <span className="text-[12px] text-white font-bold">3</span>
              </div>
              <ShopbagIcon />
            </div>
            <UserIconHoverCard />
            <CurrentTempOfYourCity />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar