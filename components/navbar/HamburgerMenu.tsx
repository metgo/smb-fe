"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RxHamburgerMenu } from "react-icons/rx";
import { useEffect, useRef, useState, useMemo } from "react";

import { navItems } from "@/lib/utils";
import { IconImage } from "@/components/ui";
import useGeneralStore from "@/stores/generalStore";

const HamburgerMenu = ({
  openIcon = "threeline",
  closeIcon = "close",
  isMobile = false,
}: {
  openIcon?: string;
  closeIcon?: string;
  isMobile?: boolean;
}) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { aminitiesInfo, setShowFavoriteFeedItems, showFavoriteFeedItems } =
    useGeneralStore();

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

  const filteredNavItems = useMemo(() => {
    const nav = navItems[0];

    return Object?.fromEntries(
      Object?.entries(nav)?.map(([colKey, items]) => {
        if (colKey === "col2") {
          const filtered = items?.filter(
            (item) =>
              item?.key && (aminitiesInfo as Record<string, any>)?.[item.key],
          );
          return [colKey, filtered];
        }
        return [colKey, items];
      }),
    );
  }, [aminitiesInfo]);

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        ref={toggleButtonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="focus:outline-none custom-cursor"
      >
        {isMobile ? (
          <RxHamburgerMenu size={24} />
        ) : (
          <IconImage icon={isOpen ? closeIcon : openIcon} />
        )}
      </button>

      <div
        className={`absolute z-50 max-sm:top-18 md:top-18 right-0 w-full h-screen shadow-lg flex max-sm:px-0 md:px-20 bg-black/20 backdrop-blur-sm overflow-y-auto overflow-x-hidden ${
          isOpen ? "max-h-[96vh] " : "max-h-0 pointer-events-none"
        }`}
      >
        {/* Modal Content */}
        <div
          ref={menuRef}
          className="w-full max-sm:pt-10 max-sm:mx-0 md:mx-auto max-sm:h-screen md:h-[max-content] 
             max-sm:px-0 md:py-10 md:px-12 flex flex-col md:flex-row max-sm:gap-0 md:gap-10 
             rounded-b-xl max-sm:bg-white/90 bg-white backdrop-blur-[34px] hide-scrollbar"
        >
          {Object.entries(filteredNavItems).map(([colKey, items]) => {
            if (colKey === "col2" && items.length === 0) return null;

            return (
              <div
                key={colKey}
                className="flex flex-col md:flex-row md:gap-2.75 w-full max-sm:px-11"
              >
                <div className="hidden md:block w-0.25 h-70 bg-[#D3D3D3]" />

                <div className="flex flex-col w-full md:w-[8rem] lg:w-[10rem] xl:w-[14.5rem]">
                  {items.map((item) =>
                    item.href === "onClick" ? (
                      <button
                        key={item.id}
                        onClick={() => {
                          setIsOpen(false);
                          setShowFavoriteFeedItems(!showFavoriteFeedItems);
                        }}
                        className="text-theme hover:text-dark transition font-bold text-sm gap-2.5 mb-2 hover:bg-primary group py-2 ps-3 flex items-center justify-between custom-cursor w-full text-left"
                      >
                        <div className="flex items-center gap-2.5 max-sm:text-xl">
                          {item.rightIcon && (
                            <IconImage icon={item.rightIcon} />
                          )}
                          {item.label}
                        </div>
                        {item.leftIcon && <IconImage icon={item.leftIcon} />}
                      </button>
                    ) : (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="text-theme hover:text-dark transition font-bold text-sm gap-2.5 mb-2 
                          hover:bg-primary group py-2 ps-3 flex items-center justify-between 
                          custom-cursor w-full"
                      >
                        <div className="flex items-center gap-2.5 max-sm:text-xl">
                          {item.rightIcon && (
                            <IconImage icon={item.rightIcon} />
                          )}
                          {item.label}
                        </div>
                        {item.leftIcon && <IconImage icon={item.leftIcon} />}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            );
          })}

          {/* Divider at the end only for desktop */}
          <div className="hidden md:block w-0.25 h-70 bg-[#D3D3D3]" />
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
