import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { useAppSelector } from "@/hooks/hooks";

interface InfoTooltipProps {
  content: string;
  title?: string;
}

export default function InfoTooltip({ content, title }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isRTL } = useAppSelector((state) => state.settings);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
        aria-label="Information"
        type="button"
      >
        <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip */}
          <div
            className={`absolute top-0 z-50 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 ${
              isRTL ? "left-0 ml-2" : "right-0 mr-2"
            }`}
            style={{ marginTop: "-0.5rem" }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              {title && (
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {title}
                </h4>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
                aria-label="Close"
                type="button"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {content}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
