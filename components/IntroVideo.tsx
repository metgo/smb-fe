"use client";

import { useEffect, useRef } from "react";

const IntroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;

        if (entry.isIntersecting) {
          video.play().catch((e) => {
            // Silent catch if autoplay fails
            console.warn("Autoplay failed", e);
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }, // play/pause when 50% visible
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      loop
      // muted
      playsInline
      preload="auto"
      src="/videos/intro.mp4"
      className="object-cover absolute inset-0 w-full h-full z-10"
    />
  );
};

export default IntroVideo;
