"use client";

import { GoUnmute, GoMute } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { BUCKET_URL } from "@/constant/envConstants";
import { useDeviceHeight } from "@/hooks";
import { getThumbnail } from "@/constant/images";

// Default mobile video URL
const DEFAULT_MOBILE_URL = `${BUCKET_URL}/video/intro-video-mobile.mkv`;

const IntroVideoMobile = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const { scale, group } = useDeviceHeight();

  const thumbnailJson = getThumbnail();
  const videoThumbnail = thumbnailJson?.mobile;

  // Preload video on mount
  useEffect(() => {
    // Add preload link for video
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = DEFAULT_MOBILE_URL;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoReady(true);
      // Play immediately when ready
      video.play().catch(() => {});
    };

    const handlePlaying = () => {
      setIsVideoReady(true);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);

    // Start loading immediately
    video.load();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(video);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      observer.disconnect();
    };
  }, []);

  // Sync muted state via JS (not attribute)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <div className="relative w-full h-screen max-sm:block md:hidden">
      {/* Thumbnail - shows until video starts */}
      <img
        src={videoThumbnail}
        alt="Video thumbnail"
        className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 ${
          isVideoReady ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* Video */}
      <video
        ref={videoRef}
        loop
        muted
        autoPlay
        playsInline
        preload="auto"
        src={DEFAULT_MOBILE_URL}
        poster={videoThumbnail}
        className="object-cover absolute inset-0 w-full h-full z-0"
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
