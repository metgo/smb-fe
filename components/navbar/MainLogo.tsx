"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { pathNames } from "@/lib/endpoints";

const MainLogo = () => {
  const router = useRouter();

  function handleClick() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    router.push(pathNames.home);
  }

  return (
    <Image
      alt="Logo"
      src={"/images/logo/white-logo.svg"}
      width={88}
      height={60}
      className="z-50 custom-cursor"
      onClick={handleClick}
    />
  );
};

export default MainLogo;
