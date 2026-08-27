import clsx from "clsx";
import { X, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface InvoicePdfModalProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export default function InvoicePdfModal({
  url,
  title,
  onClose,
}: InvoicePdfModalProps) {
  const { t } = useTranslation("payments");
  const { isDark, textPrimary } = useThemeClasses();

  // Hide the built-in PDF viewer chrome (toolbar, thumbnail sidebar,
  // scrollbar) so only the document itself shows. These are PDF open
  // parameters and must go in the URL hash, after any existing query string.
  const embedSrc = `${url}${url.includes("#") ? "&" : "#"}toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border shadow-2xl overflow-hidden",
          isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div
          className={clsx(
            "flex shrink-0 items-center justify-between border-b px-5 py-3",
            isDark ? "border-gray-700" : "border-gray-200",
          )}
        >
          <p className={clsx("truncate text-sm font-medium", textPrimary)}>
            {title || t("invoice")}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                isDark
                  ? "border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-400"
                  : "border-gray-200 text-gray-600 hover:border-teal-500 hover:text-teal-600",
              )}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("open_in_new_tab")}
            </a>
            <button
              type="button"
              onClick={onClose}
              className={clsx(
                "rounded-lg p-1.5 transition-colors",
                isDark
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-100 text-gray-500",
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <iframe
          src={embedSrc}
          className="flex-1 w-full bg-white"
          title={title || t("invoice")}
        />
      </div>
    </div>
  );
}
