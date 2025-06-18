import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { features } from '@/lib/utils'
import { navbar } from '@/constant/hebrew'
import { Logo, SearchIcon, ShopbagIcon, UserIcon } from '@/components/ui/icons'
import BusinessPageFilterTabs from './BusinessPageFilterTabs'
import HamburgerMenu from './HamburgerMenu'
import CurrentTempOfYourCity from './CurrentTempOfYourCity'

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
            <div className="p-2">
              <ShopbagIcon />
            </div>
            <div className="p-2">
              <UserIcon />
            </div>
            <CurrentTempOfYourCity/>
            {/* <div className="flex items-center">
              <span className="font-normal text-2xl text-theme">{weatherInfo?.temperature}°C</span>
              <Image
                width={40}
                height={40}
                src={`https:${weatherInfo?.icon}`}
                alt={weatherInfo?.condition}
              />
            </div> */}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar