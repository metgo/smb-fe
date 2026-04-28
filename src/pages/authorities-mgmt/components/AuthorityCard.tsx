import clsx from "clsx";
import { Building2, Edit, Landmark, Trash2, UploadCloud } from "lucide-react";

import { ImageWithFallback } from "@/components/shared";

interface AuthorityCardProps {
  authority: EnrichedAuthority;
  cardClasses: string;
  textPrimary: string;
  textTertiary: string;
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMigrateToProd: () => void;
}

const AuthorityCard: React.FC<AuthorityCardProps> = ({
  authority,
  cardClasses,
  textPrimary,
  textTertiary,
  isDark,
  onEdit,
  onDelete,
  onMigrateToProd,
}) => (
  <div
    className={clsx("rounded-xl overflow-hidden relative group", cardClasses)}
  >
    {/* Logo area */}
    <div
      className={clsx(
        "relative h-28 flex items-center justify-center",
        isDark ? "bg-gray-700/60" : "bg-gray-100",
      )}
    >
      {authority.logoPath ? (
        <ImageWithFallback
          src={authority.logoPath}
          alt={authority.name}
          className="h-16 w-auto object-contain"
        />
      ) : (
        <Landmark className="w-12 h-12 text-gray-400" />
      )}
    </div>

    {/* Body */}
    <div className="p-4">
      <h3
        className={clsx("text-base font-semibold truncate mb-1", textPrimary)}
      >
        {authority.name}
      </h3>

      {/* DMO badge */}
      <div className="flex items-center gap-1.5">
        {authority.dmoLogo ? (
          <img
            src={authority.dmoLogo}
            alt={authority.dmoName}
            className="w-6 h-6 object-contain"
          />
        ) : (
          <Building2 className="w-3.5 h-3.5 text-violet-500" />
        )}
        <span className={clsx("text-xs font-medium truncate", textTertiary)}>
          {authority.dmoName}
        </span>
      </div>

      {/* Actions */}
      <div className=" hidden group-hover:flex flex-col items-center gap-1.5 absolute top-2 right-2">
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

export default AuthorityCard;

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
