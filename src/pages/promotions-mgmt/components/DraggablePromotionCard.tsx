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
import { motion } from "framer-motion";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface DraggablePromotionCardProps {
  t: (key: string) => string;
  promotion: IPromotionsRes;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onToggleActive: (id: string, status: boolean) => void;
  onEdit: (promotion: IPromotionsRes) => void;
  onDuplicate: (promotion: IPromotionsRes) => void;
  setConfirmOpen: (v: boolean) => void;
  setDeletePromoId: (id: string) => void;
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
  t,
  promotion,
  index,
  onMove,
  onToggleActive,
  onEdit,
  onDuplicate,
  setConfirmOpen,
  setDeletePromoId,
}: DraggablePromotionCardProps) => {
  const {
    language,
    bgPrimary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();

  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

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

  // Attach connectors to stable refs so framer-motion re-renders
  // don't briefly unregister the drop target during a drag.
  drop(cardRef);
  preview(cardRef);
  drag(handleRef);

  const titleByLang = {
    en: promotion.titleEn,
    he: promotion.titleHe,
    ar: promotion.titleAr,
  };

  const descByLang = {
    en: promotion.descriptionEn,
    he: promotion.descriptionHe,
    ar: promotion.descriptionAr,
  };

  const ctr =
    promotion.clicks > 0
      ? ((promotion.clicks / promotion.views) * 100).toFixed(1)
      : "0.0";

  return (
    <motion.div
      ref={cardRef}
      initial={false}
      animate={{
        opacity: isDragging ? 0.4 : promotion.isActive ? 1 : 0.6,
        scale: isDragging ? 0.95 : 1,
        boxShadow: isDragging
          ? "0 25px 50px -12px rgba(0,0,0,0.4)"
          : "0 1px 3px 0 rgba(0,0,0,0.1)",
      }}
      transition={{ type: "spring", stiffness: 500, damping: 50 }}
      className={`group relative ${bgPrimary} rounded-2xl border ${borderColor} overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-transform duration-200`}
    >
      {/* Media */}
      <div className="relative h-36 overflow-hidden shrink-0">
        {promotion.mediaType === "video" ? (
          <video
            src={promotion.mediaUrl.desktop}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <img
            src={promotion.mediaUrl.desktop}
            alt={titleByLang[language] || titleByLang.en}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Drag handle — bottom-left */}
        <div
          ref={handleRef}
          className="absolute bottom-3 left-3 p-1.5 rounded-lg bg-black/30 cursor-move text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Placement badge — bottom-right */}
        <span className="absolute top-3 left-3 px-2 py-1 bg-green-600/80 text-white text-xs font-medium rounded">
          {t(promotion.placement)}
        </span>

        {/* Order badge — beside drag handle */}
        <span className="absolute bottom-3 left-11 px-2 py-0.5 bg-black/40 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          #{index + 1}
        </span>

        {/* Action icons column — top-right */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <OverlayAction
            onClick={() => onToggleActive(promotion._id, !promotion.isActive)}
            label={promotion.isActive ? "Deactivate" : "Activate"}
            icon={
              promotion.isActive ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )
            }
            className={
              promotion.isActive
                ? "bg-green-500/80 hover:bg-green-500 text-white"
                : "bg-black/30 hover:bg-black/60 text-white/70"
            }
          />

          <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-150">
            <OverlayAction
              onClick={() => onEdit(promotion)}
              label="Edit"
              icon={<Edit2 className="w-4 h-4" />}
            />
          </div>

          <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <OverlayAction
              onClick={() => onDuplicate(promotion)}
              label="Duplicate"
              icon={<Copy className="w-4 h-4" />}
            />
          </div>

          <div className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
            <OverlayAction
              onClick={() => {
                setConfirmOpen(true);
                setDeletePromoId(promotion._id);
              }}
              label="Delete"
              icon={<Trash2 className="w-4 h-4" />}
              className="bg-black/30 hover:bg-red-500/80 text-white"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2">
        <h4 className={`text-base font-semibold ${textPrimary} truncate`}>
          {titleByLang[language] || titleByLang.en}
        </h4>
        <p className={`text-sm ${textSecondary} line-clamp-2 flex-1`}>
          {descByLang[language] || descByLang.en}
        </p>
        {/* Stats */}
        <div className={`flex items-center justify-between mt-2`}>
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
    </motion.div>
  );
};

export default DraggablePromotionCard;
