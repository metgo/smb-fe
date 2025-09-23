"use client";

import { useEffect, useState } from "react";

import { CartDrawer } from "../drawer";
import NavLogo from "../navbar/NavLogo";
import SearchFlow from "../navbar/SearchFlow";
import HamburgerMenu from "../navbar/HamburgerMenu";
import BusinessPageFilterTabs from "../navbar/BusinessPageFilterTabs";
import useGeneralStore from "@/stores/generalStore";

const MobileNavbar = ({
  showFilterTab = false,
}: {
  showFilterTab?: boolean;
}) => {
  const { setIsMobile } = useGeneralStore();
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    if (showFilterTab) {
      setIsMobile(true);
    }
  }, [showFilterTab]);

  return (
    <>
      <nav className="px-4 py-2.5 bg-white sticky top-0 z-20 border-b border-[#F5F5F5] max-sm:block md:hidden">
        <div className="grid grid-cols-10 items-center">
          {/* Hamburger, Logo, Text */}
          <div className="flex items-center gap-4 col-span-4">
            <HamburgerMenu />
            <NavLogo />
          </div>

          <div className="flex justify-center col-span-2">
            {showFilterTab && <BusinessPageFilterTabs />}
          </div>

          <div className="flex items-center justify-end col-span-4">
            <div className="flex items-center gap-2.5">
              <SearchFlow />
            </div>
          </div>
        </div>
      </nav>

      {isCartDrawerOpen && <CartDrawer setIsOpen={setIsCartDrawerOpen} />}
    </>
  );
};

export default MobileNavbar;
