import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Button } from "@/components/ui/button";

interface DashboardEmptyStateProps {
  message: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export default function DashboardEmptyState({
  message,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}: DashboardEmptyStateProps) {
  const { isDark } = useThemeClasses();

  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <Icon
        className={clsx(
          "w-8 h-8 mb-3",
          isDark ? "text-gray-600" : "text-gray-300",
        )}
        aria-hidden="true"
      />
      <p
        className={clsx("text-sm", isDark ? "text-gray-400" : "text-gray-500")}
      >
        {message}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
