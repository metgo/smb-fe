import { useThemeClasses } from "@/hooks/useThemeClasses";
import { AddButton } from "../btns";

interface PageHeaderProps {
  title: string;
  description?: string;
  h1Gradient?: string;
  onClick: () => void;
  btnLabel: string;
}

export default function PageHeader({
  title,
  description,
  h1Gradient,
  btnLabel,
  onClick,
}: PageHeaderProps) {
  const { textSecondary } = useThemeClasses();

  return (
    <div className="shrink-0 py-6 pb-4 border-b border-gray-200 dark:border-gray-800 mb-4">
      <div className="mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl mb-2 bg-clip-text ${h1Gradient}`}>
              {title}
            </h1>
            {description && <p className={textSecondary}>{description}</p>}
          </div>
          <AddButton label={btnLabel} handleClick={onClick} />
        </div>
      </div>
    </div>
  );
}
