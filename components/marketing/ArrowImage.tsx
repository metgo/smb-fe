"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { IconImage } from "../ui";
import MarketingContent from "./MarketingContent";

interface ArrowImageProps {
  images: {
    url: string;
    link: string;
    title: string;
    description: string;
  }[];
}

const ArrowImage = ({ images }: ArrowImageProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev + 1) % images?.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev - 1 + images?.length) % images?.length);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && containerRef.current) {
        // Find the next sibling section
        const next = containerRef.current.nextElementSibling as HTMLElement;
        if (next) {
          e.preventDefault();
          next.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    const node = containerRef.current;
    if (node) node.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      if (node) node.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className=" max-sm:h-full md:h-screen w-full relative overflow-hidden bg-white"
    >
      {/* Image inset 5px from screen edge */}
      <div className="absolute top-2 left-2 right-2 bottom-2">
        <div className="relative h-full w-full">
          <Image
            fill
            src={images?.[currentIndex]?.url}
            alt={`slide-${currentIndex}`}
            className="object-cover rounded-md transition-all duration-700 ease-in-out"
          />
        </div>
      </div>

      {/* White border 10px from edge */}
      {/* <div className="absolute top-6 left-6 right-6 bottom-6 border-4 border-white pointer-events-none z-20" /> */}

      <MarketingContent content={images?.[currentIndex]} />
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-black/80 via-black/20 to-transparent" />

      {/* Circle indicators */}
      <div className="absolute max-sm:bottom-16 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-8 z-30 items-center">
        <button type="button" onClick={handleNext} className="custom-cursor">
          <IconImage icon="next" width={40} height={40} />
        </button>
        <div className="flex gap-2">
          {images?.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-white scale-125 shadow-md"
                  : "bg-gray-400/70 hover:bg-gray-300"
              }`}
            />
          ))}
        </div>
        <button type="button" onClick={handlePrev} className="custom-cursor">
          <IconImage icon="prev" width={40} height={40} />
        </button>
      </div>
    </div>
  );
};

export default ArrowImage;
