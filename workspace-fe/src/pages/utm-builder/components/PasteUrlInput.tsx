import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardPaste } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useUtmFormStyles } from "../hooks/useUtmFormStyles";

interface PasteUrlInputProps {
  // Returns true when the form was filled, which clears the input.
  onSubmit: (value: string) => boolean;
}

const PasteUrlInput = ({ onSubmit }: PasteUrlInputProps) => {
  const { t } = useTranslation("utm_campaign");
  const { textTertiary } = useThemeClasses();
  const { inputClass } = useUtmFormStyles();
  const [value, setValue] = useState("");

  const submit = (text: string) => {
    if (onSubmit(text)) setValue("");
  };

  return (
    <div className="relative mb-2">
      <ClipboardPaste
        className={clsx(
          "absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
          textTertiary,
        )}
      />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPaste={(e) => {
          e.preventDefault();
          submit(e.clipboardData.getData("text"));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit(value);
        }}
        placeholder={t("paste_url_placeholder")}
        className={clsx(inputClass, "ps-9")}
      />
    </div>
  );
};

export default PasteUrlInput;
