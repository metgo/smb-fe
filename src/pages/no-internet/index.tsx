import { useState, useEffect } from "react";
import { Wifi, RefreshCw, Home, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const NoInternetPage = () => {
  const { isDark } = useThemeClasses();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hovered, setHovered] = useState(false);
  const [homeBtnHovered, setHomeBtnHovered] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-500 ${
        isDark ? "bg-gray-950" : "bg-white"
      }`}
    >
      {/* Ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full blur-3xl opacity-30 transition-colors duration-500 ${
            isDark ? "bg-blue-900" : "bg-blue-100"
          }`}
        />
        <div
          className={`absolute bottom-10 right-10 w-64 h-64 rounded-full blur-2xl opacity-20 transition-colors duration-500 ${
            isDark ? "bg-cyan-900" : "bg-cyan-100"
          }`}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Illustration */}
        <div className="mb-10 relative">
          <svg
            viewBox="0 0 320 280"
            className="w-72 h-64"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Blob background */}
            <path
              d="M160 20 C220 10, 290 60, 295 130 C300 200, 250 255, 180 260 C110 265, 50 220, 30 155 C10 90, 60 30, 160 20Z"
              fill={isDark ? "#1e3a5f" : "#E0F2FE"}
            />

            {/* Cloud */}
            <ellipse
              cx="160"
              cy="80"
              rx="50"
              ry="30"
              fill={isDark ? "#475569" : "#E5E7EB"}
            />
            <ellipse
              cx="130"
              cy="90"
              rx="35"
              ry="25"
              fill={isDark ? "#475569" : "#E5E7EB"}
            />
            <ellipse
              cx="190"
              cy="90"
              rx="35"
              ry="25"
              fill={isDark ? "#475569" : "#E5E7EB"}
            />
            <ellipse
              cx="160"
              cy="95"
              rx="40"
              ry="20"
              fill={isDark ? "#475569" : "#E5E7EB"}
            />

            {/* WiFi signal waves (broken) */}
            <path
              d="M140 130 Q160 110 180 130"
              stroke={isOnline ? "#22c55e" : "#ef4444"}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M125 145 Q160 115 195 145"
              stroke={isOnline ? "#22c55e" : "#ef4444"}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M110 160 Q160 120 210 160"
              stroke={isOnline ? "#22c55e" : "#ef4444"}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* X mark over WiFi */}
            {!isOnline && (
              <>
                <line
                  x1="145"
                  y1="125"
                  x2="175"
                  y2="155"
                  stroke="#ef4444"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="175"
                  y1="125"
                  x2="145"
                  y2="155"
                  stroke="#ef4444"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Device (laptop) */}
            <rect
              x="90"
              y="175"
              width="140"
              height="85"
              rx="8"
              fill={isDark ? "#374151" : "#f3f4f6"}
              stroke={isDark ? "#6b7280" : "#e5e7eb"}
              strokeWidth="3"
            />
            <rect
              x="95"
              y="180"
              width="130"
              height="60"
              rx="4"
              fill={isDark ? "#1f2937" : "#ffffff"}
            />

            {/* Screen content (error message) */}
            <rect
              x="105"
              y="195"
              width="40"
              height="4"
              rx="2"
              fill={isDark ? "#4b5563" : "#d1d5db"}
            />
            <rect
              x="105"
              y="205"
              width="70"
              height="4"
              rx="2"
              fill={isDark ? "#4b5563" : "#d1d5db"}
            />
            <rect
              x="105"
              y="215"
              width="50"
              height="4"
              rx="2"
              fill={isDark ? "#4b5563" : "#d1d5db"}
            />

            {/* Laptop base */}
            <rect
              x="80"
              y="255"
              width="160"
              height="8"
              rx="4"
              fill={isDark ? "#4b5563" : "#9ca3af"}
            />

            {/* Connection status indicator */}
            <circle
              cx="250"
              cy="80"
              r="12"
              fill={isOnline ? "#22c55e" : "#ef4444"}
            />
            <path
              d="M246 80 L254 80 M250 76 L250 84"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Status Badge */}
        <div
          className={`mb-6 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors duration-500 ${
            isOnline
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          {isOnline ? "Connection Restored" : "No Internet Connection"}
        </div>

        {/* Heading */}
        <h1
          className={`text-3xl font-bold tracking-tight mb-3 transition-colors duration-500 ${isDark ? "text-white" : "text-gray-800"}`}
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {isOnline ? "You're Back Online!" : "No Internet Connection"}
        </h1>

        {/* Subtext */}
        <p
          className={`text-base leading-relaxed mb-10 transition-colors duration-500 ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {isOnline
            ? "Your internet connection has been restored. Redirecting you back..."
            : "Please check your internet connection. We'll automatically redirect you when your connection is restored."}
        </p>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Go Home */}
          <Link to={routes.dashboard}>
            <button
              onMouseEnter={() => setHomeBtnHovered(true)}
              onMouseLeave={() => setHomeBtnHovered(false)}
              className={`px-6 py-3 rounded-full border font-semibold text-sm tracking-wide transition-all duration-300 shadow-lg ${
                homeBtnHovered
                  ? "border-blue-600 shadow-blue-400/40 scale-105"
                  : "border-blue-500 shadow-blue-300/30 scale-100"
              }`}
            >
              <Home className="w-4 h-4 inline-block mr-2" />
              Go to Dashboard
            </button>
          </Link>

          {/* Retry Connection */}
          {!isOnline && (
            <button
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={handleRetry}
              className={`px-6 py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-all duration-300 shadow-lg ${
                hovered
                  ? "bg-blue-600 shadow-blue-400/40 scale-105"
                  : "bg-blue-500 shadow-blue-300/30 scale-100"
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-2 inline-block" />
              Retry Connection
            </button>
          )}
        </div>

        {/* Connection info */}
        <div
          className={`mt-10 text-sm transition-colors duration-500 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Wifi
              className={`w-4 h-4 ${isOnline ? "text-green-500" : "text-red-500"}`}
            />
            <span>
              Status:{" "}
              <span className={isOnline ? "text-green-500" : "text-red-500"}>
                {isOnline ? "Connected" : "Disconnected"}
              </span>
            </span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
              style={{
                animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
};

export default NoInternetPage;
