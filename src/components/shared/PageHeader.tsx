import { useThemeClasses } from "@/hooks/useThemeClasses";
import { AddButton, RefreshButton } from "../btns";
import clsx from "clsx";

interface PageHeaderProps {
  title: string;
  description?: string;
  h1Gradient?: string;
  onClick: () => void;
  onRefreshClick?: () => void;
  btnLabel: string;
  isRefreshing?: boolean;
}

export default function PageHeader({
  title,
  description,
  h1Gradient,
  btnLabel,
  onClick,
  onRefreshClick,
  isRefreshing,
}: PageHeaderProps) {
  const { textSecondary, borderColor } = useThemeClasses();

  return (
    <div className={clsx("shrink-0 py-6 pb-4 border-b mb-4", borderColor)}>
      <div className="mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl mb-2 bg-clip-text ${h1Gradient}`}>
              {title}
            </h1>
            {description && <p className={textSecondary}>{description}</p>}
          </div>

          <div className="flex items-center gap-4">
            {onRefreshClick && (
              <RefreshButton
                onClick={onRefreshClick}
                isRefreshing={isRefreshing}
              />
            )}
            <AddButton label={btnLabel} handleClick={onClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
