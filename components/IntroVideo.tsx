"use client";

import { GoUnmute, GoMute } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { BUCKET_URL } from "@/constant/envConstants";
import useGeneralStore from "@/stores/generalStore";
import { useDeviceHeight } from "@/hooks";
import { getThumbnail } from "@/constant/images";

const IntroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { siteInfo } = useGeneralStore();
  const { scale, group } = useDeviceHeight();

  // Detect mobile/desktop after hydration
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Thumbnail
  const thumbnailJson = getThumbnail();
  const videoThumbnail = isMobile
    ? thumbnailJson.mobile
    : thumbnailJson.desktop;

  // Video URLs
  const videoURLDesktop =
    siteInfo?.desktopHomeVideos?.[0]?.url ??
    `${BUCKET_URL}/video/intro-video.mp4`;
  const videoURLMobile =
    siteInfo?.mobileHomeVideos?.[0]?.url ??
    `${BUCKET_URL}/video/intro-video-mobile.mkv`;
  const videoURL = isMobile ? videoURLMobile : videoURLDesktop;

  const [resolvedVideoURL, setResolvedVideoURL] = useState(videoURL);

  // Update video source when device type or siteInfo changes
  useEffect(() => {
    setResolvedVideoURL(videoURL);
  }, [isMobile, videoURL]);

  // Main video setup: play, load, intersection observer
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsVideoReady(false);
    setVideoError(false);
    video.muted = isMuted;

    const handleCanPlayThrough = () => {
      setIsVideoReady(true);
      video.play().catch((err) => console.warn("Autoplay failed:", err));
    };

    const handleCanPlay = () => {
      if (!isVideoReady) {
        setIsVideoReady(true);
        video.play().catch(() => {});
      }
    };

    const handleError = () => {
      console.error("Video failed to load");
      setVideoError(true);
      setIsVideoReady(true);
    };

    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // Intersection Observer: pause/play when 50% visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(video);

    video.load();

    return () => {
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      observer.disconnect();
    };
  }, [resolvedVideoURL]);

  // Sync muted state separately (does not reload video)
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Thumbnail */}
      <img
        src={videoThumbnail}
        alt="Video thumbnail"
        className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-700 ${
          isVideoReady && !videoError ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Loading Spinner */}
      {!isVideoReady && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        src={resolvedVideoURL}
        poster={videoThumbnail}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${
          isVideoReady && !videoError ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Mute/Unmute Button */}
      {isVideoReady && !videoError && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMute();
          }}
          className="absolute right-10 z-30 text-white bg-black/50 hover:bg-black/70 border-[3px] border-white rounded-full p-3 transition custom-cursor"
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
