"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useDeviceHeight } from "@/hooks";
import useGeneralStore from "@/stores/generalStore";
import ScrollIndicator from "../ScrollIndicator";

type Props = {
  hasMarketing: boolean;
  children: React.ReactNode[]; // [first, marketing?, feed]
};

/**
 * Clean, unified ScrollSnap wrapper (Option B)
 * - Smooth, easing-based transitions between sections
 * - Locks feed content during the animation (no wheel/touch)
 * - Unified wheel + touch handlers
 * - Debounced auto-snap on scroll stop
 */
export default function ScrollSnapWrapper({ children, hasMarketing }: Props) {
  const firstRef = useRef<HTMLDivElement | null>(null);
  const secondRef = useRef<HTMLDivElement | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);

  // state in global store
  const {
    setIsOnSection2,
    setHideFirstTwoSection,
    hideFirstTwoSection,
    isFilterDrawerOpen,
  } = useGeneralStore();

  const { height } = useDeviceHeight();

  // internal locks
  const isAnimating = useRef(false);
  const isTouching = useRef(false);
  const touchStartY = useRef(0);

  const getVh = useCallback(() => {
    return Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0,
    );
  }, []);

  // Simple ease in/out
  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

  // Scroll lock helpers
  const lockScroll = () => {
    if (isFilterDrawerOpen) return;
    // lock scrolling and touch interactions as broadly as possible
    document.body.style.overflow = "hidden";
    // also add a class to freeze fixed/absolute children if project uses it (optional)
    document.documentElement.style.touchAction = "none";
    isAnimating.current = true;
  };
  const unlockScroll = () => {
    document.body.style.overflow = "";
    document.documentElement.style.touchAction = "auto";
    isAnimating.current = false;
  };

  // Core smooth scroll animator (cancellable only by internal guard)
  const smoothScrollTo = useCallback((targetY: number, duration = 600) => {
    if (isAnimating.current) return Promise.resolve();
    lockScroll();

    return new Promise<void>((resolve) => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      const frame = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOut(progress);
        window.scrollTo(0, startY + distance * eased);
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          // tiny timeout to allow browser to settle
          setTimeout(() => {
            unlockScroll();
            resolve();
          }, 0);
        }
      };

      requestAnimationFrame(frame);
    });
  }, []);

  // Determine current section based on scroll position
  const currentSection = useCallback(() => {
    if (isFilterDrawerOpen) return;

    const scrollY = window.scrollY;
    const vh = getVh();
    if (hideFirstTwoSection) return "feed";
    if (scrollY < vh * 0.5) return "first";
    if (hasMarketing && scrollY < vh * 1.5) return "second";
    return "feed";
  }, [getVh, hasMarketing, hideFirstTwoSection, isFilterDrawerOpen]);

  // Core transition between sections
  const goToSection = useCallback(
    async (section: "first" | "second" | "feed") => {
      if (isAnimating.current) return;

      if (section === "first") {
        const top = firstRef.current?.offsetTop ?? 0;
        await smoothScrollTo(top);
        setHideFirstTwoSection(false);
        setIsOnSection2(false);
      } else if (section === "second") {
        const top = secondRef.current?.offsetTop ?? 0;
        await smoothScrollTo(top);
        setHideFirstTwoSection(false);
        setIsOnSection2(false);
      } else {
        const top = feedRef.current?.offsetTop ?? 0;
        await smoothScrollTo(top);
        setHideFirstTwoSection(true);
        if (hasMarketing) setIsOnSection2(true);
      }
    },
    [setHideFirstTwoSection, setIsOnSection2, hasMarketing, smoothScrollTo],
  );

  // Unified wheel handler (desktop)
  useEffect(() => {
    if (isFilterDrawerOpen) return;

    const onWheel = (e: WheelEvent) => {
      // ignore on touch devices
      if ("ontouchstart" in window) return;

      if (isAnimating.current) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaY;
      const dir = delta > 0 ? "down" : "up";
      const section = currentSection();

      // TOP SECTIONS ACTIVE
      if (!hideFirstTwoSection) {
        e.preventDefault();

        if (dir === "down") {
          if (section === "first") {
            if (!hasMarketing) goToSection("feed");
            else goToSection("second");
          } else if (section === "second") {
            goToSection("feed");
          }
        } else {
          // scrolling UP
          if (section === "second") goToSection("first");
          else if (section === "feed" && hideFirstTwoSection)
            goToSection("second");
        }

        return;
      }

      // ============================
      // FEED SECTION VISIBLE
      // ============================

      const feedTop = feedRef.current?.offsetTop ?? 0;
      const atFeedTop = window.scrollY <= feedTop + 10;

      const isDesktop = window.innerWidth >= 1024;

      if (isAnimating.current) {
        e.preventDefault();
        return;
      }

      if (dir === "up" && atFeedTop) {
        // 🔒 NEW: Desktop → Block upward navigation permanently
        if (isDesktop) {
          e.preventDefault();
          return; // DO NOT go back to "second"
        }

        // 📱 Mobile fallback (unchanged)
        e.preventDefault();
        goToSection("second");
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [currentSection, goToSection, hasMarketing, hideFirstTwoSection]);

  // Touch handlers (mobile)
  useEffect(() => {
    let touchMoved = false;

    const onTouchStart = (ev: TouchEvent) => {
      if (!ev.touches || ev.touches.length === 0) return;
      isTouching.current = true;
      touchStartY.current = ev.touches[0].clientY;
      touchMoved = false;
    };

    const onTouchMove = (ev: TouchEvent) => {
      if (!isTouching.current) return;
      touchMoved = true;

      // if animating, block move
      if (isAnimating.current) {
        ev.preventDefault();
        return;
      }

      // when top sections visible, block native scroll to keep UX consistent
      if (!hideFirstTwoSection) {
        ev.preventDefault();
      } else {
        // when in feed, if at top and swiping down (meaning content should go up) block to trigger transition
        const feedTop = feedRef.current?.offsetTop ?? 0;
        const atFeedTop = window.scrollY <= feedTop + 5;
        const touchY = ev.touches[0].clientY;
        const diff = touchStartY.current - touchY; // positive means swipe up

        const isSwipingDown = diff < 0; // user moving finger down -> want to scroll up
        if (atFeedTop && isSwipingDown) {
          ev.preventDefault();
        }
      }
    };

    const onTouchEnd = (ev: TouchEvent) => {
      if (!isTouching.current) return;
      isTouching.current = false;

      if (!touchMoved) return;

      const endY = ev.changedTouches?.[0]?.clientY ?? touchStartY.current;
      const diff = touchStartY.current - endY; // positive -> swipe up
      const minSwipe = 50;
      if (Math.abs(diff) < minSwipe) return;

      const dir = diff > 0 ? "down" : "up";
      const section = currentSection();

      if (!hideFirstTwoSection) {
        if (dir === "down") {
          if (section === "first") {
            if (!hasMarketing) goToSection("feed");
            else goToSection("second");
          } else if (section === "second") goToSection("feed");
        } else {
          // swipe down
          if (section === "second") goToSection("first");
          else if (section === "feed" && hideFirstTwoSection)
            goToSection("second");
        }
      } else {
        // feed visible
        const feedTop = feedRef.current?.offsetTop ?? 0;
        const atFeedTop = window.scrollY <= feedTop + 50;
        if (dir === "up" && atFeedTop) goToSection("feed");
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [
    currentSection,
    goToSection,
    hasMarketing,
    hideFirstTwoSection,
    isFilterDrawerOpen,
  ]);

  // Auto-snap when user stops scrolling (keeps behavior consistent if user flicks)
  useEffect(() => {
    if (!isFilterDrawerOpen) return;

    let timeout: number | null = null;
    const onScroll = () => {
      if (isAnimating.current || isTouching.current) return;
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        if (isAnimating.current || isTouching.current) return;
        const vh = getVh();
        const scrollY = window.scrollY;

        if (hideFirstTwoSection) {
          const feedTop = feedRef.current?.offsetTop ?? 0;
          if (scrollY < feedTop - 100) goToSection("feed");
        } else {
          if (scrollY < vh * 0.5) goToSection("first");
          else if (hasMarketing && scrollY < vh * 1.5) goToSection("second");
          else goToSection("feed");
        }
      }, 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [
    getVh,
    goToSection,
    hasMarketing,
    hideFirstTwoSection,
    isFilterDrawerOpen,
  ]);

  // JSX
  return (
    <>
      {!hideFirstTwoSection && (
        <>
          <div ref={firstRef} className="h-screen">
            {children[0]}
            <ScrollIndicator
              hasMarketing={hasMarketing}
              onClick={() => goToSection(hasMarketing ? "second" : "feed")}
            />
          </div>

          {hasMarketing && (
            <div ref={secondRef} className="relative h-screen">
              {children[1]}
              <ScrollIndicator
                isSecond
                height={height}
                onClick={() => goToSection("feed")}
              />
            </div>
          )}
        </>
      )}

      <div
        ref={feedRef}
        className="min-h-screen"
        style={{ overscrollBehavior: "none" }}
        // while animating, pointer events are blocked to avoid accidental interactions
        // we guard via inline style to affect only feed area
        aria-hidden={isAnimating.current}
      >
        {children[2]}
      </div>
    </>
  );
}
