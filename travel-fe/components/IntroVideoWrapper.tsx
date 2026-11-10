"use client";

import { useState, useEffect } from "react";

import IntroVideo from "./IntroVideo";
import IntroVideoMobile from "./IntroVideo.mobile";
import { getThumbnail } from "@/constant/images";

const IntroVideoWrapper = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Detect device on mount
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());
  }, []);

  // Show thumbnail while determining device type
  if (isMobile === null) {
    const thumbnailJson = getThumbnail();
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <img
          src={thumbnailJson?.desktop}
          alt="Video thumbnail"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  // Render only the appropriate video component
  return isMobile ? <IntroVideoMobile /> : <IntroVideo isMobile={false} />;
};

export default IntroVideoWrapper;
