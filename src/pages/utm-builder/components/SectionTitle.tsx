import clsx from "clsx";
import type { ReactNode } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

const SectionTitle = ({ children }: { children: ReactNode }) => {
  const { textTertiary } = useThemeClasses();
  return (
    <h3
      className={clsx(
        "text-[11px] font-semibold uppercase tracking-wider mb-3",
        textTertiary,
      )}
    >
      {children}
    </h3>
  );
};

export default SectionTitle;
