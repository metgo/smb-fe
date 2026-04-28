import clsx from "clsx";
import {
  Building2,
  Edit,
  Trash2,
  ArrowRight,
  UploadCloud,
  Users,
} from "lucide-react";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface DmoCardProps {
  dmo: IDmo;
  onEdit: () => void;
  onDelete: () => void;
  onGoToAuthorities: () => void;
  onMigrateToProd: () => void;
}

const DmoCard: React.FC<DmoCardProps> = ({
  dmo,
  onEdit,
  onDelete,
  onGoToAuthorities,
  onMigrateToProd,
}) => {
  const authorityCount = dmo.authorities?.length ?? 0;
  const { cardClasses, textPrimary, textTertiary, isDark } = useThemeClasses();
  return (
    <div
      className={clsx("rounded-xl overflow-hidden group relative", cardClasses)}
    >
      {/* Logo / Banner */}
      <div
        className={clsx(
          "relative h-28 flex items-center justify-center",
          isDark ? "bg-gray-700/60" : "bg-gray-100",
        )}
      >
        {dmo.logoPath ? (
          <ImageWithFallback
            src={dmo.logoPath}
            alt={dmo.name}
            className="h-16 w-auto object-contain"
          />
        ) : (
          <Building2 className="w-12 h-12 text-gray-400" />
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3
          className={clsx("text-base font-semibold truncate mb-1", textPrimary)}
        >
          {dmo.name}
        </h3>

        {/* Authority count badge */}
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-teal-500" />
          <span className={clsx("text-xs font-medium", textTertiary)}>
            {authorityCount}{" "}
            {authorityCount === 1 ? "Authority" : "Authorities"}
          </span>
          <ActionBtn
            title="View Authorities"
            colorClass="text-violet-400 bg-violet-500/10 hover:bg-violet-500/20"
            onClick={onGoToAuthorities}
          >
            <ArrowRight size={14} />
          </ActionBtn>
        </div>

        {/* Actions */}
        <div className="hidden group-hover:flex flex-col items-center gap-1.5 absolute right-4 top-4">
          <ActionBtn
            title="Edit"
            colorClass="text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
            onClick={onEdit}
          >
            <Edit size={14} />
          </ActionBtn>

          <ActionBtn
            title="Delete"
            colorClass="text-red-400 bg-red-500/10 hover:bg-red-500/20"
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </ActionBtn>

          <ActionBtn
            title="Migrate to Prod"
            colorClass="text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
            onClick={onMigrateToProd}
          >
            <UploadCloud size={14} />
          </ActionBtn>
        </div>
      </div>
    </div>
  );
};

export default DmoCard;

// ─── Generic action icon button ──────────────────────────────────────────────

interface ActionBtnProps {
  title: string;
  colorClass: string;
  onClick: () => void;
  children: React.ReactNode;
}

const ActionBtn: React.FC<ActionBtnProps> = ({
  title,
  colorClass,
  onClick,
  children,
}) => (
  <button
    title={title}
    onClick={onClick}
    className={clsx(
      "p-1.5 rounded-md transition-colors cursor-pointer",
      colorClass,
    )}
  >
    {children}
  </button>
);
