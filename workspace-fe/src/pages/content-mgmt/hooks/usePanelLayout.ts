import { useState, useEffect } from "react";

type PanelFocus = "both" | "left" | "right";

export function usePanelLayout() {
  const [focus, setFocus] = useState<PanelFocus>("both");
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  const [mobilePanel, setMobilePanel] = useState<"left" | "right">("left");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const effectiveFocus: PanelFocus = isMobile ? mobilePanel : focus;

  return {
    mobilePanel,
    setMobilePanel,
    effectiveFocus,
    expandLeft: () => setFocus((p) => (p === "left" ? "both" : "left")),
    expandRight: () => setFocus((p) => (p === "right" ? "both" : "right")),
  };
}
