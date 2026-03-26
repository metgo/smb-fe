"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import NavLogo from "./NavLogo";
import { fundayEnquiryLables } from "@/constant/hebrew";
import HamburgerMenu from "./HamburgerMenu";
import CurrentTempOfYourCity from "./CurrentTempOfYourCity";
import useCartStore from "@/stores/cartStore";
import { CartDrawer } from "../drawer";
import { pathNames } from "@/lib/endpoints";
import PromotionalCards from "../PromotionalCards";
import {
  HeartFilledIcon,
  HeartOutlineIcon,
  RedFlowerIcon,
} from "../ui/svgIcons";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";
import useGeneralStore from "@/stores/generalStore";
import FeedLayoutDropdown from "./FeedLayoutDropdown";
import FeedNavbarCenter from "./FeedNavbarCenter";
import { ShoppingCart } from "lucide-react";
import { siteStatus } from "@/lib/utils";

const Navbar = ({ showFilterTab = false }: { showFilterTab?: boolean }) => {
  const pathname = usePathname();

  const { getTotalQuantity } = useCartStore();
  const { setShowFavoriteFeedItems, showFavoriteFeedItems } = useGeneralStore();
  const { favoriteFeedItemIds } = useFavoriteFeedItemStore();
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  return (
    <>
      <nav className="ps-19 pe-16 py-2.5 bg-white sticky w-full top-0 z-20 border-b border-[#F5F5F5] max-sm:hidden md:block">
        <div className="grid grid-cols-10 items-center">
          {/* Hamburger, Logo, Text */}
          <div className="flex items-center gap-4 col-span-4">
            <HamburgerMenu />
            <NavLogo />
          </div>

          <div className="flex justify-center col-span-2">
            <FeedNavbarCenter />
          </div>

          <div className="flex items-center justify-end col-span-4">
            {siteStatus.isNegevTime && (
              <Link
                href={pathNames.fundayEnquiry}
                className="flex items-center border border-theme rounded-xl ps-4 pe-10 py-1 h-10 custom-cursor relative"
              >
                <span className="text-theme font-bold">
                  {fundayEnquiryLables.funAndBondingDays}
                </span>
                <div className="absolute left-0 -bottom-[5px]">
                  <RedFlowerIcon />
                </div>
              </Link>
            )}

            {favoriteFeedItemIds.length > 0 && pathname === pathNames.home && (
              <div
                className="relative h-full ms-6 custom-cursor"
                onClick={() => setShowFavoriteFeedItems(!showFavoriteFeedItems)}
              >
                {showFavoriteFeedItems ? (
                  <HeartFilledIcon />
                ) : (
                  <HeartOutlineIcon />
                )}
                <div className="absolute -top-2 -right-3 text-[10px] bg-green-400 flex items-center justify-center rounded-full text-white border-2 border-white w-5 h-5">
                  {favoriteFeedItemIds.length}
                </div>
              </div>
            )}

            <div className="w-[1px] h-10 bg-lightGray mx-4" />

            <div className="flex items-center gap-2.5">
              {/* <SearchFlow /> */}
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
                    <ShoppingCart className="text-gray-500 font-light" />
                  </div>
                )}
              <CurrentTempOfYourCity />
              <div>
                {showFilterTab && (
                  <FeedLayoutDropdown showFilterTab={showFilterTab} />
                )}
              </div>
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
