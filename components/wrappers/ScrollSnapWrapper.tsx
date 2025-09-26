"use client";

import { useEffect, useRef } from "react";
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
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const isTouching = useRef<boolean>(false);
  const lastTouchTime = useRef<number>(0);

  const { setIsOnSection2, setHideFirstTwoSection, hideFirstTwoSection } =
    useGeneralStore();

  const smoothScroll = (target: HTMLElement | null, after?: () => void) => {
    if (!target) return;
    isScrolling.current = true;
    target.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      isScrolling.current = false;
      after?.();
    }, 800);
  };

  const getCurrentSection = () => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    if (hideFirstTwoSection) return "feed";
    if (scrollY < vh * 0.5) return "first";
    if (scrollY < vh * 1.5) return "second";
    return "feed";
  };

  const handleSectionTransition = (direction: "up" | "down") => {
    if (isScrolling.current) return;

    const currentSection = getCurrentSection();
    const scrollY = window.scrollY;

    // If first two sections are hidden, handle feed section scrolling
    if (hideFirstTwoSection) {
      const feedElement = feedSectionRef.current;
      if (!feedElement) return;

      const feedOffsetTop = feedElement.offsetTop;

      if (direction === "up" && scrollY <= feedOffsetTop + 50) {
        // Snap back to feed section top
        smoothScroll(feedSectionRef.current);
        return;
      }
      // Allow normal scrolling within feed
      return;
    }

    // Handle transitions between sections
    if (direction === "down") {
      if (currentSection === "first") {
        setIsOnSection2(false);
        if (!hasMarketing) {
          setHideFirstTwoSection(true);
          smoothScroll(feedSectionRef.current);
        } else {
          smoothScroll(secondSectionRef.current);
        }
      } else if (currentSection === "second" && hasMarketing) {
        setIsOnSection2(true);
        setHideFirstTwoSection(true);
        smoothScroll(feedSectionRef.current);
      }
    } else if (direction === "up") {
      if (currentSection === "second" && hasMarketing) {
        smoothScroll(firstSectionRef.current);
      } else if (currentSection === "feed" && hideFirstTwoSection) {
        setHideFirstTwoSection(false);
        setIsOnSection2(false);
        smoothScroll(
          hasMarketing ? secondSectionRef.current : firstSectionRef.current,
        );
      }
    }
  };

  // Desktop wheel event handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Skip if this is a mobile device
      if ("ontouchstart" in window) return;

      if (isScrolling.current) return;

      const direction = e.deltaY > 0 ? "down" : "up";
      const scrollY = window.scrollY;

      // Check if we're in a scrollable container
      const target = e.target as HTMLElement;
      const scrollableContainer = target.closest(
        "[data-scrollable]",
      ) as HTMLElement;
      if (scrollableContainer) return;

      // Prevent default scrolling for section transitions
      if (
        !hideFirstTwoSection ||
        (hideFirstTwoSection &&
          direction === "up" &&
          scrollY <= (feedSectionRef?.current?.offsetTop ?? 0) + 50)
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

  // Mobile touch event handlers
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      isTouching.current = true;
      touchStartY.current = e.touches[0].clientY;
      lastTouchTime.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching.current) return;

      touchEndY.current = e.touches[0].clientY;

      // Check if we're in a scrollable container
      const target = e.target as HTMLElement;
      const scrollableContainer = target.closest(
        "[data-scrollable]",
      ) as HTMLElement;
      if (scrollableContainer) return;

      // Only prevent default for section transitions
      const scrollY = window.scrollY;

      if (!hideFirstTwoSection) {
        // Prevent default scrolling in first two sections
        e.preventDefault();
      } else if (
        hideFirstTwoSection &&
        scrollY <= (feedSectionRef.current?.offsetTop || 0) + 50
      ) {
        // Prevent scrolling up from feed section top
        const deltaY = touchStartY.current - touchEndY.current;
        if (deltaY < 0) {
          // Swiping down (going up)
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTouching.current) return;

      isTouching.current = false;

      const touchDelta = touchStartY.current - touchEndY.current;
      const touchDuration = Date.now() - lastTouchTime.current;
      const minSwipeDistance = 50;
      const maxSwipeTime = 500;

      // Check if this is a valid swipe
      if (
        Math.abs(touchDelta) < minSwipeDistance ||
        touchDuration > maxSwipeTime
      ) {
        return;
      }

      // Check if we're in a scrollable container
      const target = e.target as HTMLElement;
      const scrollableContainer = target.closest(
        "[data-scrollable]",
      ) as HTMLElement;
      if (scrollableContainer) return;

      const direction = touchDelta > 0 ? "down" : "up";
      handleSectionTransition(direction);
    };

    // Only add touch events on mobile devices
    if ("ontouchstart" in window) {
      document.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd, { passive: true });

      return () => {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    setIsOnSection2,
    setHideFirstTwoSection,
    hideFirstTwoSection,
    hasMarketing,
  ]);

  // Handle initial scroll position and browser back/forward
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling.current || isTouching.current) return;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Auto-snap to nearest section on scroll end
      const snapTimeout = setTimeout(() => {
        if (isScrolling.current || isTouching.current) return;

        if (hideFirstTwoSection) {
          const feedElement = feedSectionRef.current;
          if (feedElement && scrollY < feedElement.offsetTop - 100) {
            smoothScroll(feedElement);
          }
        } else {
          if (scrollY < vh * 0.5) {
            smoothScroll(firstSectionRef.current);
          } else if (scrollY < vh * 1.5 && hasMarketing) {
            smoothScroll(secondSectionRef.current);
          } else if (scrollY >= vh * 1.5) {
            smoothScroll(feedSectionRef.current);
            setHideFirstTwoSection(true);
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
  }, [hideFirstTwoSection, hasMarketing]);

  return (
    <>
      {!hideFirstTwoSection && (
        <>
          <div ref={firstSectionRef} className="h-screen">
            {children[0]}
            <ScrollIndicator />
          </div>
          {hasMarketing && (
            <div ref={secondSectionRef} className="h-screen relative">
              {children[1]}
              <ScrollIndicator isSecond />
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
