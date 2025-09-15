"use client";

import Image from "next/image";
import { useState } from "react";
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Marketing = ({ marketing }: any) => {
  const images = marketing?.images?.items || [];
  const playType = marketing?.images?.playType || "CAROUSEL";
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images.length) return <div>No Images</div>;

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-white">
      {/* Image inset 5px from screen edge */}
      <div className="absolute top-[5px] left-[5px] right-[5px] bottom-[5px]">
        {playType !== "ARROW" && (
          <>
            <Image
              fill
              src={images[currentIndex].url}
              alt={`slide-${currentIndex}`}
              className="object-cover rounded-md"
            />

            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-6 -translate-y-1/2 text-white text-4xl"
            >
              <FaArrowCircleLeft />
            </button>

            {/* Right Arrow */}
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-6 -translate-y-1/2 text-white text-4xl"
            >
              <FaArrowCircleRight />
            </button>
          </>
        )}

        {playType !== "CAROUSEL" && (
          <Carousel
            showArrows
            autoPlay
            infiniteLoop
            interval={(marketing?.images?.timeInterval || 3) * 1000}
            showThumbs={false}
            showStatus={false}
            className="h-full w-full"
          >
            {images.map((img: any, idx: number) => (
              <div key={idx} className="h-full w-full">
                <img
                  src={img.url}
                  alt={`carousel-${idx}`}
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
            ))}
          </Carousel>
        )}
      </div>

      {/* White border 10px from edge (over image) */}
      <div className="absolute top-[10px] left-[10px] right-[10px] bottom-[10px] border-4 border-white pointer-events-none" />

      {/* Example button */}
      <button
        type="button"
        className="absolute right-40 top-1/2 bg-white px-8 py-2 rounded-md border border-lightGray cursor-pointer"
      >
        Button
      </button>
    </div>
  );
};

export default Marketing;
