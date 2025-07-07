"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { features } from "@/lib/utils";
import { IconImage } from "@/components/ui";

const MenuItems = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 ms-9">
      {features.map((item) => (
        <Link
          key={item.key}
          href={item.link}
          className="flex flex-col items-center justify-center px-1 w-14"
        >
          <IconImage
            width={24}
            height={24}
            icon={item.link === pathname ? item.activeIcon : item.icon}
          />
          <div
            className={`text-sm w-14 text-center ${item.link === pathname ? "text-charcoal font-bold" : "text-theme font-normal"}`}
          >
            {item.label}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MenuItems;
