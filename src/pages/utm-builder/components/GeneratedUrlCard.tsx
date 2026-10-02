import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Check, Copy, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import PasteUrlInput from "./PasteUrlInput";
import UrlPreview from "./UrlPreview";

interface GeneratedUrlCardProps {
  generatedUrl: string;
  readableUrl: string;
  missingRequired: string[];
  canGenerate: boolean;
  onPasteUrl: (value: string) => boolean;
}

const GeneratedUrlCard = ({
  generatedUrl,
  readableUrl,
  missingRequired,
  canGenerate,
  onPasteUrl,
}: GeneratedUrlCardProps) => {
  const { t } = useTranslation("utm_campaign");
  const { isDark, cardClasses, textPrimary, textSecondary, borderColor } =
    useThemeClasses();
  const { copiedId, copyToClipboard } = useCopyToClipboard();

  return (
    <div className={clsx("rounded-xl p-2 shrink-0", cardClasses)}>
      <div className="flex items-center flex-wrap gap-2 ">
        <h2 className={clsx("text-lg font-semibold mb-3", textPrimary)}>
          {t("generated_url_title")}
        </h2>

        {missingRequired.length > 0 && (
          <p
            className={clsx(
              "text-xs mb-2 px-2 rounded-md",
              isDark
                ? "bg-amber-500/10 text-amber-300"
                : "bg-amber-50 text-amber-700",
            )}
          >
            {t("still_needed", { fields: missingRequired.join(", ") })}
          </p>
        )}
      </div>

      <PasteUrlInput onSubmit={onPasteUrl} />

      <UrlPreview generatedUrl={generatedUrl} readableUrl={readableUrl} />

      <div className="flex items-center gap-2 mt-3">
        <Button
          type="button"
          onClick={() => copyToClipboard(generatedUrl, "preview")}
          disabled={!canGenerate}
          className="gap-2"
        >
          {copiedId === "preview" ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {t("copy_link")}
        </Button>
        {canGenerate && (
          <a
            href={generatedUrl}
            target="_blank"
            rel="noreferrer"
            className={clsx(
              "inline-flex items-center gap-1.5 text-sm px-3 h-9 rounded-md border transition-colors",
              borderColor,
              textSecondary,
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-50",
            )}
          >
            <ExternalLink className="w-4 h-4" />
            {t("open")}
          </a>
        )}
      </div>
    </div>
  );
};

export default GeneratedUrlCard;
