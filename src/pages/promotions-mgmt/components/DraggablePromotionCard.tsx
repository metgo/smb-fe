import { useDrag, useDrop } from "react-dnd";
import {
  Eye,
  EyeOff,
  Edit2,
  Copy,
  Trash2,
  GripVertical,
  TrendingUp,
  MousePointer,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface DraggablePromotionCardProps {
  promotion: IPromotion;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onToggleActive: (id: string) => void;
  onEdit: (promotion: IPromotion) => void;
  onDuplicate: (promotion: IPromotion) => void;
  onDelete: (id: string) => void;
}

interface OverlayActionProps {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  className?: string;
}

const OverlayAction = ({
  onClick,
  label,
  icon,
  className = "bg-black/30 hover:bg-black/60 text-white",
}: OverlayActionProps) => (
  <div className="relative group/tip">
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-all duration-150 ${className}`}
    >
      {icon}
    </button>
    <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity shadow-lg">
      {label}
      <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
    </span>
  </div>
);

const DraggablePromotionCard = ({
  promotion,
  index,
  onMove,
  onToggleActive,
  onEdit,
  onDuplicate,
  onDelete,
}: DraggablePromotionCardProps) => {
  const {
    language,
    bgPrimary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();

  const [{ isDragging }, drag, preview] = useDrag({
    type: "PROMOTION",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "PROMOTION",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  });

  const ctr =
    promotion.clicks > 0
      ? ((promotion.clicks / promotion.views) * 100).toFixed(1)
      : "0.0";

  return (
    <div
      ref={(node) => {
        preview(drop(node));
      }}
      className={`group relative ${bgPrimary} rounded-2xl border ${borderColor} overflow-hidden flex flex-col transition-all duration-200
        ${isDragging ? "opacity-50 scale-95 shadow-2xl" : "shadow-md hover:shadow-xl hover:-translate-y-1"}
        ${promotion.active ? "" : "opacity-60"}`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <img
          src={promotion.desktopMedia.url}
          alt={promotion.title[language]}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Drag handle — bottom-left */}
        <div
          ref={(node) => {
            if (node) drag(node);
          }}
          className="absolute bottom-3 left-3 p-1.5 rounded-lg bg-black/30 cursor-move text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Placement badge — bottom-right */}
        <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-green-600/80 text-white text-xs font-medium rounded-md">
          {promotion.placement}
        </span>

        {/* Order badge — bottom-left (beside drag) */}
        <span className="absolute bottom-3 left-11 px-2 py-0.5 bg-black/40 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          #{promotion.order}
        </span>

        {/* Action icons column — top-right */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {/* Eye — always visible */}
          <OverlayAction
            onClick={() => onToggleActive(promotion.id)}
            label={promotion.active ? "Deactivate" : "Activate"}
            icon={
              promotion.active ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )
            }
            className={
              promotion.active
                ? "bg-green-500/80 hover:bg-green-500 text-white"
                : "bg-black/30 hover:bg-black/60 text-white/70"
            }
          />

          {/* Edit — appears on hover */}
          <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-150">
            <OverlayAction
              onClick={() => onEdit(promotion)}
              label="Edit"
              icon={<Edit2 className="w-4 h-4" />}
            />
          </div>

          {/* Duplicate — appears on hover (slight delay) */}
          <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <OverlayAction
              onClick={() => onDuplicate(promotion)}
              label="Duplicate"
              icon={<Copy className="w-4 h-4" />}
            />
          </div>

          {/* Delete — appears on hover (longer delay) */}
          <div className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
            <OverlayAction
              onClick={() => {
                if (
                  confirm("Are you sure you want to delete this promotion?")
                ) {
                  onDelete(promotion.id);
                }
              }}
              label="Delete"
              icon={<Trash2 className="w-4 h-4" />}
              className="bg-black/30 hover:bg-red-500/80 text-white"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className={`text-base font-semibold ${textPrimary} truncate mb-1`}>
          {promotion.title[language] || promotion.title.en}
        </h3>
        <p className={`text-sm ${textSecondary} line-clamp-2 flex-1`}>
          {promotion.content[language] || promotion.content.en}
        </p>

        {/* Stats */}
        <div
          className={`flex items-center justify-between pt-3 mt-3 border-t ${borderColor}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <TrendingUp className={`w-3.5 h-3.5 ${textTertiary}`} />
              <span className={`text-xs ${textSecondary}`}>
                {promotion.views.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MousePointer className={`w-3.5 h-3.5 ${textTertiary}`} />
              <span className={`text-xs ${textSecondary}`}>
                {promotion.clicks.toLocaleString()}
              </span>
            </div>
          </div>
          <span className={`text-xs font-semibold ${textTertiary}`}>
            CTR {ctr}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default DraggablePromotionCard;
