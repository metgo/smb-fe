"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface MotionDialogDivProps extends HTMLMotionProps<"div"> {
  type?:
    | "fade"
    | "scale"
    | "drawer-left"
    | "drawer-right"
    | "drawer-top"
    | "drawer-bottom";
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler;
}

const animationVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
  "drawer-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "drawer-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "200%", opacity: 0 },
  },
  "drawer-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "drawer-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
};

export const MotionDialogDiv = ({
  type = "fade",
  className = "",
  children,
  onClick,
  ...rest
}: MotionDialogDivProps) => {
  const variant = animationVariants[type];

  return (
    <motion.div
      key={type}
      variants={variant}
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
