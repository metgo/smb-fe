"use client";
import { IconImage } from "@/components/ui";
import useGeneralStore from "@/stores/generalStore";

const ScrollIndicator = () => {
  const { setIsOnSection2 } = useGeneralStore();
  const handleScroll = () => {
    const targetScroll = window.innerHeight;
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
    const timeout = setTimeout(() => {
      setIsOnSection2(true);
    }, 800);
    return () => clearTimeout(timeout);
  };

  return (
    <div
      onClick={handleScroll}
      className="absolute bottom-10.5 left-1/2 transform -translate-x-1/2 custom-cursor z-50"
    >
      <div className="flex flex-col items-center justify-center gap-2.5">
        <IconImage width={60} height={60} icon="scroll-down.gif" hasExtension />
      </div>
    </div>
  );
};

export default ScrollIndicator;
