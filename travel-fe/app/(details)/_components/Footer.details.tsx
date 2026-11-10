"use client";

import Link from "next/link";
import Image from "next/image";

import { menuItems } from "@/constant/hebrew";
import { IconImage } from "@/components/ui";
import { usePathname } from "next/navigation";
import { pathNames } from "@/lib/endpoints";

const navItems = [
  {
    col1: [
      { id: 1, label: menuItems.welcome, href: "#" },
      { id: 2, label: menuItems.ourStory, href: "#" },
      { id: 3, label: menuItems.visitorCenter, href: "#" },
    ],
    col2: [
      { id: 1, label: menuItems.eventGeneralPublic, href: "#" },
      { id: 2, label: menuItems.eventCompaniesOrg, href: "#" },
      { id: 3, label: menuItems.routes, href: pathNames.trails },
    ],
    col3: [
      { id: 1, label: menuItems.registerLogin, href: "#" },
      { id: 2, label: menuItems.joinBusiness, href: pathNames.joinBusiness },
      { id: 3, label: menuItems.blog, href: "#" },
    ],
    col4: [
      { id: 1, label: menuItems.termsOfUse, href: pathNames.termsConditions },
      { id: 2, label: menuItems.privacyPolicy, href: pathNames.privacyPolicy },
    ],
    col5: [
      { id: 1, label: menuItems.hebrew, href: "#", rightIcon: "/images" },
      { id: 2, label: menuItems.contactUs, href: pathNames.contactUs },
    ],
  },
];

const socialMedias = [
  {
    id: 1,
    icon: "facebook",
    link: "#",
  },
  {
    id: 2,
    icon: "instagram",
    link: "#",
  },
  {
    id: 3,
    icon: "whatsapp",
    link: "#",
  },
];

const Footer = () => {
  const pathname = usePathname();

  // Extract first segment from the pathname
  const segments = pathname.split("/").filter(Boolean);
  const basePath = `/${segments[0]}`;

  if (basePath === pathNames.trailDetails) return null;

  return (
    <div className="relative">
      <div className="mx-20 relative h-[156px] overflow-hidden max-sm:hidden md:block">
        <hr className="h-[1px] text-primary" />
        <div className="w-full py-10 flex items-baseline gap-18.5">
          {Object.entries(navItems[0]).map(([colKey, items]) => (
            <div key={colKey} className="flex gap-2">
              <div className="flex flex-col">
                {items.map((item) => (
                  <div key={item.id} className="mb-2 hover:underline">
                    <Link
                      href={item.href}
                      className="text-theme transition text-sm font-normal"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2">
            {socialMedias.map((item) => (
              <Link key={item.id} href={item.link} className="">
                <IconImage icon={item.icon} />
              </Link>
            ))}
          </div>
        </div>

        {pathNames.fundayEnquiry !== pathname && (
          <Image
            src={"/images/yellow-inflorescence.png"}
            alt="Yellow Inflorescence"
            width={110}
            height={156}
            className=" absolute left-5 top-10 rotate-10"
          />
        )}
      </div>
      {pathNames.fundayEnquiry === pathname && (
        <Image
          src={"/images/red-inflorescence.png"}
          alt="Yellow Inflorescence"
          width={200}
          height={156}
          className=" absolute left-0 -top-2 max-sm:hidden"
        />
      )}
    </div>
  );
};

export default Footer;
