import { routes } from "@/lib/routes";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const IDLE_LIMIT = 60 * 60 * 1000;
const LAST_ACTIVITY_KEY = "last_activity";

export default function IdleLogout() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const logout = () => {
      navigateRef.current(routes.auth, { replace: true });
      sessionStorage.removeItem("user_info");
      sessionStorage.removeItem("access_token");
      localStorage.clear();
    };

    const resetIdleTimer = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(logout, IDLE_LIMIT);
    };

    // When the tab becomes visible again, check if idle limit already passed
    // (browsers throttle/freeze setTimeout in background tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const lastActivity = parseInt(
        localStorage.getItem(LAST_ACTIVITY_KEY) || "0",
        10,
      );
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= IDLE_LIMIT) {
        logout();
      } else {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(logout, IDLE_LIMIT - elapsed);
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    document.addEventListener("visibilitychange", handleVisibilityChange);

    resetIdleTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer),
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return null;
}
