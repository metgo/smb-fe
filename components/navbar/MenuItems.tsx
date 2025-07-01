"use client";

import Link from "next/link";

import { features } from "@/lib/utils";
import { IconImage } from "../ui";
import { usePathname } from "next/navigation";

const MenuItems = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 ms-9">
      {features.map((item) => (
        <Link
          key={item.key}
          href={item.link}
          className="flex flex-col items-center px-1 w-14"
        >
          <IconImage
            width={24}
            height={24}
            icon={item.link === pathname ? item.activeIcon : item.icon}
          />
          <div className="text-sm font-normal text-theme w-14">
            {item.label}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MenuItems;
