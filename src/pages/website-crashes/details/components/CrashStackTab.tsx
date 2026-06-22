import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { IWebsiteCrash } from "@/store/api/websiteCrashApi";

export function CrashStackTab({ crash }: { crash: IWebsiteCrash }) {
  const { isDark, borderColor, bgSecondary, textSecondary } = useThemeClasses();

  if (!crash.error?.stack) {
    return (
      <p className={clsx("text-sm py-10 text-center", textSecondary)}>
        No stack trace available
      </p>
    );
  }

  return (
    <div
      className={clsx(
        "rounded-xl border overflow-hidden",
        borderColor,
        bgSecondary,
      )}
    >
      <pre
        className={clsx(
          "p-5 text-xs font-mono whitespace-pre-wrap break-all leading-relaxed overflow-x-auto",
          isDark ? "text-red-300" : "text-red-700",
        )}
      >
        {crash.error.stack}
      </pre>
    </div>
  );
}
