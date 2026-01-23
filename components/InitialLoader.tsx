"use client";

import clsx from "clsx";
import Image from "next/image";
import { getLogo } from "@/constant/images";

const InitialLoader = () => {
  const logo = getLogo();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white/40">
      <div className="flex flex-col items-center gap-2">
        <div className={clsx(`w-40 h-40`)}>
          <Image
            alt="Logo"
            src={logo?.image.black || ""}
            width={100}
            height={100}
            unoptimized
            className={clsx(
              "z-50 drop-shadow-2xl object-contain animate-pulse w-full h-full ",
            )}
          />
        </div>
        <div className="text-lg font-normal text-slate-800 animate-pulse">
          אנא המתן…
        </div>
      </div>
    </div>
  );
};

export default InitialLoader;
