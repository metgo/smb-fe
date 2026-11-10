import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  onProgressDone,
  onProgressStart,
  progressDone,
  progressStart,
} from "@/lib/progress";

// Patch history.pushState once so programmatic navigation triggers the bar
if (typeof window !== "undefined" && !(window as any).__routerProgressPatched) {
  (window as any).__routerProgressPatched = true;

  const isHashOnly = (url: string | URL | null | undefined): boolean => {
    if (!url) return false;
    const s = String(url);
    if (s.startsWith("#")) return true;
    try {
      const next = new URL(s, window.location.href);
      return next.pathname === window.location.pathname;
    } catch {
      return false;
    }
  };

  const origPush = window.history.pushState.bind(window.history);
  window.history.pushState = (...args) => {
    if (!isHashOnly(args[2])) progressStart();
    return origPush(...args);
  };

  // Back / forward navigation — skip if only the hash changed
  let prevPathname = window.location.pathname;
  window.addEventListener("popstate", () => {
    if (window.location.pathname !== prevPathname) progressStart();
    prevPathname = window.location.pathname;
  });
}

type Phase = "idle" | "active" | "done";

const RouterProgressBar = () => {
  const location = useLocation();
  const [phase, setPhase] = useState<Phase>("idle");
  const [width, setWidth] = useState(0);
  const refs = useRef<{
    ticker?: ReturnType<typeof setInterval>;
    hide?: ReturnType<typeof setTimeout>;
  }>({});

  const activate = () => {
    clearInterval(refs.current.ticker);
    clearTimeout(refs.current.hide);
    setPhase("active");
    setWidth(0);

    requestAnimationFrame(() => {
      setWidth(8);
      refs.current.ticker = setInterval(() => {
        setWidth((w) => {
          if (w >= 85) {
            clearInterval(refs.current.ticker);
            return w;
          }
          return Math.min(85, w + (85 - w) * 0.1);
        });
      }, 200);
    });
  };

  const finish = () => {
    clearInterval(refs.current.ticker);
    setPhase("done");
    setWidth(100);
    refs.current.hide = setTimeout(() => setPhase("idle"), 600);
  };

  useEffect(() => {
    const offStart = onProgressStart(activate);
    const offDone = onProgressDone(finish);
    return () => {
      offStart();
      offDone();
      clearInterval(refs.current.ticker);
      clearTimeout(refs.current.hide);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Complete progress when the route actually changes
  useEffect(() => {
    progressDone();
  }, [location.pathname]);

  if (phase === "idle") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: "none",
        height: 3,
        width: `${width}%`,
        background: "linear-gradient(90deg, #facc15, #ef4444, #16a34a)",
        boxShadow: "0 0 12px rgba(239,68,68,0.6), 0 0 5px rgba(239,68,68,0.4)",
        borderRadius: "0 2px 2px 0",
        opacity: phase === "done" ? 0 : 1,
        transition:
          phase === "done"
            ? "width 150ms ease-out, opacity 450ms ease 150ms"
            : width <= 8
              ? "none"
              : "width 200ms linear",
      }}
    />
  );
};

export default RouterProgressBar;
