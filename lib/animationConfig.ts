// Animation variants for better performance
export const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const ANIMATION_CONFIG = {
  duration: 0.5,
  ease: "easeOut" as const,
};

export const INTERSECTION_CONFIG = {
  threshold: 0.1,
  rootMargin: "50px",
  enabled: true,
};

export const MOTION_CONFIG = {
  once: true,
  margin: "0px 0px -50px 0px",
};
