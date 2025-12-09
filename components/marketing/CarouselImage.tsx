"use client";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import React, { useEffect, useRef, useState } from "react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";

import MarketingContent from "./MarketingContent";
import { useDeviceHeight } from "@/hooks";

interface CarouselImageProps {
  images: {
    url: string;
    link: string;
    title: string;
    description: string;
  }[];
  timeInterval: string;
}

const CarouselImage = ({ images, timeInterval }: CarouselImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { scale } = useDeviceHeight();

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
      // style={{ height: height ? height : "100vh" }}
      className=" w-full h-screen relative overflow-hidden bg-black"
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet-custom",
          bulletActiveClass: "swiper-pagination-bullet-active-custom",
        }}
        autoplay={{
          delay: Number(timeInterval) ? Number(timeInterval) * 1000 : 1 * 1000,
          disableOnInteraction: false,
        }}
        loop={true}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        className="h-screen w-full bg-white"
        onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
      >
        {images?.map((img, index) => (
          <SwiperSlide key={index} className="relative">
            <div className="absolute inset-0 h-screen">
              <Image
                fill
                src={img?.url}
                alt={`slide-${index}`}
                className="object-cover h-screen shadow-2xl"
                priority={index === 0}
              />
              <MarketingContent scale={scale} content={img} />
              <div className="absolute inset-0 md:rounded-lg bg-gradient-to-tl from-black/80 via-black/20 to-transparent" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom pagination dots */}
      <div
        style={{ bottom: 24 * scale }}
        className="absolute left-1/2 -translate-x-1/2 z-10 flex space-x-3"
      >
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
    </div>
  );
};

export default CarouselImage;
