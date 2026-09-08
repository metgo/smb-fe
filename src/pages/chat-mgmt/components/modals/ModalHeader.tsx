import clsx from "clsx";
import React from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

// WhatsApp-style Modal Header
export const ModalHeader: React.FC<{
  title: string;
}> = ({ title }) => {
  const { bgPrimary, textPrimary, borderColor } = useThemeClasses();
  return (
    <div
      className={clsx(
        "flex items-center justify-between px-4 py-3 border-b",
        bgPrimary,
        borderColor,
      )}
    >
      <h2 className={clsx("text-base font-semibold", textPrimary)}>{title}</h2>
    </div>
  );
};
