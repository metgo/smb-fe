"use client";
import { IconImage } from "@/components/ui";
import useGeneralStore from "@/stores/generalStore";
import clsx from "clsx";

const ScrollIndicator = ({ isSecond = false }: { isSecond?: boolean }) => {
  const { setIsOnSection2, setHideFirstTwoSection } = useGeneralStore();
  const handleScroll = () => {
    const targetScroll = window.innerHeight;
    window.scrollTo({
      top: isSecond ? targetScroll * 2 : targetScroll,
      behavior: "smooth",
    });
    const timeout = setTimeout(() => {
      if (isSecond) {
        setIsOnSection2(true);
        setHideFirstTwoSection(true);
      } else {
        setIsOnSection2(false);
        setHideFirstTwoSection(false);
      }
    }, 800);
    return () => clearTimeout(timeout);
  };

  return (
    <div
      onClick={handleScroll}
      className={clsx(
        isSecond ? " bottom-18" : " bottom-10.5",
        "absolute left-1/2 transform -translate-x-1/2 custom-cursor z-50",
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2.5">
        <IconImage width={60} height={60} icon="scroll-down.gif" hasExtension />
      </div>
    </div>
  );
};

export default ScrollIndicator;
