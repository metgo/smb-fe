import clsx from "clsx";
import { Image as ImageIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { DeleteIconBtn, EditIconBtn } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ImageWithFallback from "./ImageWithFallback";
import ItemStatusBadge from "./ItemStatusBadge";

interface MetaRow {
  icon: React.ElementType;
  label: string;
}

interface GridCardProps {
  image?: string;
  imageAlt?: string;
  imageHeight?: string;
  fallbackIcon?: React.ElementType;
  fallbackGradient?: string;
  title: string;
  status?: string;
  statusNode?: React.ReactNode;
  meta?: (MetaRow | null | undefined | false)[];
  footer?: React.ReactNode;
  isChecked?: boolean;
  onCheckChange?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

export default function GridCard({
  image,
  imageAlt = "",
  imageHeight = "h-24 sm:h-28",
  fallbackIcon: FallbackIcon = ImageIcon,
  fallbackGradient = "from-gray-300 to-teal-400",
  title,
  status,
  statusNode,
  meta,
  footer,
  isChecked,
  onCheckChange,
  onDelete,
  onEdit,
  onClick,
}: GridCardProps) {
  const { isDark } = useThemeClasses();

  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer relative",
        isDark ? "bg-gray-800" : "bg-white",
        isChecked
          ? "border-2 border-teal-500"
          : `border ${isDark ? "border-gray-700" : "border-gray-200"}`,
      )}
    >
      {/* Top overlay: checkbox + status + actions */}
      <div
        className="absolute top-2 left-0 z-30 w-full flex items-center justify-between px-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          {onCheckChange !== undefined && (
            <Checkbox
              checked={isChecked}
              onCheckedChange={onCheckChange}
              className="cursor-pointer border-2 transition-colors border-teal-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
            />
          )}
          {statusNode ??
            (status && <ItemStatusBadge status={status as TStatus} />)}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && <EditIconBtn onClick={onEdit} />}
            {onDelete && <DeleteIconBtn onClick={onDelete} />}
          </div>
        )}
      </div>

      {/* Image */}
      <div className={clsx("relative", imageHeight)}>
        {image ? (
          <ImageWithFallback
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={clsx(
              "w-full h-full bg-linear-to-br flex items-center justify-center",
              fallbackGradient,
            )}
          >
            <FallbackIcon className="w-10 h-10 text-white/50" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="px-2.5 py-2">
        <h3
          className={clsx(
            "font-semibold text-sm leading-tight mb-1.5 line-clamp-1",
            isDark ? "text-gray-100" : "text-gray-800",
          )}
        >
          {title}
        </h3>

        {meta && (meta.filter(Boolean) as MetaRow[]).length > 0 && (
          <div className="space-y-1">
            {(meta.filter(Boolean) as MetaRow[]).map((row, i) => (
              <div
                key={i}
                className={clsx(
                  "flex items-center gap-1.5 text-xs",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              >
                <row.icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{row.label}</span>
              </div>
            ))}
          </div>
        )}

        {footer && <div className="mt-1.5">{footer}</div>}
      </div>
    </div>
  );
}
