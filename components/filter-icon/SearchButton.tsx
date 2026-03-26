import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useState } from "react";

type SunsetVariant =
  | "continuous"
  | "slow"
  | "fast"
  | "bounce"
  | "pulse"
  | "black";
interface SearchButtonProps {
  activeFiltersCount?: number;
  variant?: SunsetVariant;
  size?: number;
  onClick: () => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (v: boolean) => void;
}

const BASE_SIZE = 96;

const scale = (value: number, size: number) => (value / BASE_SIZE) * size;

const getAnimationConfig = (variant: SunsetVariant) => {
  switch (variant) {
    case "slow":
      return { duration: 8, repeat: Infinity, ease: "easeInOut" as const };
    case "fast":
      return { duration: 2, repeat: Infinity, ease: "easeInOut" as const };
    case "bounce":
      return {
        duration: 3,
        repeat: Infinity,
        ease: [0.68, -0.55, 0.265, 1.55] as const,
      };
    case "pulse":
      return { duration: 5, repeat: Infinity, ease: "easeInOut" as const };
    case "black":
      return { duration: 4, repeat: Infinity, ease: "linear" as const };
    case "continuous":
    default:
      return { duration: 4, repeat: Infinity, ease: "linear" as const };
  }
};

const gradientColors = [
  "#0d9488", // teal-600
  "#0f766e", // teal-700
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#0891b2", // cyan-600
  "#0d9488", // teal-600
];

function FilterBadge({ count, size }: { count: number; size: number }) {
  return (
    <motion.div
      // onClick={onClick}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
      className="absolute z-10"
      style={{
        top: scale(-4, size),
        right: scale(-4, size),
      }}
    >
      <div
        className="flex items-center justify-center rounded-full border-2 border-white"
        style={{
          width: scale(28, size),
          height: scale(28, size),
          background: "linear-gradient(135deg, #ef4444, #e11d48)",
        }}
      >
        <span
          className="text-white font-bold"
          style={{ fontSize: scale(13, size), lineHeight: 1 }}
        >
          {count}
        </span>
      </div>
    </motion.div>
  );
}

export const SearchButton = ({
  activeFiltersCount = 0,
  variant = "continuous",
  onClick,
  size = 96,
  isFilterOpen,
  setIsFilterOpen,
}: SearchButtonProps) => {
  const config = getAnimationConfig(variant);
  // const categorySites = await getAllCategorySites();
  // console.log("🚀 ~ SearchButton ~ categorySites:", categorySites)

  const buttonScale = scrollY > 100 ? 0.8 : 1;
  // Handle filter toggle with scroll to feed
  const handleFilterToggle = () => {
    const newState = !isFilterOpen;
    setIsFilterOpen(newState);

    // DON'T prevent body scroll when filter is open on mobile - we want to keep feed scrollable
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // On mobile, don't lock body scroll anymore
      // This allows the feed to remain scrollable behind the half-screen filter
    }

    // If opening filter, scroll to feed (main content) on desktop only
    if (newState && !isMobile) {
      setTimeout(() => {
        const mainElement = document.querySelector("main");
        if (mainElement) {
          const offset = 100; // Small offset from top
          const elementPosition = mainElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          scale: { type: "spring", stiffness: 200, damping: 20 },
          opacity: { delay: 0.3, type: "spring", stiffness: 260, damping: 20 },
        }}
        style={{ pointerEvents: "auto" }}
      >
        <button
          onClick={onClick}
          className="relative p-0 border-0 bg-transparent cursor-pointer"
          style={{ width: size, height: size }}
        >
          <div className="relative w-full h-full">
            {/* Pulsing ring 1 */}
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: "#0d9488" }}
            />

            {/* Pulsing ring 2 */}
            <motion.div
              animate={{ scale: [1, 1.55, 1], opacity: [0.2, 0, 0.2] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.7,
              }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: "#14b8a6" }}
            />

            {/* Animated color background */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                backgroundColor: variant === "black" ? "#000" : gradientColors,
              }}
              transition={config}
            />

            {/* Shine sweep */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full overflow-hidden"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
                }}
              />
            </motion.div>

            {/* White outer ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: `${scale(3, size)}px solid rgba(255,255,255,0.9)`,
              }}
            />

            {/* Inner shadow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: "inset 0 2px 8px rgba(0,0,0,0.25)" }}
            />

            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isFilterOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -180, opacity: 0, scale: 0.3 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 180, opacity: 0, scale: 0.3 }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <X
                      style={{
                        width: scale(40, size),
                        height: scale(40, size),
                        color: "white",
                      }}
                      strokeWidth={3.5}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search"
                    initial={{ rotate: 180, opacity: 0, scale: 0.3 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -180, opacity: 0, scale: 0.3 }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <Search
                      style={{
                        width: scale(38, size),
                        height: scale(38, size),
                        color: "white",
                      }}
                      strokeWidth={2.5}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter count badge */}
            <AnimatePresence>
              {activeFiltersCount > 0 && (
                <FilterBadge count={activeFiltersCount} size={size} />
              )}
            </AnimatePresence>
          </div>
        </button>
      </motion.div>
    </div>
  );
};
