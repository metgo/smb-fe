"use client";

import clsx from "clsx";
import { useEffect } from "react";

import NavLogo from "../navbar/NavLogo";
import SearchFlow from "../navbar/SearchFlow";
import HamburgerMenu from "../navbar/HamburgerMenu";
import useGeneralStore from "@/stores/generalStore";
import MobileFilterTab from "./FilterTab.mobile";
import { IconImage } from "../ui";

const MobileNavbar = ({
  showFilterTab = false,
  showFilterIcon = false,
}: {
  showFilterTab?: boolean;
  showFilterIcon?: boolean;
}) => {
  const { setIsMobile } = useGeneralStore();

  useEffect(() => {
    if (showFilterTab) {
      setIsMobile(true);
    }
  }, [showFilterTab]);

  return (
    <nav
      className={clsx(
        "px-4 py-2.5 bg-white border-b border-[#F5F5F5] max-sm:block md:hidden fixed top-0 left-0 right-0 z-50 transition-transform duration-300",
      )}
    >
      <div className="grid grid-cols-12 items-center">
        {/* Hamburger, Logo, Text */}
        <div className="flex items-center gap-4 col-span-6">
          <HamburgerMenu />
          <NavLogo />
        </div>

        <div className="flex items-center justify-end gap-2 col-span-6">
          {showFilterTab && <MobileFilterTab />}
          <div className="w-12">
            <SearchFlow iconSize={40} />
          </div>
          {showFilterIcon && <IconImage icon="filter" />}
        </div>
      </div>
    </nav>
  );
};

export default MobileNavbar;
