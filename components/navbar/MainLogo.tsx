"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { pathNames } from "@/lib/endpoints";
import { getLogo } from "@/constant/images";
import { CODE } from "@/constant/envConstants";

const MainLogo = () => {
  const router = useRouter();

  function handleClick() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    router.push(pathNames.home);
  }

  const logo = getLogo(CODE);

  return (
    <Image
      alt="Logo"
      src={logo?.image.white || ""}
      width={logo?.size.width}
      height={logo?.size.height}
      className="z-50 custom-cursor"
      onClick={handleClick}
    />
  );
};

export default MainLogo;
