"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import useGeneralStore from "@/stores/generalStore";
import { startLoading } from "../wrappers/ProgressBar";
import { pathNames } from "@/lib/endpoints";
import { getLogo } from "@/constant/images";

const NavLogo = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setIsOnSection2, setHideFirstTwoSection, setIsFilterDrawerOpen } =
    useGeneralStore();

  function handleNavigation() {
    if (pathname === pathNames.home) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      startLoading();
      router.push(pathNames.home);
    }
    setHideFirstTwoSection(false);
    setIsOnSection2(false);
    setIsFilterDrawerOpen(false);
  }

  const logo = getLogo();
  return (
    <div className="custom-cursor" onClick={handleNavigation}>
      <Image
        alt="Logo"
        src={logo?.image.black || ""}
        width={logo?.size.width}
        height={logo?.size.height}
        className={` z-50 custom-cursor w-[${logo.size.width}px] h-[${logo.size.height}px] `}
      />
    </div>
  );
};

export default NavLogo;
