"use client";

import useGeneralStore from "@/stores/generalStore";
import { Logo } from "../ui/icons";
import { useRouter } from "next/navigation";

const NavLogo = () => {
  const router = useRouter();
  const { setIsOnSection2 } = useGeneralStore();

  function handleNavigation() {
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
