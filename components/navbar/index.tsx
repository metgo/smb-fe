import React from 'react'
import Link from 'next/link'

import { features } from '@/lib/utils'
import { navbar } from '@/constant/hebrew'
import { Logo, SearchIcon, ShopbagIcon, SunIcon, UserIcon } from '@/components/ui/icons'
import BusinessPageFilterTabs from './BusinessPageFilterTabs'
import HamburgerMenu from './HamburgerMenu'

const Navbar = () => {
  return (
    <nav className="px-20 py-2.5 bg-white shadow-md fixed z-50 w-full mb-40">
      <div className="flex items-center justify-between">
        {/* Hamburger, Logo, Text */}
        <div className="flex items-center gap-4">
          <HamburgerMenu/>
          <Logo />
          <Link
            href={"/"}
            className="text-theme font-bold"
          >
            {navbar.toJoinAsaBusiness}
          </Link>
        </div>

        <div className="flex gap-4">
          <BusinessPageFilterTabs />

          <div className="flex items-center gap-2 ms-5">
            {features.map(item => (
              <div
                key={item.key}
                className="flex flex-col items-center px-1"
              >
                <item.icon />
                <div className="text-sm font-normal text-theme">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="w-[1px] h-10 bg-[#D3D3D3]" />
          <div className="flex items-center gap-2.5">
            <SearchIcon />
            <ShopbagIcon />
            <UserIcon />
            <div className="flex items-center">
              <span>19 C</span>
              <SunIcon />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar