"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import NavLogo from "./NavLogo";
import SearchFlow from "./SearchFlow";
import { navbar } from "@/constant/hebrew";
import HamburgerMenu from "./HamburgerMenu";
import { ShopbagIcon } from "@/components/ui/icons";
import CurrentTempOfYourCity from "./CurrentTempOfYourCity";
import BusinessPageFilterTabs from "./BusinessPageFilterTabs";
import useCartStore from "@/stores/cartStore";
import { CartDrawer } from "../drawer";
import { pathNames } from "@/lib/endpoints";
import PromotionalCards from "../PromotionalCards";
// import { GiftBoxIcon } from "../ui/svgIcons";

const Navbar = ({ showFilterTab = false }: { showFilterTab?: boolean }) => {
  const pathname = usePathname();

  const { getTotalQuantity } = useCartStore();
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  return (
    <>
      <nav className="ps-19 pe-16 py-2.5 bg-white sticky w-full top-0 z-20 border-b border-[#F5F5F5] max-sm:hidden md:block">
        <div className="grid grid-cols-10 items-center">
          {/* Hamburger, Logo, Text */}
          <div className="flex items-center gap-4 col-span-4">
            <HamburgerMenu />
            <NavLogo />
            <Link
              href={pathNames.joinBusiness}
              target="_blank"
              className="text-theme font-bold ms-8 custom-cursor"
            >
              {navbar.toJoinAsaBusiness}
            </Link>
          </div>

          <div className="flex justify-center col-span-2">
            {showFilterTab && <BusinessPageFilterTabs />}
          </div>

          <div className="flex items-center justify-end col-span-4">
            {/* <button
              type="button"
              onClick={() => {}}
              className="text-theme border border-theme font-bold rounded-xl px-4 py-2 flex items-center gap-2 custom-cursor"
            >
              <GiftBoxIcon />
              {navbar.souvenirShop}
            </button> */}

            <div className="w-[1px] h-10 bg-lightGray mx-4" />

            <div className="flex items-center gap-2.5">
              <SearchFlow />
              {pathname !== pathNames.checkout &&
                pathname !== pathNames.cart && (
                  <div
                    onClick={() => setIsCartDrawerOpen(true)}
                    className="p-2 relative custom-cursor"
                  >
                    {getTotalQuantity() > 0 && (
                      <div className="absolute -top-1 -left-0 bg-[#28C268] rounded-full h-[16px] w-[16px] flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold mt-[1px]">
                          {getTotalQuantity()}
                        </span>
                      </div>
                    )}
                    <ShopbagIcon />
                  </div>
                )}
              {/* <UserIconHoverCard /> */}
              <CurrentTempOfYourCity />
            </div>
          </div>
        </div>
        <PromotionalCards />
      </nav>

      {isCartDrawerOpen && <CartDrawer setIsOpen={setIsCartDrawerOpen} />}
    </>
  );
};

export default Navbar;
