// Animation variants for subtle fade-in (no bounce)
export const cardVariants = {
  hidden: { opacity: 0, y: 0 }, // remove vertical offset
  visible: { opacity: 1, y: 0 },
};

// Smooth and natural transition
export const ANIMATION_CONFIG = {
  duration: 0.3,
  ease: "linear" as const, // removed "easeOut" which adds slight overshoot
};

// Intersection observer config
export const INTERSECTION_CONFIG = {
  threshold: 0.2,
  rootMargin: "0px 0px -10% 0px",
  enabled: true,
};

// Motion config for one-time animation trigger
export const MOTION_CONFIG = {
  once: true, // only animate once
  amount: 0.2, // trigger when 20% of card is visible
};
