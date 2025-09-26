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
        const feedElement = feedSectionRef.current;
        if (!feedElement) return;

        const target = e.target as HTMLElement;
        const scrollableContainer = target.closest(
          "[data-scrollable]",
        ) as HTMLElement;

        if (scrollableContainer) {
          // Allow normal scrolling inside scrollable container
          return;
        }

        const scrollTop = window.scrollY;
        const feedOffsetTop = feedElement.offsetTop;

        if (direction === "up" && scrollTop <= feedOffsetTop) {
          e.preventDefault();
          // Snap back to feed section top only if window is above feed
          smoothScroll(feedSectionRef.current);
          return;
        }

        // Allow normal scrolling down inside feed
        return;
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
