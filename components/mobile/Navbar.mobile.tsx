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
      <div className="grid grid-cols-12 items-center">
        {/* Hamburger, Logo, Text */}
        <div className="flex items-center gap-4 col-span-6">
          <HamburgerMenu isMobile />
          <NavLogo />
        </div>

        <div className="flex items-center justify-end gap-4 col-span-6">
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
