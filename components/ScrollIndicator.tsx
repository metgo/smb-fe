"use client";
import { IconImage } from "@/components/ui";

const ScrollIndicator = () => {
  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight, // scroll 100vh down
      behavior: "smooth",
    });
  };

  return (
    <div
      onClick={handleScroll}
      className="absolute bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer z-50"
    >
      <IconImage
        width={40}
        height={70}
        icon="scroll-mouse"
      />
    </div>
  );
};

export default ScrollIndicator;
