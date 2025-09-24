"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { navItems } from "@/lib/utils";
import { IconImage } from "@/components/ui";

const HamburgerMenu = ({
  openIcon = "threeline",
  closeIcon = "close",
}: {
  openIcon?: string;
  closeIcon?: string;
}) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pathname) setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        ref={toggleButtonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="focus:outline-none custom-cursor text-theme"
      >
        <IconImage icon={isOpen ? closeIcon : openIcon} />
      </button>

      {/* Dropdown Menu */}
      {
        <div
          className={`absolute top-20 right-0 w-full h-screen shadow-lg flex max-sm:px-0 md:px-20 bg-black/20 backdrop-blur-sm overflow-y-auto overflow-x-hidden ${
            isOpen ? "max-h-[96vh] " : "max-h-0 pointer-events-none"
          }`}
        >
          {/* Modal Content */}
          <div
            ref={menuRef}
            className="w-full max-sm:pt-12 max-sm:mx-0 md:mx-auto max-sm:h-screen md:h-[max-content] 
             max-sm:px-0 md:py-10 md:px-12 flex flex-col md:flex-row max-sm:gap-0 md:gap-10 
             rounded-b-xl max-sm:bg-white/90 bg-white backdrop-blur-[34px]"
          >
            {Object.entries(navItems[0]).map(([colKey, items]) => (
              <div
                key={colKey}
                className="flex flex-col md:flex-row md:gap-2.75 w-full max-sm:px-11"
              >
                {/* Vertical divider only on md+ */}
                <div className="hidden md:block w-0.25 h-70 bg-[#D3D3D3]" />

                <div className="flex flex-col w-full md:w-[8rem] lg:w-[10rem] xl:w-[14.5rem]">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="text-theme hover:text-dark transition font-bold text-sm gap-2.5 mb-2 
                       hover:bg-primary group py-2 ps-3 flex items-center justify-between 
                       custom-cursor w-full"
                    >
                      <div className="flex items-center gap-2.5 max-sm:text-xl">
                        {item.rightIcon && <IconImage icon={item.rightIcon} />}
                        {item.label}
                      </div>
                      {item.leftIcon && <IconImage icon={item.leftIcon} />}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Divider at the end only for desktop */}
            <div className="hidden md:block w-0.25 h-70 bg-[#D3D3D3]" />
          </div>
        </div>
      }
    </>
  );
};

export default HamburgerMenu;
