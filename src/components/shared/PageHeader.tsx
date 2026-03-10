import { useThemeClasses } from "@/hooks/useThemeClasses";
import { AddButton, RefreshButton } from "../btns";
import clsx from "clsx";

interface PageHeaderProps {
  title: string;
  description?: string;
  h1Gradient?: string;
  onClick?: () => void;
  onRefreshClick?: () => void;
  btnLabel?: string;
  isRefreshing?: boolean;
  totalCount?: number;
}

export default function PageHeader({
  title,
  description,
  h1Gradient,
  btnLabel,
  onClick,
  onRefreshClick,
  isRefreshing,
  totalCount,
}: PageHeaderProps) {
  const { textSecondary, borderColor } = useThemeClasses();

  return (
    <div className={clsx("shrink-0 pb-4 border-b mb-4", borderColor)}>
      <div className="mx-auto">
        <div className={clsx("flex items-center justify-between")}>
          <div>
            <h1 className={`text-3xl mb-2 bg-clip-text ${h1Gradient}`}>
              {title}
              {totalCount !== null && (
                <span
                  className={`text-3xl mb-2 ml-2 bg-clip-text ${h1Gradient}`}
                >
                  ({totalCount})
                </span>
              )}
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
            {btnLabel && onClick && (
              <AddButton label={btnLabel} handleClick={onClick} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
