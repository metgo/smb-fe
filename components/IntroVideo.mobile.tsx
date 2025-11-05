"use client";

import { GoUnmute, GoMute } from "react-icons/go";
import { useEffect, useRef, useState } from "react";

import { BUCKET_URL } from "@/constant/envConstants";
import useGeneralStore from "@/stores/generalStore";
import { useDeviceHeight } from "@/hooks";

const IntroVideoMobile = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const { siteInfo } = useGeneralStore();
  const { scale, group } = useDeviceHeight();

  useEffect(() => {
    const video = videoRef.current;

    // Ensure muted state is synced with video
    if (video) {
      video.muted = isMuted;
    }

    const tryAutoplay = () => {
      if (video) {
        video
          .play()
          .then(() => {
            // Autoplay success
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
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <div className="relative w-full h-screen max-sm:block md:hidden">
      <video
        ref={videoRef}
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        src={
          siteInfo?.mobileHomeVideos?.[0]?.url ??
          `${BUCKET_URL}/video/intro-video-mobile.mkv`
        }
        className="object-cover absolute inset-0 w-full h-full z-10"
      />

      {/* Mute/Unmute Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMute();
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="absolute  right-10 z-10 text-white bg-black/50 hover:bg-black/70 border-[3px] border-white rounded-full p-3 transition custom-cursor"
        aria-label="Toggle Mute"
        style={{
          bottom:
            group === "mediumMobile"
              ? 166 * scale
              : group === "largeMobile"
                ? 100 * scale
                : 90 * scale,
        }}
      >
        {/* max-sm:bottom-26 md:bottom-10 */}
        {isMuted ? <GoMute size={24} /> : <GoUnmute size={24} />}
      </button>
    </div>
  );
};

export default IntroVideoMobile;
