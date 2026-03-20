"use client";

import { GoUnmute, GoMute } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { BUCKET_URL } from "@/constant/envConstants";
import { useDeviceHeight } from "@/hooks";
import { getThumbnail } from "@/constant/images";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";

// Default video URLs
const DEFAULT_DESKTOP_URL = `${BUCKET_URL}/video/intro-video.mp4`;
const DEFAULT_MOBILE_URL = `${BUCKET_URL}/video/intro-video-mobile.mkv`;

// Detect mobile on client side
const getIsMobile = () =>
  typeof window !== "undefined" && window.innerWidth < 768;

const IntroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Initialize with correct URL based on device
  const isMobileDevice = getIsMobile();
  const currentUrlRef = useRef<string>(
    isMobileDevice ? DEFAULT_MOBILE_URL : DEFAULT_DESKTOP_URL,
  );

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const { scale, group } = useDeviceHeight();

  // Detect mobile on client side only
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Thumbnail
  const thumbnailJson = getThumbnail();
  const videoThumbnail = isMobile
    ? thumbnailJson?.mobile
    : thumbnailJson?.desktop;

  // Video setup - runs only once
  useEffect(() => {
    const video = videoRef.current;
    if (!video || initializedRef.current) return;

    initializedRef.current = true;
    video.muted = isMuted;

    const handleCanPlay = () => {
      setIsVideoReady(true);
      video.play().catch(() => {});
    };

    const handleError = () => {
      setVideoError(true);
      setIsVideoReady(true);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // Intersection Observer: pause/play when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(video);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      observer.disconnect();
    };
  }, []);

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Thumbnail - shows until video starts */}
      <img
        src={videoThumbnail}
        alt="Video thumbnail"
        className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 ${
          isVideoReady && !videoError
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        }`}
      />

      {/* Video - loads immediately with default URL */}
      <video
        ref={videoRef}
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        src={currentUrlRef.current}
        poster={videoThumbnail}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${
          isVideoReady && !videoError ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Mute/Unmute Button */}
      {isVideoReady && !videoError && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            sendGAEvent(triggerName.clickToAudioBtn, {
              action: isMuted ? "unmute" : "mute",
            });
            toggleMute();
          }}
          className="absolute right-10 z-20 text-white bg-black/50 hover:bg-black/70 border-[3px] border-white rounded-full p-3 transition custom-cursor"
          aria-label={isMuted ? "Unmute" : "Mute"}
          style={{
            bottom: isMobile
              ? group === "mediumMobile"
                ? 166 * scale
                : group === "largeMobile"
                  ? 100 * scale
                  : 90 * scale
              : 40,
          }}
        >
          {isMuted ? <GoMute size={24} /> : <GoUnmute size={24} />}
        </button>
      )}
    </div>
  );
};

export default IntroVideo;
