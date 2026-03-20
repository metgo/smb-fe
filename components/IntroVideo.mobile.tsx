"use client";

import { GoUnmute, GoMute } from "react-icons/go";
import { useEffect, useRef, useState, useMemo } from "react";

import { BUCKET_URL } from "@/constant/envConstants";
import useGeneralStore from "@/stores/generalStore";
import { useDeviceHeight } from "@/hooks";
import { getThumbnail } from "@/constant/images";

// Default mobile video URL - used immediately
const DEFAULT_MOBILE_URL = `${BUCKET_URL}/video/intro-video-mobile.mkv`;

const IntroVideoMobile = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const { siteInfo } = useGeneralStore();
  const { scale, group } = useDeviceHeight();

  const thumbnailJson = getThumbnail();
  const videoThumbnail = thumbnailJson?.mobile;

  // Compute video URL immediately - don't wait for siteInfo
  const videoURL = useMemo(() => {
    return siteInfo?.mobileHomeVideos?.[0]?.url || DEFAULT_MOBILE_URL;
  }, [siteInfo]);

  // Video setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;

    const handleCanPlay = () => {
      setIsVideoReady(true);
      video.play().catch(() => {});
    };

    video.addEventListener("canplay", handleCanPlay);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) return;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(video);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      observer.disconnect();
    };
  }, [videoURL]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen max-sm:block md:hidden"
    >
      {/* Thumbnail shown while video loads */}
      <img
        src={videoThumbnail}
        alt="Video thumbnail"
        className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 ${
          isVideoReady ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* Video - loads immediately */}
      <video
        ref={videoRef}
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        src={videoURL}
        poster={videoThumbnail}
        className={`object-cover absolute inset-0 w-full h-full z-0 transition-opacity duration-500 ${
          isVideoReady ? "opacity-100" : "opacity-0"
        }`}
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
        className="absolute right-10 z-20 text-white bg-black/50 hover:bg-black/70 border-[3px] border-white rounded-full p-3 transition custom-cursor"
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
        {isMuted ? <GoMute size={24} /> : <GoUnmute size={24} />}
      </button>
    </div>
  );
};

export default IntroVideoMobile;
