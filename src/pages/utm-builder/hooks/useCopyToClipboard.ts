import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// Copies text and remembers which item was copied for 2s, so the caller can
// swap its copy icon for a check mark.
export const useCopyToClipboard = () => {
  const { t } = useTranslation("utm_campaign");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success(t("toast_copied"));
      setTimeout(
        () => setCopiedId((curr) => (curr === id ? null : curr)),
        2000,
      );
    } catch {
      toast.error(t("toast_copy_failed"));
    }
  };

  return { copiedId, copyToClipboard };
};
