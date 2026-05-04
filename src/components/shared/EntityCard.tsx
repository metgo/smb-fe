import clsx from "clsx";
import { Edit, Eye, EyeOff, Trash2, UploadCloud } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { useThemeClasses } from "@/hooks/useThemeClasses";


interface EntityCardProps {
  logo?: string;
  name: string;
  fallbackIcon: React.ReactNode;
  isActive: boolean;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMigrateToProd: () => void;
  children?: React.ReactNode;
}

const EntityCard: React.FC<EntityCardProps> = ({
  logo,
  name,
  fallbackIcon,
  isActive,
  onToggleActive,
  onDelete,
  onEdit,
  onMigrateToProd,
  children,
}) => {
  const { cardClasses, textPrimary, isDark } = useThemeClasses();

  const actions = [
    {
      title: "Edit",
      colorClass:
        "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20",
      onClick: onEdit,
      icon: <Edit size={14} />,
    },
    {
      title: "Delete",
      colorClass:
        "text-red-400 bg-red-500/10 hover:bg-red-500/20",
      onClick: onDelete,
      icon: <Trash2 size={14} />,
    },
    {
      title: "Migrate to Prod",
      colorClass:
        "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20",
      onClick: onMigrateToProd,
      icon: <UploadCloud size={14} />,
    },
  ]
  return (
    <div
      className={clsx("rounded-xl overflow-hidden group relative", cardClasses)}
    >
      {/* Logo area */}
      <div
        className={clsx(
          "relative h-28 flex items-center justify-center",
          isDark ? "bg-gray-700/60" : "bg-gray-100",
        )}
      >
        {logo ? (
          <ImageWithFallback
            src={logo}
            alt={name}
            className="h-16 w-auto object-contain"
          />
        ) : (
          fallbackIcon
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3
          className={clsx("text-base font-semibold truncate mb-1", textPrimary)}
        >
          {name}
        </h3>
        {children}
      </div>

      {/* Action column — top-right, all fade in on hover */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-150">
          <ActionBtn
            title={isActive ? "Deactivate" : "Activate"}
            colorClass={
              isActive
                ? "text-white bg-green-500/80 hover:bg-green-500"
                : "text-white/70 bg-black/30 hover:bg-black/50"
            }
            onClick={onToggleActive}
          >
            {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          </ActionBtn>
        </div>



        {actions.map((action, i) => (
          <div
            key={action.title}
            className="opacity-0 group-hover:opacity-100 transition-all duration-150"
            style={{ transitionDelay: `${(i + 1) * 40}ms` }}
          >
            <ActionBtn
              title={action.title}
              colorClass={action.colorClass}
              onClick={action.onClick}
            >
              {action.icon}
            </ActionBtn>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntityCard;

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
  <div className="relative group/tip">
    <button
      onClick={onClick}
      className={clsx(
        "p-1.5 rounded-md transition-colors cursor-pointer",
        colorClass,
      )}
    >
      {children}
    </button>
    <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity shadow-lg z-10">
      {title}
      <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
    </span>
  </div>
);
