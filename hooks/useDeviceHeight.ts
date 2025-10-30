import { useEffect, useState } from "react";

type DeviceHeightGroup =
  | "smallMobile"
  | "mediumMobile"
  | "largeMobile"
  | "tablet"
  | "desktop";

interface DeviceHeightInfo {
  height: number;
  group: DeviceHeightGroup;
  scale: number;
}

/**
 * Hook: Detect device height and provide responsive scaling factors.
 * You can use it to adjust font-size, padding, image sizes, etc. dynamically.
 */
export const useDeviceHeight = (): DeviceHeightInfo => {
  const getDeviceGroup = (height: number): DeviceHeightGroup => {
    if (height <= 640) return "smallMobile";
    if (height <= 740) return "mediumMobile";
    if (height <= 850) return "largeMobile";
    if (height <= 1024) return "tablet";
    return "desktop";
  };

  const getScaleFactor = (group: DeviceHeightGroup): number => {
    switch (group) {
      case "smallMobile":
        return 0.6;
      case "mediumMobile":
        return 0.75;
      case "largeMobile":
        return 0.95;
      case "tablet":
        return 1;
      case "desktop":
      default:
        return 1.1;
    }
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceHeightInfo>(() => {
    const height = typeof window !== "undefined" ? window.innerHeight : 800;
    const group = getDeviceGroup(height);
    return { height, group, scale: getScaleFactor(group) };
  });

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      const group = getDeviceGroup(height);
      setDeviceInfo({ height, group, scale: getScaleFactor(group) });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceInfo;
};
