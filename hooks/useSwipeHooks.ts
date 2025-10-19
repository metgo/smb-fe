import { startLoading } from "@/components/wrappers/ProgressBar";
import { navigationPaths } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

const SWIPE_THRESHOLD = 50;
const SWIPE_DETECTION_THRESHOLD = 10;

export const useSwipeHooks = (
  itemCount: number,
  activeIndex: number,
  setActiveIndex: any,
  slug?: string,
  setIsPanelVisible?: (v: boolean) => void,
) => {
  const router = useRouter();
  const pathname = usePathname();

  const isNavigating = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  const handleNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSwiping.current || activeIndex === null) return;

    isNavigating.current = true;
    startLoading();
    router.push(`${navigationPaths[pathname]}/${slug}`);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = false;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const distance = Math.abs(touchEndX.current - touchStartX.current);

    if (distance > SWIPE_DETECTION_THRESHOLD) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isNavigating.current) {
      setTimeout(() => (isNavigating.current = false), 300);
      return;
    }

    if (!isSwiping.current || activeIndex === null) return;

    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > SWIPE_THRESHOLD) {
      setActiveIndex((prev: number) => {
        if (prev === null) return 0;

        if (distance > 0) {
          // Swipe left -> go to previous
          return prev === 0 ? itemCount - 1 : prev - 1;
        } else {
          // Swipe right -> go to next
          return prev === itemCount - 1 ? 0 : prev + 1;
        }
      });
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
    isSwiping.current = false;

    if (touchStartYRef.current === null) return;

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartYRef.current;

    if (setIsPanelVisible) {
      if (deltaY > 30) {
        setIsPanelVisible(false);
      } else if (deltaY < -30) {
        setIsPanelVisible(true);
      }
    }

    touchStartYRef.current = null;
  };

  return {
    isNavigating,
    isSwiping,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    handleNavigation,
  };
};
