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
        className="focus:outline-none cursor-pointer text-theme"
      >
        {isOpen ? (
          <IconImage icon={closeIcon} />
        ) : (
          <IconImage icon={openIcon} />
        )}
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-20 right-0 w-full h-screen shadow-lg flex px-20 bg-black/20 backdrop-blur-sm overflow-y-auto overflow-x-hidden  ${
          isOpen ? "max-h-[96vh] " : "max-h-0 pointer-events-none"
        }`}
      >
        {/* Modal Content */}
        <div
          ref={menuRef}
          className="w-full mx-auto h-[max-content] py-10 px-12 flex gap-10 rounded-b-xl bg-white backdrop-blur-[34px]"
        >
          {Object.entries(navItems[0]).map(([colKey, items]) => (
            <div key={colKey} className="flex gap-2.75">
              <div className="w-0.25 h-70 bg-[#D3D3D3]" />
              <div className="flex flex-col w-[14.5rem]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="mb-2 hover:bg-primary  py-2 ps-3 flex items-center justify-between"
                  >
                    <Link
                      href={item.href}
                      className="text-theme hover:text-dark transition font-bold text-sm flex items-center gap-2.5"
                    >
                      {item.rightIcon && <IconImage icon={item.rightIcon} />}
                      {item.label}
                    </Link>
                    {item.leftIcon && <IconImage icon={item.leftIcon} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="w-0.25 h-70 bg-[#D3D3D3]" />
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
