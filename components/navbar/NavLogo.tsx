"use client";

import { usePathname, useRouter } from "next/navigation";

import { Logo } from "../ui/icons";
import useGeneralStore from "@/stores/generalStore";
import { startLoading } from "../wrappers/ProgressBar";
import { pathNames } from "@/lib/endpoints";

const NavLogo = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setIsOnSection2, setHideFirstTwoSection } = useGeneralStore();

  function handleNavigation() {
    if (pathname === pathNames.home) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      startLoading();
      router.push("/");
    }
    setHideFirstTwoSection(false);
    setIsOnSection2(false);
  }

  return (
    <div className="custom-cursor" onClick={handleNavigation}>
      <Logo />
    </div>
  );
};

export default NavLogo;
