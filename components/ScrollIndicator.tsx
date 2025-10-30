"use client";

import clsx from "clsx";

import { IconImage } from "@/components/ui";
import useGeneralStore from "@/stores/generalStore";

const ScrollIndicator = ({
  isSecond = false,
  hasMarketing = false,
  height,
}: {
  height?: number;
  isSecond?: boolean;
  hasMarketing?: boolean;
}) => {
  const { setIsOnSection2, setHideFirstTwoSection } = useGeneralStore();

  const handleScroll = () => {
    // Use document.documentElement.clientHeight for more reliable viewport height
    const vh = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0,
    );

    // Scroll to exact viewport height
    const targetScroll = isSecond ? vh * 2 : vh;

    // Force scroll to exact position
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });

    // Small delay to ensure scroll completes, then snap to exact position
    setTimeout(() => {
      window.scrollTo({
        top: targetScroll,
        behavior: "auto", // Instant snap to fix any drift
      });

      if (isSecond) {
        setIsOnSection2(true);
        setHideFirstTwoSection(true);
      } else {
        if (hasMarketing) setIsOnSection2(false);
        else setIsOnSection2(true);
        // setHideFirstTwoSection(false);
      }
    }, 800);
  };

  return (
    <div
      onClick={handleScroll}
      className={clsx(
        isSecond ? "md:bottom-24" : "md:bottom-10.5",
        "absolute left-1/2 transform -translate-x-1/2 custom-cursor z-10",
      )}
      style={{ bottom: isSecond && height && height < 700 ? "80px" : "40px" }}
    >
      <div className="flex flex-col items-center justify-center gap-2.5">
        <IconImage width={60} height={60} icon="scroll-down.gif" hasExtension />
      </div>
    </div>
  );
};

export default ScrollIndicator;
