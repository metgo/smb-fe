"use client";

import Link from "next/link";
import { useState } from "react";

import { hamburgerMenuItems } from "@/constant/hebrew";
import { ThreeLineIcon } from "../ui/icons";

const navItems = [
  {
    col1: [
      { id: 1, label: hamburgerMenuItems.welcome, href: "#" },
      { id: 2, label: hamburgerMenuItems.businessPage, href: "#" },
      { id: 3, label: hamburgerMenuItems.visitorCenter, href: "#" },
      { id: 4, label: hamburgerMenuItems.blogArticle, href: "#" },
      { id: 5, label: hamburgerMenuItems.joinBusiness, href: "#" },
      { id: 6, label: hamburgerMenuItems.contactUs, href: "#" },
    ],
    col2: [
      { id: 1, label: hamburgerMenuItems.eventGeneralPublic, href: "#" },
      { id: 2, label: hamburgerMenuItems.eventCompaniesOrg, href: "#" },
      { id: 3, label: hamburgerMenuItems.routes, href: "#" },
    ],
    col3: [
      { id: 1, label: hamburgerMenuItems.mySavedOnes, href: "#" },
      { id: 2, label: hamburgerMenuItems.checkBalance, href: "#" },
      { id: 3, label: hamburgerMenuItems.purchasingCharacters, href: "#" },
      { id: 4, label: hamburgerMenuItems.shoppingCart, href: "#" },
      { id: 5, label: hamburgerMenuItems.exit, href: "#" },
    ],
    col4: [
      { id: 1, label: hamburgerMenuItems.termsConditions, href: "#" },
      { id: 2, label: hamburgerMenuItems.privacyPolicy, href: "#" },
      { id: 3, label: hamburgerMenuItems.hebrew, href: "#" },
    ],
  },
];

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="focus:outline-none cursor-pointer"
      >
        {isOpen ? <div className="text-[2rem] font-extralight">x</div> : <ThreeLineIcon />}
      </button>

      {/* Dropdown Menu with Animation */}
      <div
        className={`absolute top-20 right-0 w-screen h-screen shadow-lg flex px-70 bg-black/60 backdrop-blur-sm overflow-y-auto transition-all duration-500 ease-in-out ${isOpen ? "max-h-[96vh] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10 pointer-events-none"
          }`}
      >

        <div className="w-full h-[max-content] py-10 px-12 flex gap-10 rounded-b-xl bg-white backdrop-blur-2xl">
          {Object.entries(navItems[0]).map(([colKey, items]) => (
            <div key={colKey} className="flex gap-2.75">
              <div className="w-0.25 h-70 bg-theme" />

              <div className="flex flex-col w-[14.5rem]">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="mb-2 hover:bg-primary py-2 ps-3"
                  >
                    <Link
                      href={item.href}
                      className="text-theme transition font-bold text-sm"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
