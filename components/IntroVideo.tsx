"use client";

import { useEffect, useRef } from "react";
import { BUCKET_URL } from "@/constant/envConstants";

const IntroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    // Try autoplay on mount using requestAnimationFrame to ensure DOM is ready
    const tryAutoplay = () => {
      if (video) {
        video
          .play()
          .then(() => {
            // console.log("Autoplay successful");
          })
          .catch((err) => {
            console.warn("Initial autoplay failed", err);
          });
      }
    };

    requestAnimationFrame(tryAutoplay);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) return;
        if (entry.isIntersecting) {
          video.play().catch((e) => {
            console.warn("Autoplay on scroll failed", e);
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 },
    );

    if (video) {
      observer.observe(video);
    }

    return () => {
      if (video) observer.unobserve(video);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      loop
      muted
      playsInline
      preload="auto"
      src={`${BUCKET_URL}/video/intro-video.mp4`}
      className="object-cover absolute inset-0 w-full h-full z-10"
    />
  );
};

export default IntroVideo;
