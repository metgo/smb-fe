"use client";

import { useEffect, useRef } from "react";
import useGeneralStore from "@/stores/generalStore";

export default function ScrollSnapWrapper({
  children,
}: {
  children: React.ReactNode[];
}) {
  const isScrolling = useRef(false);
  const firstSectionRef = useRef<HTMLDivElement>(null);
  const secondSectionRef = useRef<HTMLDivElement>(null);
  const { isOnSection2, setIsOnSection2 } = useGeneralStore();

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling.current) return;

      const direction = e.deltaY > 0 ? "down" : "up";
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      const secondSection = secondSectionRef.current;

      // Going down from first section to second section
      if (
        direction === "down" &&
        !isOnSection2 &&
        scrollY < viewportHeight - 10
      ) {
        e.preventDefault();
        isScrolling.current = true;
        secondSection?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          isScrolling.current = false;
          setIsOnSection2(true);
        }, 800);
        return;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isOnSection2, setIsOnSection2]);

  return (
    <>
      {!isOnSection2 && (
        <div ref={firstSectionRef} className="h-screen">
          {children[0]}
        </div>
      )}
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
