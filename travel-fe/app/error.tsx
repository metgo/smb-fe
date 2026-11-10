"use client";

import { useEffect } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { HiRefresh } from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <BiErrorCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            אופס! משהו השתבש
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-2">נתקלנו בבעיה בלתי צפויה</p>
          <p className="text-sm text-gray-500 mb-8">
            אנחנו עובדים על פתרון הבעיה. בינתיים, נסה לרענן את הדף או לחזור לדף
            הבית.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-xs font-mono text-gray-700 break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className=" custom-cursor flex-1 flex items-center justify-center gap-2 bg-black/50 hover:bg-black/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              <HiRefresh className="w-5 h-5" />
              נסה שוב
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex-1 custom-cursor flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              <AiFillHome className="w-5 h-5" />
              דף הבית
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
