import clsx from "clsx";
import { AddButton, RefreshButton } from "../btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";

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
    <div className={clsx("shrink-0 pb-4 border-b mb-4 z-5", borderColor)}>
      <div className="mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1
              className={`text-xl md:text-3xl mb-1 md:mb-2 bg-clip-text ${h1Gradient}`}
            >
              {title}
              <span
                className={`text-2xl md:text-3xl ml-2 bg-clip-text ${h1Gradient}`}
              >
                {totalCount ? `(${totalCount})` : ""}
              </span>
            </h1>

            {description && (
              <p className={clsx("text-sm md:text-base", textSecondary)}>
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
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
