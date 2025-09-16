"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import React, { useEffect, useRef, useState } from "react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import Link from "next/link";
import { misc } from "@/constant/hebrew";

interface CarouselImageProps {
  images: {
    url: string;
    link: string;
  }[];
  timeInterval: string;
}

const CarouselImage = ({ images, timeInterval }: CarouselImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    <div className="h-screen w-full relative overflow-hidden bg-white">
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
          delay: Number(timeInterval) * 1000,
          disableOnInteraction: false,
        }}
        loop={true}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        className="h-full w-full bg-white"
        onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
      >
        {images?.map((img, index) => (
          <SwiperSlide key={index} className="relative">
            <div className="absolute inset-2">
              <Image
                fill
                src={img?.url}
                alt={`slide-${index}`}
                className="object-cover rounded-lg shadow-2xl"
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute top-2/3 right-20 -translate-y-1/2 z-30">
                <Link
                  href={img?.link}
                  target="_blank"
                  className="custom-cursor  border border-lightGray bg-white/90 backdrop-blur-sm px-8 py-3 rounded-lg font-semibold text-gray-800 hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl font-bold"
                >
                  {misc.forMoreDetails}
                </Link>
              </div>
              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-lg" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* White border frame */}
      <div className="absolute top-6 left-6 right-6 bottom-6 border-4 border-white pointer-events-none z-20" />

      {/* Custom pagination dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
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

      <style jsx>{`
        .swiper-pagination-bullet-active-custom {
          background: white !important;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default CarouselImage;
