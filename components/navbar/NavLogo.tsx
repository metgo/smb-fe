"use client";

import { useRouter } from "next/navigation";

import { Logo } from "../ui/icons";
import useGeneralStore from "@/stores/generalStore";
import { startLoading } from "../wrappers/ProgressBar";

const NavLogo = () => {
  const router = useRouter();
  const { setIsOnSection2 } = useGeneralStore();

  function handleNavigation() {
    startLoading();
    setIsOnSection2(false);
    router.push("/");
  }

  return (
    <div className="cursor-pointer" onClick={handleNavigation}>
      <Logo />
    </div>
  );
};

export default NavLogo;
