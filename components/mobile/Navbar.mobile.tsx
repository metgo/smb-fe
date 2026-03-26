"use client";

import clsx from "clsx";
import Link from "next/link";
import { FaRegMap } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard } from "react-icons/lu";

import NavLogo from "../navbar/NavLogo";
import { pathNames } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";
import { RedFlowerIcon } from "../ui/svgIcons";
import PromotionalCards from "../PromotionalCards";
import HamburgerMenu from "../navbar/HamburgerMenu";
import { fundayEnquiryLables } from "@/constant/hebrew";
import useGeneralStore from "@/stores/generalStore";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";
import useCartStore from "@/stores/cartStore";
import { CartDrawer } from "../drawer";
import { ShoppingCart } from "lucide-react";

const MobileNavbar = () => {
  const pathname = usePathname();
  const [isFilterTabShow, setIsFilterTabShow] = useState(false);
  const { activeFilterTabMobile, setActiveFilterTabMobile } = useGeneralStore();
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { getTotalQuantity } = useCartStore();

  const basePagePath = pathname.split("/").slice(0, 2).join("/");

  useEffect(() => {
    setIsFilterTabShow(false);
    if (
      basePagePath === pathNames.home ||
      basePagePath === pathNames.businesses ||
      basePagePath === pathNames.trailDetails
    ) {
      setIsFilterTabShow(true);
    }
  }, [pathname]);

  return (
    <nav
      className={clsx(
        "px-4 py-2 bg-white border-b border-[#F5F5F5] max-sm:block md:hidden fixed top-0 left-0 right-0 z-50 transition-transform duration-300",
      )}
    >
      <div className="flex justify-between items-center">
        {/* Hamburger, Logo, Text */}
        <div className="flex items-center gap-4 col-span-4">
          <HamburgerMenu isMobile />
          <NavLogo />
        </div>

        <div>
          {CODE === "BNEI" && (
            <Link
              href={pathNames.fundayEnquiry}
              className="flex items-center border border-black rounded-xl ps-2 pe-2 py-1 h-10 custom-cursor relative"
            >
              <span className="text-black font-bold leading-4 max-w-20">
                {fundayEnquiryLables.funAndBondingDays}
              </span>
              <div className="absolute left-0 -bottom-[5px]">
                <RedFlowerIcon />
              </div>
            </Link>
          )}
        </div>
        {isFilterTabShow && (
          <div className="flex items-center justify-end gap-2 col-span-8">
            <div className="flex items-center justify-center gap-2">
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
                    <ShoppingCart className=" font-light" />
                  </div>
                )}
              {activeFilterTabMobile === "map" && (
                <button
                  onClick={() => {
                    setActiveFilterTabMobile("gallery");
                    sendGAEvent(triggerName.clickToLayoutSwitchBtn, {
                      layout: "gallery",
                    });
                  }}
                >
                  <LuLayoutDashboard color="#0F353A" size={24} />
                </button>
              )}
              {activeFilterTabMobile === "gallery" && (
                <button
                  onClick={() => {
                    setActiveFilterTabMobile("map");
                    sendGAEvent(triggerName.clickToLayoutSwitchBtn, {
                      layout: "map",
                    });
                  }}
                >
                  <FaRegMap color="#0F353A" size={24} />
                </button>
              )}
            </div>

            {/* <SearchFlowMobile /> */}
            {/* {showFilterIcon && <IconImage icon="filter" />} */}
          </div>
        )}
      </div>
      <PromotionalCards />
      {isCartDrawerOpen && <CartDrawer setIsOpen={setIsCartDrawerOpen} />}
    </nav>
  );
};

export default MobileNavbar;
