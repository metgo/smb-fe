import clsx from "clsx";
import React from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface AFieldProps {
  label: string;
  children: React.ReactNode;
  isRequired?: boolean;
}

export function AField({ label, children, isRequired = false }: AFieldProps) {
  const { textPrimary } = useThemeClasses();

  return (
    <label className="flex flex-col gap-1.5 mb-2 last:mb-0">
      <span className={clsx("text-[12.5px] font-bold", textPrimary)}>
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
