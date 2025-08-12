"use client";

import React from "react";
import Link from "next/link";

import MenuItems from "./MenuItems";
import SearchFlow from "./SearchFlow";
import { navbar } from "@/constant/hebrew";
import HamburgerMenu from "./HamburgerMenu";
import UserIconHoverCard from "./UserIconHoverCard";
import { ShopbagIcon } from "@/components/ui/icons";
import CurrentTempOfYourCity from "./CurrentTempOfYourCity";
import BusinessPageFilterTabs from "./BusinessPageFilterTabs";
import { CONSOLE_URL } from "@/constant/envConstants";
import NavLogo from "./NavLogo";
import useCartStore from "@/stores/cartStore";

const Navbar = ({ showFilterTab = false }: { showFilterTab?: boolean }) => {
  const { getTotalQuantity } = useCartStore();
  return (
    <nav className="ps-19 pe-16 py-2.5 bg-white sticky top-0 z-20 border-b border-[#F5F5F5]">
      <div className="grid grid-cols-10 items-center">
        {/* Hamburger, Logo, Text */}
        <div className="flex items-center gap-4 col-span-4">
          <HamburgerMenu />
          <NavLogo />
          <Link
            href={CONSOLE_URL}
            target="_blank"
            className="text-theme font-bold ms-8"
          >
            {navbar.toJoinAsaBusiness}
          </Link>
        </div>

        <div className="flex justify-center col-span-2">
          {showFilterTab && <BusinessPageFilterTabs />}
        </div>

        <div className="flex items-center justify-end col-span-4">
          <MenuItems />

          <div className="w-[1px] h-10 bg-lightGray mx-4" />

          <div className="flex items-center gap-2.5">
            <SearchFlow />
            <div className="p-2 relative">
              <div className="absolute -top-1 -left-0 bg-[#28C268] rounded-full text-center h-[14px] w-[14px]  flex justify-center items-center">
                <span className="text-[12px] text-white font-bold">
                  {getTotalQuantity()}
                </span>
              </div>
              <ShopbagIcon />
            </div>
            <UserIconHoverCard />
            <CurrentTempOfYourCity />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
