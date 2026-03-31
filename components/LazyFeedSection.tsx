"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback: ReactNode;
  loadImmediately?: boolean;
};

export default function LazyFeedSection({
  children,
  fallback,
  loadImmediately = false,
}: Props) {
  const [shouldLoad, setShouldLoad] = useState(loadImmediately);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldLoad) return; // already loaded (e.g. loadImmediately=true)
    const container = containerRef.current;
    if (!container) return;

    // Create observer that triggers when section is near viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect(); // Stop observing once triggered
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before section is visible
        threshold: 0,
      },
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen">
      {shouldLoad ? children : fallback}
    </div>
  );
}
