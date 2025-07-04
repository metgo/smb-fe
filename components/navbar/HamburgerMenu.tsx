"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { IconImage } from "@/components/ui";
import { menuItems } from "@/constant/hebrew";
import { usePathname } from "next/navigation";

const navItems = [
  {
    col1: [
      {
        id: 1,
        label: menuItems.welcome,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 2,
        label: menuItems.businessPage,
        href: "/businesses",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 3,
        label: menuItems.visitorCenter,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 4,
        label: menuItems.blogArticle,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 5,
        label: menuItems.joinBusiness,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 6,
        label: menuItems.contactUs,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
    ],
    col2: [
      {
        id: 1,
        label: menuItems.eventGeneralPublic,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 2,
        label: menuItems.eventCompaniesOrg,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 3,
        label: menuItems.routes,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
    ],
    col3: [
      {
        id: 1,
        label: menuItems.mySavedOnes,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 2,
        label: menuItems.checkBalance,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 3,
        label: menuItems.purchasingCharacters,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 4,
        label: menuItems.shoppingCart,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 5,
        label: menuItems.exit,
        href: "#",
        leftIcon: "",
        rightIcon: "exit",
      },
    ],
    col4: [
      {
        id: 1,
        label: menuItems.termsConditions,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 2,
        label: menuItems.privacyPolicy,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 3,
        label: menuItems.hebrew,
        href: "#",
        rightIcon: "globe",
        leftIcon: "down-arrow",
      },
    ],
  },
];

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="focus:outline-none cursor-pointer text-theme"
      >
        {isOpen ? <IconImage icon="close" /> : <IconImage icon="threeline" />}
      </button>

      {/* Dropdown Menu with Animation */}
      <div
        className={` absolute top-20 right-0 w-full h-screen shadow-lg flex px-20 bg-black/20 backdrop-blur-sm overflow-y-auto overflow-x-hidden transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-[96vh] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-10 pointer-events-none"
        }`}
      >
        <div className="w-full mx-auto h-[max-content] py-10 px-12 flex gap-10 rounded-b-xl bg-white/90 backdrop-blur-xl">
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
                      className="text-theme hover:text-dark transition font-bold text-smm flex items-center gap-2.5 hover:text"
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
