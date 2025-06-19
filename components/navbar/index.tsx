import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { features } from '@/lib/utils'
import { navbar } from '@/constant/hebrew'
import HamburgerMenu from './HamburgerMenu'
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

        <div className="flex gap-4">
          <BusinessPageFilterTabs />

          <div className="flex items-center gap-4 ms-10">
            {features.map(item => (
              <div
                key={item.key}
                className="flex flex-col items-center px-1"
              >
                {item.icon ? <item.icon /> :
                  <Image width={30} height={30} src={item.iconImg} alt='Calender' />
                }
                <div className="text-sm font-normal text-theme">{item.label}</div>
              </div>
            ))}
          </div>


          <div className="w-[1px] h-10 bg-[#D3D3D3]" />
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
            <UserIconHoverCard/>
            <CurrentTempOfYourCity/>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar