"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg p-8 text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6"
          >
            <AlertCircle className="w-10 h-10 text-red-500" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mb-3"
          >
            אופס! משהו השתבש
          </motion.h1>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-600 mb-2">נתקלנו בבעיה בלתי צפויה</p>
            <p className="text-sm text-gray-500 mb-8">
              אנחנו עובדים על פתרון הבעיה. בינתיים, נסה לרענן את הדף או לחזור
              לדף הבית.
            </p>
          </motion.div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6 p-4 bg-gray-50 rounded-2xl text-left"
            >
              <p className="text-xs font-mono text-gray-700 break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-400 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              onClick={reset}
              whileTap={{ scale: 0.95 }}
              className="custom-cursor flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              נסה שוב
            </motion.button>
            <motion.button
              onClick={() => (window.location.href = "/")}
              whileTap={{ scale: 0.95 }}
              className="custom-cursor flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              דף הבית
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
