"use client";

import clsx from "clsx";
import Image from "next/image";

import useGeneralStore from "@/stores/generalStore";
import { siteStatus } from "@/lib/utils";

const StickyYellowRibbonImage = ({
  activeFilterTab,
}: {
  activeFilterTab: string;
}) => {
  const { zIndex } = useGeneralStore();
  if (
    activeFilterTab !== "gallery" ||
    siteStatus.isHofash ||
    siteStatus.isKefotef
  )
    return;

  return (
    <Image
      width={300}
      height={300}
      alt="Yellow image"
      src="/images/yellow.png"
      className={clsx(
        `z-${zIndex}`,
        "fixed -bottom-12 -left-30 rotate-[40deg]",
      )}
    />
  );
};

export default StickyYellowRibbonImage;
