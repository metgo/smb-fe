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

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling.current) return;

      const direction = e.deltaY > 0 ? "down" : "up";
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // If first two sections are hidden, handle feed section scrolling
      if (hideFirstTwoSection) {
        setIsOnSection2(true);
        const feedElement = feedSectionRef.current;
        if (feedElement) {
          const feedRect = feedElement.getBoundingClientRect();
          // Check if the wheel event target is within a scrollable container inside the feed section
          const target = e.target as HTMLElement;
          const isInsideScrollable = target.closest("[data-scrollable]");

          // If the event is inside a scrollable container, allow default scrolling
          if (isInsideScrollable) {
            // Check if the scrollable container is at its scroll boundaries
            const scrollableElement = isInsideScrollable as HTMLElement;
            const { scrollTop, scrollHeight, clientHeight } = scrollableElement;

            if (direction === "up" && scrollTop === 0) {
              // At the top of the scrollable container, prevent scrolling up to previous sections
              e.preventDefault();
              smoothScroll(feedSectionRef.current);
              return;
            } else if (
              direction === "down" &&
              scrollTop + clientHeight >= scrollHeight - 1
            ) {
              // At the bottom of the scrollable container, allow window-level scrolling
              return;
            }
            // Allow default scrolling within the scrollable container
            return;
          }

          // If at the top of the feed section and scrolling up, prevent leaving the feed
          if (direction === "up" && feedRect.top >= 0) {
            e.preventDefault();
            smoothScroll(feedSectionRef.current);
            return;
          }
          // Allow normal window scrolling within the feed section
          return;
        }
      }

      // First → Second
      if (direction === "down" && scrollY < vh - 10) {
        e.preventDefault();
        setIsOnSection2(false);
        if (!hasMarketing) setHideFirstTwoSection(true);
        smoothScroll(secondSectionRef.current);
        return;
      }

      // Second → Feed
      if (direction === "down" && scrollY >= vh - 10 && scrollY < 2 * vh - 10) {
        e.preventDefault();
        setIsOnSection2(true);
        setHideFirstTwoSection(true);
        return;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [
    setIsOnSection2,
    setHideFirstTwoSection,
    hideFirstTwoSection,
    hasMarketing,
  ]);

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
