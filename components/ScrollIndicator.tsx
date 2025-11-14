"use client";

import clsx from "clsx";
import { IconImage } from "@/components/ui";
import useGeneralStore from "@/stores/generalStore";

type ScrollIndicatorProps = {
  isSecond?: boolean;
  hasMarketing?: boolean;
  height?: number;
  /** Called when user taps the indicator – parent handles smooth scroll */
  onClick?: () => void;
};

const ScrollIndicator = ({
  isSecond = false,
  hasMarketing = false,
  height,
  onClick,
}: ScrollIndicatorProps) => {
  const { setIsOnSection2, setHideFirstTwoSection } = useGeneralStore();

  const handleClick = () => {
    // Let parent perform the smooth scroll
    onClick?.();

    // We delay state updates until animation is done (~600ms)
    setTimeout(() => {
      if (isSecond) {
        // Second section → going to feed
        setIsOnSection2(true);
        setHideFirstTwoSection(true);
      } else {
        // First section → going to second (or feed if no marketing)
        if (hasMarketing) {
          setIsOnSection2(false); // still on section 1 → 2 transition
        } else {
          setIsOnSection2(true);
          setHideFirstTwoSection(true);
        }
      }
    }, 650); // matches smoothScrollTo duration (600ms) + buffer
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        isSecond ? "md:bottom-24" : "md:bottom-10.5",
        "absolute left-1/2 transform -translate-x-1/2 custom-cursor z-10 select-none",
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
