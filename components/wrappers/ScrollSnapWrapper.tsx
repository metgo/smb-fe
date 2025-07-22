"use client";

import { useEffect, useRef } from "react";

export default function ScrollSnapWrapper({
  children,
}: {
  children: React.ReactNode[];
}) {
  const firstSectionRef = useRef<HTMLDivElement>(null);
  const secondSectionRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling.current) return;

      const direction = e.deltaY > 0 ? "down" : "up";
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      const secondSection = secondSectionRef.current;

      // Going down from first section
      if (direction === "down" && scrollY < viewportHeight - 10) {
        e.preventDefault();
        isScrolling.current = true;
        secondSection?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => (isScrolling.current = false), 700);
        return;
      }

      // Going up from top of second section
      if (
        direction === "up" &&
        secondSection &&
        secondSection.getBoundingClientRect().top >= 0
      ) {
        e.preventDefault();
        isScrolling.current = true;
        firstSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => (isScrolling.current = false), 700);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <>
      <div ref={firstSectionRef} className="h-screen">
        {children[0]}
      </div>
      <div
        ref={secondSectionRef}
        className="min-h-screen"
        style={{ scrollBehavior: "smooth" }}
      >
        {children[1]}
      </div>
    </>
  );
}
