import { useRef } from "react";

const MAX_TILT_DEG = 6;

/**
 * Drives the .dm-tilt CSS hook (see src/index.css) by writing --rx/--ry
 * custom properties from pointer position, for a subtle 3D hover effect.
 * Pointer-based only; keyboard/focus-only interaction gets the flat
 * .dm-tilt:focus-within lift defined in CSS, no JS needed for that case.
 */
export function useTilt3D<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 2 * MAX_TILT_DEG;
    const rx = (0.5 - py) * 2 * MAX_TILT_DEG;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}
