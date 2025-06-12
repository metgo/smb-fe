import React from 'react'
import Link from 'next/link'


import { navbar } from '@/constant/hebrew'
import { Logo, SearchIcon, ShopbagIcon, SunIcon, ThreeLineIcon, UserIcon } from '@/components/ui/icons'

const Navbar = () => {
  return (
    <nav className="px-20 py-2.5 bg-white shadow-md">
      <div className="flex items-center justify-between">
        {/* Hamburger, Logo, Text */}
        <div className="flex items-center gap-4">
          <ThreeLineIcon />
          <Logo />
          <Link
            href={"/"}
            className="text-theme font-bold"
          >
            {navbar.toJoinAsaBusiness}
          </Link>
        </div>

        {/* Left side */}
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
    </nav>
  )
}

export default Navbar