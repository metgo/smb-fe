"use client";

// import Link from "next/link";
import { useState } from "react";

import { IconImage } from "@/components/ui";
// import { menuItems } from "@/constant/hebrew";

// const navItems = [
//   {
//     col1: [
//       { id: 1, label: menuItems.welcome, href: "#" },
//       { id: 2, label: menuItems.businessPage, href: "#" },
//       { id: 3, label: menuItems.visitorCenter, href: "#" },
//       { id: 4, label: menuItems.blogArticle, href: "#" },
//       { id: 5, label: menuItems.joinBusiness, href: "#" },
//       { id: 6, label: menuItems.contactUs, href: "#" },
//     ],
//     col2: [
//       { id: 1, label: menuItems.eventGeneralPublic, href: "#" },
//       { id: 2, label: menuItems.eventCompaniesOrg, href: "#" },
//       { id: 3, label: menuItems.routes, href: "#" },
//     ],
//     col3: [
//       { id: 1, label: menuItems.mySavedOnes, href: "#" },
//       { id: 2, label: menuItems.checkBalance, href: "#" },
//       { id: 3, label: menuItems.purchasingCharacters, href: "#" },
//       { id: 4, label: menuItems.shoppingCart, href: "#" },
//       { id: 5, label: menuItems.exit, href: "#" },
//     ],
//     col4: [
//       { id: 1, label: menuItems.termsConditions, href: "#" },
//       { id: 2, label: menuItems.privacyPolicy, href: "#" },
//       { id: 3, label: menuItems.hebrew, href: "#", rightIcon: "/images" },
//     ],
//   },
// ];

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

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
      {/* <div
        className={`absolute top-20 right-0 w-screen h-screen shadow-lg flex px-70 bg-black/20 backdrop-blur-sm overflow-y-auto transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-[96vh] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-10 pointer-events-none"
        }`}
      >
        <div className="w-full h-[max-content] py-10 px-12 flex gap-10 rounded-b-xl bg-white/90 backdrop-blur-xl">
          {Object.entries(navItems[0]).map(([colKey, items]) => (
            <div key={colKey} className="flex gap-2.75">
              <div className="w-0.25 h-70 bg-[#D3D3D3]" />

              <div className="flex flex-col w-[14.5rem]">
                {items.map((item) => (
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
      </div> */}
    </>
  );
};

export default HamburgerMenu;
