"use client";
import { IconImage } from "@/components/ui";
import { misc } from "@/constant/hebrew";

const ScrollIndicator = () => {
  const handleScroll = () => {
    const targetScroll = window.innerHeight * 0.83;
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div
      onClick={handleScroll}
      className="absolute bottom-24.5 left-1/2 transform -translate-x-1/2 cursor-pointer z-50"
    >
      <div className="flex flex-col items-center justify-center gap-2.5">
        <div className="text-center text-[32px] font-bold text-white">
          {misc.possibilities}
        </div>
        <IconImage width={30} height={30} icon="scroll-mouse" />
      </div>
    </div>
  );
};

export default ScrollIndicator;
