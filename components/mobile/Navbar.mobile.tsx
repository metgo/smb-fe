"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import NavLogo from "../navbar/NavLogo";
import { pathNames } from "@/lib/endpoints";
import SearchFlow from "../navbar/SearchFlow";
import HamburgerMenu from "../navbar/HamburgerMenu";
import MobileFilterTab from "./FilterTab.mobile";
import PromotionalCards from "../PromotionalCards";
import { CODE } from "@/constant/envConstants";
import Link from "next/link";
import { fundayEnquiryLables } from "@/constant/hebrew";
import { RedFlowerIcon } from "../ui/svgIcons";

const MobileNavbar = () => {
  const pathname = usePathname();
  const [isFilterTabShow, setIsFilterTabShow] = useState(false);

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
                {fundayEnquiryLables.funDayBondingDaysMobile}
              </span>
              <div className="absolute left-0 -bottom-[5px]">
                <RedFlowerIcon />
              </div>
            </Link>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 col-span-8">
          {isFilterTabShow && <MobileFilterTab />}
          <SearchFlow isMobile />
          {/* {showFilterIcon && <IconImage icon="filter" />} */}
        </div>
      </div>
      <PromotionalCards />
    </nav>
  );
};

export default MobileNavbar;
