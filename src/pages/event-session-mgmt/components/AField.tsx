import clsx from "clsx";
import React from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface AFieldProps {
  label: string;
  children: React.ReactNode;
}

export function AField({ label, children }: AFieldProps) {
  const { textPrimary } = useThemeClasses();

  return (
    <label className="flex flex-col gap-1.5 mb-3.5 last:mb-0">
      <span className={clsx("text-[12.5px] font-bold", textPrimary)}>
        {label}
      </span>
      {children}
    </label>
  );
}
