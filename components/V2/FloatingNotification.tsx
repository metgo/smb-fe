import { motion, AnimatePresence, useAnimation } from "motion/react";
import { Search, X } from "lucide-react";
import { useEffect } from "react";

interface FloatingNotificationProps {
  isOpen: boolean;
  onClick: () => void;
  isVisible: boolean;
  scrollY: number;
  showWeather: boolean;
  setShowWeather: (value: boolean) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  selectedFilters: string[];
  activeFiltersCount: number;
}

export function FloatingNotification({
  isOpen,
  onClick,
  isVisible,
  scrollY,
  darkMode,
  activeFiltersCount,
}: FloatingNotificationProps) {
  const controls = useAnimation();

  useEffect(() => {
    // Fast elegant spin animation on mount - only once
    const animate = async () => {
      await controls.start({
        rotate: 1080, // 3 full rotations
        opacity: 1,
        transition: {
          duration: 1.2,
          ease: [0.34, 1.56, 0.64, 1], // Fast bounce easing
        },
      });
      // Then settle to 0
      await controls.start({
        rotate: 0,
        transition: {
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        },
      });
    };
    if (isVisible) {
      animate();
    }
  }, [controls, isVisible]); // Run when visible

  // Calculate button scale based on scroll
  const buttonScale = scrollY > 100 ? 0.8 : 1;

  if (!isVisible) return null;

  return (
    <>
      {/* Main Search Button */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[60] pb-safe pointer-events-auto">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: buttonScale,
            opacity: 1,
          }}
          transition={{
            scale: { type: "spring", stiffness: 200, damping: 20 },
            opacity: {
              delay: 0.3,
              type: "spring",
              stiffness: 260,
              damping: 20,
            },
          }}
          style={{ pointerEvents: "auto" }}
        >
          {/* Main Search Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="relative cursor-pointer"
            style={{ pointerEvents: "auto" }}
          >
            {/* Pulsing Rings - softened */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute inset-0 bg-teal-500 rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.7,
              }}
              className="absolute inset-0 bg-teal-400 rounded-full"
            />

            {/* Main Circle */}
            <motion.div
              animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-24 h-24 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full shadow-2xl flex items-center justify-center border-3 sm:border-4 border-white transition-all duration-300 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600"
            >
              {/* Shine Effect */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent" />
              </motion.div>

              {/* Icon */}
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -180, opacity: 0, scale: 0.3 }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      rotate: 180,
                      opacity: 0,
                      scale: 0.3,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="relative z-10"
                  >
                    <X
                      className="w-12 h-12 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white"
                      strokeWidth={3.5}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search"
                    initial={{
                      rotate: 180,
                      opacity: 0,
                      scale: 0.3,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                    }}
                    exit={{
                      rotate: -180,
                      opacity: 0,
                      scale: 0.3,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="relative z-10"
                  >
                    <Search
                      className="w-12 h-12 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inner Glow */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]" />
            </motion.div>

            {/* Notification Badge - Only show if filters are active */}
            <AnimatePresence>
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                  }}
                  className="absolute -top-1 -right-1 z-10"
                >
                  <div className="relative">
                    {/* Badge */}
                    <div className="relative w-8 h-8 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg border-2 sm:border-3 border-white">
                      <span className="text-white text-sm sm:text-sm font-bold">
                        {activeFiltersCount}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
