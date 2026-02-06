import { routes } from "@/lib/routes";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const IDLE_LIMIT = 60 * 60 * 1000;

export default function IdleLogout() {
  const navigate = useNavigate();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);

    idleTimer.current = setTimeout(() => {
      navigate(routes.auth, { replace: true });
      localStorage.removeItem("user_info");
      localStorage.removeItem("access_token");
    }, IDLE_LIMIT);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer(); // start timer on mount

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer),
      );
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdleTimer]);

  return null;
}
