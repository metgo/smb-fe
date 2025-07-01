// import Link from "next/link";
// import { menuItems } from "@/constant/hebrew";
import { UserIcon } from "@/components/ui/icons";

// const items = [
//   { id: 1, label: menuItems.mySavedOnes, href: "#" },
//   { id: 2, label: menuItems.checkBalance, href: "#" },
//   { id: 3, label: menuItems.purchasingCharacters, href: "#" },
//   { id: 4, label: menuItems.addMyBusiness, href: "#" },
//   { id: 5, label: menuItems.exit, href: "#" },
// ];

const UserIconHoverCard = () => {
  return (
    <div className="relative group">
      {/* User Icon (triggers hover) */}
      <div className="peer cursor-pointer">
        <UserIcon />
      </div>

      {/* Hover Card (dropdown) */}
      {/* <div className="hidden group-hover:flex absolute top-0 -left-20 z-10 w-[12.7rem]">
        <div className="bg-white shadow-lg p-2 flex flex-col mt-13 rounded-2xl w-full px-2.5 py-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="p-3 hover:bg-gray-100 rounded text-theme font-bold text-sm border-b border-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default UserIconHoverCard;
