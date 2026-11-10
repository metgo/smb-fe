import { useRef } from "react";
import clsx from "clsx";
import { useDrag, useDrop } from "react-dnd";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";

const DRAG_TYPE = "DASHBOARD_MOCK_SECTION";

interface DragItem {
  id: string;
  index: number;
}

interface ReorderableSectionProps {
  id: string;
  index: number;
  label: string;
  isCustomizing: boolean;
  isFirst: boolean;
  isLast: boolean;
  isHidden: boolean;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  children: React.ReactNode;
}

export default function ReorderableSection({
  id,
  index,
  label,
  isCustomizing,
  isFirst,
  isLast,
  isHidden,
  onMove,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  children,
}: ReorderableSectionProps) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { id, index },
    canDrag: isCustomizing,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop<DragItem>({
    accept: DRAG_TYPE,
    hover: (item) => {
      if (!ref.current || item.index === index) return;
      onMove(item.index, index);
      item.index = index;
    },
  });

  const dragDropRef = (node: HTMLDivElement | null) => {
    ref.current = node;
    drag(drop(node));
  };

  if (!isCustomizing) {
    if (isHidden) return null;
    return <div>{children}</div>;
  }

  return (
    <div
      ref={dragDropRef}
      className={clsx(
        "relative rounded-3xl transition-all duration-200",
        "ring-2 ring-offset-4",
        isHidden ? "ring-gray-400/50" : "ring-teal-500/70",
        isDark ? "ring-offset-gray-950" : "ring-offset-gray-50",
        isDragging ? "opacity-50 scale-[0.99]" : "opacity-100 scale-100",
      )}
    >
      <div
        className={clsx(
          "dm-glass absolute -top-4 left-4 z-20 flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3 shadow-lg",
          isDark ? "dm-glass--dark" : "",
        )}
      >
        <span
          className={clsx(
            "flex items-center gap-1.5 cursor-grab active:cursor-grabbing",
            isDark ? "text-teal-300" : "text-teal-700",
          )}
          aria-label={t("drag_to_reorder", { section: label })}
        >
          <GripVertical className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs font-medium max-w-40 truncate">{label}</span>
        </span>

        <span className="flex items-center gap-0.5 ml-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={t("move_section_up", { section: label })}
            className={clsx(
              "p-1 rounded-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
              isDark
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-600",
            )}
          >
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={t("move_section_down", { section: label })}
            className={clsx(
              "p-1 rounded-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
              isDark
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-600",
            )}
          >
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onToggleVisibility}
            aria-label={
              isHidden
                ? t("show_section", { section: label })
                : t("hide_section", { section: label })
            }
            aria-pressed={isHidden}
            className={clsx(
              "p-1 rounded-full transition-colors cursor-pointer",
              isDark
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-600",
            )}
          >
            {isHidden ? (
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </span>
      </div>

      <div
        className={clsx("pt-2", isHidden && "opacity-40 pointer-events-none")}
      >
        {children}
      </div>

      {isHidden && (
        <div
          className={clsx(
            "absolute top-3 right-4 z-20 text-[11px] font-medium px-2 py-0.5 rounded-full",
            isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600",
          )}
        >
          {t("section_hidden_badge")}
        </div>
      )}
    </div>
  );
}
