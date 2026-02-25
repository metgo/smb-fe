import { useState } from "react";
import { routes } from "@/lib/routes";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, RefreshCw, Mail } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";

const SUPPORT_EMAIL = "support@metgo.app";

const ErrorUiPage = () => {
  const { isDark } = useThemeClasses();
  const { t } = useTranslation("common");

  const [hovered, setHovered] = useState(false);
  const [homeBtnHovered, setHomeBtnHovered] = useState(false);

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
            isDark ? "bg-orange-900" : "bg-orange-100"
          }`}
        />
        <div
          className={`absolute bottom-10 right-10 w-64 h-64 rounded-full blur-2xl opacity-20 transition-colors duration-500 ${
            isDark ? "bg-rose-900" : "bg-rose-100"
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
              fill={isDark ? "#2d1f0e" : "#FDE8CC"}
            />

            {/* Desk */}
            <rect
              x="60"
              y="210"
              width="210"
              height="12"
              rx="6"
              fill={isDark ? "#7c5230" : "#c8906a"}
            />
            <rect
              x="235"
              y="222"
              width="10"
              height="35"
              rx="5"
              fill={isDark ? "#7c5230" : "#c8906a"}
            />
            <rect
              x="85"
              y="222"
              width="10"
              height="35"
              rx="5"
              fill={isDark ? "#7c5230" : "#c8906a"}
            />

            {/* Monitor stand */}
            <rect
              x="148"
              y="185"
              width="14"
              height="28"
              rx="4"
              fill={isDark ? "#9ca3af" : "#d1d5db"}
            />
            <rect
              x="133"
              y="207"
              width="44"
              height="8"
              rx="4"
              fill={isDark ? "#9ca3af" : "#d1d5db"}
            />

            {/* Monitor screen */}
            <rect
              x="90"
              y="95"
              width="140"
              height="95"
              rx="10"
              fill={isDark ? "#374151" : "#f3f4f6"}
              stroke={isDark ? "#6b7280" : "#e5e7eb"}
              strokeWidth="3"
            />
            <rect
              x="90"
              y="95"
              width="140"
              height="14"
              rx="8"
              fill={isDark ? "#4b5563" : "#e5e7eb"}
            />

            {/* X mark on screen */}
            <line
              x1="135"
              y1="122"
              x2="175"
              y2="170"
              stroke="#ef4444"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1="175"
              y1="122"
              x2="135"
              y2="170"
              stroke="#ef4444"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Chair back */}
            <rect
              x="210"
              y="140"
              width="22"
              height="70"
              rx="11"
              fill={isDark ? "#d1d5db" : "#f9fafb"}
              stroke={isDark ? "#9ca3af" : "#e5e7eb"}
              strokeWidth="2"
            />

            {/* Person */}
            <path
              d="M175 150 Q185 145 195 150 L200 200 L170 200 Z"
              fill="#4ade80"
            />
            <path d="M170 198 L165 245 L185 245 L190 198 Z" fill="#3b82f6" />
            <ellipse cx="168" cy="246" rx="10" ry="5" fill="#166534" />
            <ellipse cx="183" cy="246" rx="10" ry="5" fill="#166534" />
            <circle cx="185" cy="128" r="22" fill="#fb923c" />
            <path
              d="M165 120 Q168 105 185 107 Q202 105 206 120 Q200 112 185 113 Q170 112 165 120Z"
              fill="#4c1d95"
            />
            <ellipse cx="163" cy="128" rx="5" ry="7" fill="#fb923c" />
            <path
              d="M178 160 Q165 175 145 195"
              stroke="#fb923c"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="143" cy="197" r="8" fill="#fb923c" />

            {/* Keyboard */}
            <rect
              x="110"
              y="207"
              width="55"
              height="10"
              rx="3"
              fill={isDark ? "#4b5563" : "#e5e7eb"}
            />

            {/* Plant */}
            <rect x="58" y="225" width="28" height="20" rx="4" fill="#d97706" />
            <path
              d="M72 225 Q65 195 55 185 Q70 190 72 200 Q75 190 85 183 Q78 196 72 225Z"
              fill="#22c55e"
            />

            {/* Chair base */}
            <circle
              cx="218"
              cy="248"
              r="6"
              fill={isDark ? "#6b7280" : "#9ca3af"}
            />
            <rect
              x="200"
              y="210"
              width="36"
              height="10"
              rx="5"
              fill={isDark ? "#9ca3af" : "#d1d5db"}
            />
            <rect
              x="216"
              y="218"
              width="5"
              height="30"
              rx="2"
              fill={isDark ? "#9ca3af" : "#d1d5db"}
            />
          </svg>
        </div>

        {/* Heading */}
        <h1
          className={`text-3xl font-bold tracking-tight mb-3 transition-colors duration-500 ${isDark ? "text-white" : "text-gray-800"}`}
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {t("error_title")}
        </h1>

        {/* Subtext */}
        <p
          className={`text-base leading-relaxed mb-10 transition-colors duration-500 ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {t("error_description")}
          <a
            target="_blank"
            href={`mailto:${SUPPORT_EMAIL}`}
            className={clsx(
              "underline ml-2 font-bold transition-colors duration-300",
              isDark
                ? "text-blue-300 hover:text-blue-400"
                : "text-blue-400 hover:text-blue-500",
            )}
          >
            <Mail className="w-4 h-4 mr-2 inline-block" />
            {SUPPORT_EMAIL}
          </a>
        </p>

        {/* Contact Support */}

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
              {t("go_back_home")}
            </button>
          </Link>

          {/* Reload */}
          <button
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => window.location.reload()}
            className={`px-6 py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-all duration-300 shadow-lg ${
              hovered
                ? "bg-orange-600 shadow-orange-400/40 scale-105"
                : "bg-orange-500 shadow-orange-300/30 scale-100"
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-2 inline-block" />
            {t("reload_page")}
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-10">
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

export default ErrorUiPage;
