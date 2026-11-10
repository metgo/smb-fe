import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface UrlPreviewProps {
  generatedUrl: string;
  readableUrl: string;
}

// Shows the generated link with separators and utm_* params highlighted.
const UrlPreview = ({ generatedUrl, readableUrl }: UrlPreviewProps) => {
  const { t } = useTranslation("utm_campaign");
  const { isDark, textTertiary, borderColor } = useThemeClasses();

  return (
    <>
      <div
        className={clsx(
          "rounded-md border p-3 text-sm break-all font-mono min-h-20",
          borderColor,
          isDark ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800",
        )}
      >
        {readableUrl ? (
          readableUrl.split(/([?&])/).map((part, i) =>
            part === "?" || part === "&" ? (
              <span key={i} className="text-teal-500">
                {part}
              </span>
            ) : part.startsWith("utm_") ? (
              <span key={i} className="text-violet-500">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )
        ) : (
          <span className={textTertiary}>{t("generated_url_empty")}</span>
        )}
      </div>
      {readableUrl && readableUrl !== generatedUrl && (
        <p className={clsx("text-[11px] mt-1.5", textTertiary)}>
          {t("decoded_note")}
        </p>
      )}
    </>
  );
};

export default UrlPreview;
