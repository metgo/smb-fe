"use client";

const IntroVideo = () => {
  return (
    <video
      loop
      muted
      autoPlay
      playsInline
      preload="true"
      src="/videos/intro.mp4"
      className="object-cover absolute inset-0 w-full h-full z-10"
    />
  );
};

export default IntroVideo;
