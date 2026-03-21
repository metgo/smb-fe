"use client";

import { GoUnmute, GoMute } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { BUCKET_URL } from "@/constant/envConstants";
import { useDeviceHeight } from "@/hooks";
import { getThumbnail } from "@/constant/images";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";

// Video URLs
const DESKTOP_VIDEO_URL = `${BUCKET_URL}/video/intro-video.mp4`;
const MOBILE_VIDEO_URL = `${BUCKET_URL}/video/intro-video-mobile.mkv`;

interface IntroVideoProps {
  isMobile: boolean;
}

const IntroVideo = ({ isMobile }: IntroVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const { scale, group } = useDeviceHeight();

  const thumbnailJson = getThumbnail();
  const videoThumbnail = isMobile
    ? thumbnailJson?.mobile
    : thumbnailJson?.desktop;

  // Video URL is determined by server-side detection
  const videoUrl = isMobile ? MOBILE_VIDEO_URL : DESKTOP_VIDEO_URL;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoReady(true);
    };

    const handlePlaying = () => {
      setIsVideoReady(true);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);

    // Try to play (autoPlay may be blocked by browser)
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
    };
  }, []);

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
        src={videoUrl}
        poster={videoThumbnail}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Mute/Unmute Button */}
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
    </div>
  );
};

export default IntroVideo;
