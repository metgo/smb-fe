"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

import NavLogo from "../navbar/NavLogo";
import SearchFlow from "../navbar/SearchFlow";
import HamburgerMenu from "../navbar/HamburgerMenu";
import useGeneralStore from "@/stores/generalStore";
import MobileFilterTab from "./FilterTab.mobile";

const MobileNavbar = ({
  showFilterTab = false,
}: {
  showFilterTab?: boolean;
}) => {
  const { setIsMobile } = useGeneralStore();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (showFilterTab) {
      setIsMobile(true);
    }
  }, [showFilterTab]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // scrolling down → hide navbar
        setIsVisible(false);
      } else {
        // scrolling up → show navbar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <nav
        className={clsx(
          "px-4 py-2.5 bg-white border-b border-[#F5F5F5] max-sm:block md:hidden sticky top-0 z-30 transition-transform duration-300",
          isVisible ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="grid grid-cols-10 items-center">
          {/* Hamburger, Logo, Text */}
          <div className="flex items-center gap-4 col-span-4">
            <HamburgerMenu />
            <NavLogo />
          </div>

          <div className="flex justify-center col-span-2">
            {showFilterTab && <MobileFilterTab />}
          </div>

          <div className="flex items-center justify-end col-span-4">
            <div className="flex items-center gap-2.5">
              <SearchFlow />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileNavbar;
