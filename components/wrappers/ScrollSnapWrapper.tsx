"use client";

import { useEffect, useRef } from "react";
import { useDeviceHeight } from "@/hooks";

import useGeneralStore from "@/stores/generalStore";
import ScrollIndicator from "../ScrollIndicator";

export default function ScrollSnapWrapper({
  children,
  hasMarketing,
}: {
  hasMarketing: boolean;
  children: React.ReactNode[];
}) {
  const isScrolling = useRef(false);
  const firstSectionRef = useRef<HTMLDivElement>(null);
  const secondSectionRef = useRef<HTMLDivElement>(null);
  const feedSectionRef = useRef<HTMLDivElement>(null);

  // Touch handling refs
  //const touchStartY = useRef<number>(0);
  //const touchEndY = useRef<number>(0);
  //const lastTouchTime = useRef<number>(0);
  const isTouching = useRef<boolean>(false);

  const { setIsOnSection2, setHideFirstTwoSection, hideFirstTwoSection } =
    useGeneralStore();
  const { height } = useDeviceHeight();

  // Get reliable viewport height
  const getViewportHeight = () => {
    return Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0,
    );
  };

  /** ===================================
   * Smooth scroll (custom, jitter-free)
   * =================================== */
  const smoothScrollTo = (targetY: number, after?: () => void) => {
    isScrolling.current = true;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 600;
    const startTime = performance.now();

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animateScroll = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOut(progress);
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        isScrolling.current = false;
        after?.();
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const getCurrentSection = () => {
    const scrollY = window.scrollY;
    const vh = getViewportHeight();

    if (hideFirstTwoSection) return "feed";
    if (scrollY < vh * 0.5) return "first";
    if (hasMarketing && scrollY < vh * 1.5) return "second";
    return "feed";
  };

  /** ===================================
   * Handle section transitions
   * =================================== */
  const handleSectionTransition = (direction: "up" | "down") => {
    if (isScrolling.current) return;

    const currentSection = getCurrentSection();
    const scrollY = window.scrollY;

    if (hideFirstTwoSection) {
      const feedElement = feedSectionRef.current;
      if (!feedElement) return;
      const feedOffsetTop = feedElement.offsetTop;

      if (direction === "up" && scrollY <= feedOffsetTop + 50) {
        smoothScrollTo(feedOffsetTop);
        return;
      }
      return;
    }

    if (direction === "down") {
      if (currentSection === "first") {
        setIsOnSection2(false);
        if (!hasMarketing) {
          setIsOnSection2(true);
          setHideFirstTwoSection(true);
          smoothScrollTo(feedSectionRef.current?.offsetTop || 0);
        } else {
          smoothScrollTo(secondSectionRef.current?.offsetTop || 0);
        }
      } else if (currentSection === "second" && hasMarketing) {
        setIsOnSection2(true);
        setHideFirstTwoSection(true);
        smoothScrollTo(feedSectionRef.current?.offsetTop || 0);
      }
    } else if (direction === "up") {
      if (currentSection === "second" && hasMarketing) {
        smoothScrollTo(firstSectionRef.current?.offsetTop || 0);
      } else if (currentSection === "feed" && hideFirstTwoSection) {
        setHideFirstTwoSection(false);
        setIsOnSection2(false);
        // smoothScrollTo(
        //   hasMarketing
        //     ? secondSectionRef.current?.offsetTop || 0
        //     : (firstSectionRef.current?.offsetTop || 0)+ 800,
        // );
      }
    }
  };

  /** ===================================
   * Desktop wheel handler
   * =================================== */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if ("ontouchstart" in window) return; // Skip mobile
      if (isScrolling.current) return;

      const direction = e.deltaY > 0 ? "down" : "up";
      const scrollY = window.scrollY;

      const target = e.target as HTMLElement;
      const scrollableContainer = target.closest("[data-scrollable]");
      if (scrollableContainer) return;

      if (
        !hideFirstTwoSection ||
        (hideFirstTwoSection &&
          direction === "up" &&
          scrollY <= (feedSectionRef.current?.offsetTop || 0) + 50)
      ) {
        e.preventDefault();
      }

      handleSectionTransition(direction);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [
    setIsOnSection2,
    setHideFirstTwoSection,
    hideFirstTwoSection,
    hasMarketing,
  ]);

  /** ===================================
   * Mobile touch swipe handler
   * =================================== */
  // useEffect(() => {
  //   const minSwipeDistance = 50;
  //   const maxSwipeTime = 500;

  //   const handleTouchStart = (e: TouchEvent) => {
  //     isTouching.current = true;
  //     touchStartY.current = e.touches[0].clientY;
  //     touchEndY.current = e.touches[0].clientY;
  //     lastTouchTime.current = Date.now();
  //   };

  //   const handleTouchMove = (e: TouchEvent) => {
  //     if (!isTouching.current) return;

  //     touchEndY.current = e.touches[0].clientY;

  //     const target = e.target as HTMLElement;
  //     const scrollableContainer = target.closest("[data-scrollable]");
  //     if (scrollableContainer) return;

  //     const scrollY = window.scrollY;

  //     if (!hideFirstTwoSection) {
  //       e.preventDefault();
  //     } else if (
  //       scrollY <= (feedSectionRef.current?.offsetTop || 0) + 50 &&
  //       touchStartY.current - touchEndY.current < 0
  //     ) {
  //       e.preventDefault();
  //     }
  //   };

  //   const handleTouchEnd = (e: TouchEvent) => {
  //     if (!isTouching.current) return;
  //     isTouching.current = false;

  //     const deltaY = touchStartY.current - touchEndY.current;
  //     const swipeDuration = Date.now() - lastTouchTime.current;

  //     const isSwipe =
  //       Math.abs(deltaY) > minSwipeDistance && swipeDuration < maxSwipeTime;

  //     if (!isSwipe) return;

  //     e.preventDefault();
  //     const direction = deltaY > 0 ? "down" : "up";

  //     // Lock scroll to prevent flicker
  //     document.body.style.overflow = "hidden";
  //     handleSectionTransition(direction);
  //     setTimeout(() => {
  //       document.body.style.overflow = "";
  //     }, 700);
  //   };

  //   if ("ontouchstart" in window) {
  //     document.addEventListener("touchstart", handleTouchStart, {
  //       passive: false,
  //     });
  //     document.addEventListener("touchmove", handleTouchMove, {
  //       passive: false,
  //     });
  //     document.addEventListener("touchend", handleTouchEnd, { passive: false });

  //     return () => {
  //       document.removeEventListener("touchstart", handleTouchStart);
  //       document.removeEventListener("touchmove", handleTouchMove);
  //       document.removeEventListener("touchend", handleTouchEnd);
  //     };
  //   }
  // }, [hideFirstTwoSection, hasMarketing]);

  /** ===================================
   * Auto-snap logic on scroll stop
   * =================================== */
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling.current || isTouching.current) return;

      const scrollY = window.scrollY;
      const vh = getViewportHeight();

      const snapTimeout = setTimeout(() => {
        if (isScrolling.current || isTouching.current) return;

        if (hideFirstTwoSection) {
          const feedElement = feedSectionRef.current;
          if (feedElement && scrollY < feedElement.offsetTop - 100) {
            smoothScrollTo(feedElement.offsetTop);
          }
        } else {
          if (scrollY < vh * 0.5) {
            smoothScrollTo(firstSectionRef.current?.offsetTop || 0);
          } else if (
            hasMarketing &&
            scrollY >= vh * 0.5 &&
            scrollY < vh * 1.5
          ) {
            smoothScrollTo(secondSectionRef.current?.offsetTop || 0);
          } else if (scrollY >= (hasMarketing ? vh * 1.5 : vh * 0.5)) {
            // smoothScrollTo(feedSectionRef.current?.offsetTop || 0);
            setHideFirstTwoSection(true);
            if (hasMarketing) {
              setIsOnSection2(true);
            }
          }
        }
      }, 150);

      return () => clearTimeout(snapTimeout);
    };

    let scrollTimeout: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener("scroll", debouncedHandleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [
    hideFirstTwoSection,
    hasMarketing,
    setHideFirstTwoSection,
    setIsOnSection2,
  ]);

  /** ===================================
   * JSX Layout
   * =================================== */
  return (
    <>
      {!hideFirstTwoSection && (
        <>
          <div ref={firstSectionRef} className="h-screen">
            {children[0]}
            <ScrollIndicator hasMarketing={hasMarketing} />
          </div>
          {hasMarketing && (
            <div ref={secondSectionRef} className="relative h-screen">
              {children[1]}
              <ScrollIndicator isSecond height={height} />
            </div>
          )}
        </>
      )}
      <div ref={feedSectionRef} className="min-h-screen">
        {children[2]}
      </div>
    </>
  );
}
