import Link from "next/link";
import { featureMenus } from "@/lib/utils";
import { usePathname } from "next/navigation";

import { IconImage } from "../ui";
import useGeneralStore from "@/stores/generalStore";

const MenuItems = () => {
  const pathname = usePathname();
  const { aminitiesInfo } = useGeneralStore();
  const visibleMenus = featureMenus.filter((menu) => aminitiesInfo[menu.key]);

  return (
    <div className="flex items-center gap-2 ms-9">
      {visibleMenus.map((item) => (
        <Link
          key={item.key}
          href={item.link}
          className="flex flex-col items-center justify-center px-1 w-14 custom-cursor"
        >
          <IconImage
            width={24}
            height={24}
            icon={item.link === pathname ? item.activeIcon : item.icon}
          />
          <div
            className={`text-sm w-14 text-center ${
              item.link === pathname
                ? "text-charcoal font-bold"
                : "text-theme font-normal"
            }`}
          >
            {item.label}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MenuItems;
