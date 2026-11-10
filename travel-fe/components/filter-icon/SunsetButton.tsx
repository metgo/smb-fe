import svgPaths from "./svg-ytpub2r2yg";
import { motion } from "framer-motion";

type SunsetVariant =
  | "continuous"
  | "slow"
  | "fast"
  | "bounce"
  | "pulse"
  | "black";

interface SunsetButtonProps {
  variant: SunsetVariant;
  onClick?: () => void;
  appliedFilterCount: number;
  size?: number;
}

const BASE_SIZE = 84;

const scale = (value: number, size: number) => (value / BASE_SIZE) * size;

function Results({
  appliedFilterCount,
  size,
}: {
  appliedFilterCount?: number;
  size: number;
}) {
  return (
    <div
      className="absolute bg-[#28c268] rounded-full flex items-center justify-center"
      style={{
        width: scale(25, size),
        height: scale(25, size),
        left: scale(59, size),
        top: scale(-7, size),
      }}
    >
      <p
        className="text-white font-bold"
        style={{
          fontSize: scale(16, size),
          lineHeight: 1,
        }}
      >
        {appliedFilterCount}
      </p>

      <div
        aria-hidden
        className="absolute border-2 border-white rounded-full inset-[-2px]"
      />
    </div>
  );
}

const getAnimationConfig = (variant: any) => {
  switch (variant) {
    case "continuous":
      return { duration: 4, repeat: Infinity, ease: "linear" as const };
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
      return {
        duration: 4,
        repeat: Infinity,
        ease: "linear" as const,
        repeatType: "loop" as const,
      };
    default:
      return { duration: 4, repeat: Infinity, ease: "linear" as const };
  }
};
export function SunsetButton({
  variant,
  onClick,
  appliedFilterCount,
  size = 84, // 👈 default
}: SunsetButtonProps) {
  const config = getAnimationConfig(variant);

  const skyColors = [
    "#87CEEB",
    "#9DD4EE",
    "#B3DCF1",
    "#C9E4F4",
    "#DFF0F7",
    "#F0F8E8",
    "#FFFACD",
    "#FFE87C",
    "#FFD966",
    "#FFCA50",
    "#FFBB3A",
    "#FFAC24",
    "#FF9D0E",
    "#FF8C00",
    "#FF7A00",
    "#FF6800",
    "#FF5500",
  ];

  return (
    <button
      onClick={onClick}
      className="relative p-0 border-0"
      style={{
        width: size,
        height: size,
      }}
    >
      <div className="relative w-full h-full">
        {/* Outer circle */}
        <svg viewBox="0 0 84 84" className="w-full h-full">
          <circle cx="42" cy="42" r="42" fill="white" fillOpacity="0.95" />
        </svg>

        {/* Animated sky */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            backgroundColor: variant === "black" ? "#000" : skyColors,
          }}
          transition={config}
        >
          <svg viewBox="0 0 84 84" className="w-full h-full">
            <motion.path
              d={svgPaths.p1db8f000}
              fill="currentColor"
              animate={{
                color: variant === "black" ? "#000" : skyColors,
              }}
              transition={config}
            />
            <path d={svgPaths.p2bbd8e80} fill="white" />
          </svg>
        </motion.div>

        <motion.div
          style={{
            width: scale(25.846, size),
            left: 0,
            top: 0,
          }}
          className="absolute"
          animate={{
            x: [
              scale(59, size),
              scale(47, size),
              scale(32, size),
              scale(18, size),
              scale(5, size),
            ],
            y: [
              scale(18, size),
              scale(12, size),
              scale(10, size),
              scale(15, size),
              scale(32, size),
            ],
          }}
          transition={config}
        >
          <svg viewBox="0 0 25.8462 25.8462">
            <path d={svgPaths.p1e0d7580} fill="white" />
          </svg>
        </motion.div>

        {/* ⭐ Small star */}
        <motion.div
          style={{
            width: scale(12.923, size),
            left: 0,
            top: 0,
          }}
          className="absolute"
          animate={{
            x: [
              scale(59, size),
              scale(47, size),
              scale(32, size),
              scale(18, size),
              scale(5, size),
            ],
            y: [
              scale(18, size),
              scale(12, size),
              scale(10, size),
              scale(15, size),
              scale(32, size),
            ],
          }}
          transition={{ ...config, delay: 0.5 }}
        >
          <svg viewBox="0 0 12.9231 12.9231">
            <path d={svgPaths.pf9cdbc0} fill="white" />
          </svg>
        </motion.div>

        {appliedFilterCount > 0 && (
          <Results appliedFilterCount={appliedFilterCount} size={size} />
        )}
      </div>
    </button>
  );
}
