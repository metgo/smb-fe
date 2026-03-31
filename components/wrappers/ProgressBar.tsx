"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const PROGRESS_START_EVENT = "progress-bar:start";
const PROGRESS_DONE_EVENT = "progress-bar:done";

export function startLoading() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_START_EVENT));
  }
}

export function stopLoading() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_DONE_EVENT));
  }
}

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startProgress = () => {
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setVisible(true);
    setProgress(10);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timerRef.current!);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 300);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    completeTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
  };

  // Complete progress on route change
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams]);

  // Listen for external start/stop events
  useEffect(() => {
    window.addEventListener(PROGRESS_START_EVENT, startProgress);
    window.addEventListener(PROGRESS_DONE_EVENT, completeProgress);
    return () => {
      window.removeEventListener(PROGRESS_START_EVENT, startProgress);
      window.removeEventListener(PROGRESS_DONE_EVENT, completeProgress);
    };
  }, []);

  // Listen for link clicks to start progress
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (!link?.href) return;

      const isExternal =
        link.href.startsWith("http") &&
        !link.href.startsWith(window.location.origin);
      const isAnchor = link.href.includes("#");
      const isNewTab = link.target === "_blank";
      const isDownload = link.hasAttribute("download");
      const isMailto = link.href.startsWith("mailto:");
      const isTel = link.href.startsWith("tel:");

      const url = new URL(link.href);
      const isSamePage =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;

      if (
        !isExternal &&
        !isAnchor &&
        !isNewTab &&
        !isDownload &&
        !isMailto &&
        !isTel &&
        !isSamePage
      ) {
        startProgress();
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: `${progress}%`,
        height: "4px",
        background: "#00A5A8",
        zIndex: 9999,
        transition: progress === 100 ? "width 0.2s ease" : "width 0.3s ease",
        transformOrigin: "right",
        boxShadow: "0 0 8px #00A5A8",
      }}
    />
  );
}
