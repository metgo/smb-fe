"use client";

import { useEffect, useState } from "react";

import { REFERENCE_SCREEN_WIDTH } from "@/constant/collageLayouts";

export const useImageScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const currentWidth = window.innerWidth;
      const newScale = currentWidth / REFERENCE_SCREEN_WIDTH;
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return {
    scale,
  };
};
