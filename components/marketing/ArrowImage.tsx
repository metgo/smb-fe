"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { IconImage } from "../ui";
import { misc } from "@/constant/hebrew";

interface ArrowImageProps {
  images: {
    url: string;
    link: string;
  }[];
}

const ArrowImage = ({ images }: ArrowImageProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
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
      className="h-screen w-full relative overflow-hidden bg-white z-50"
    >
      {/* Image inset 5px from screen edge */}
      <div className="absolute top-2 left-2 right-2 bottom-2">
        <div className="relative h-full w-full">
          <Image
            fill
            src={images[currentIndex].url}
            alt={`slide-${currentIndex}`}
            className="object-cover rounded-md transition-all duration-700 ease-in-out"
          />
        </div>
      </div>

      {/* White border 10px from edge */}
      <div className="absolute top-6 left-6 right-6 bottom-6 border-4 border-white pointer-events-none z-20" />

      <div className="absolute top-2/3 right-20 -translate-y-1/2 z-30">
        <Link
          href={images[currentIndex].link}
          target="_blank"
          className="custom-cursor  border border-lightGray bg-white/90 backdrop-blur-sm px-8 py-3 rounded-lg font-semibold text-gray-800 hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl font-bold"
        >
          {misc.forMoreDetails}
        </Link>
      </div>

      {/* Circle indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-30 items-center">
        <button type="button" onClick={handleNext} className="custom-cursor">
          <IconImage icon="next" width={30} height={30} />
        </button>
        <div className="flex gap-2">
          {images.map((_, idx) => (
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
          <IconImage icon="prev" width={30} height={30} />
        </button>
      </div>
    </div>
  );
};

export default ArrowImage;
