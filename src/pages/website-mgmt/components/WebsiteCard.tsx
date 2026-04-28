import clsx from "clsx";
import {
  Globe,
  Settings,
  Trash2,
  ExternalLink,
  UploadCloud,
} from "lucide-react";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface WebsiteCardProps {
  website: IWebsite;
  onConfigure: () => void;
  onDelete: () => void;
  onMigrateToProd: () => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({
  website,
  onConfigure,
  onDelete,
  onMigrateToProd,
}) => {
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
        {website.logo ? (
          <ImageWithFallback
            src={website.logo}
            alt={website.name}
            className="h-16 w-auto object-contain"
          />
        ) : (
          <Globe className="w-12 h-12 text-gray-400" />
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3
          className={clsx("text-base font-semibold truncate mb-1", textPrimary)}
        >
          {website.name}
        </h3>

        {website.websiteUrl && (
          <a
            href={website.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "flex items-center gap-1 text-xs truncate hover:underline",
              textTertiary,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={11} />
            {website.websiteUrl}
          </a>
        )}
      </div>

      {/* Hover actions */}
      <div className="hidden group-hover:flex flex-col items-center gap-1.5 absolute right-4 top-4">
        <ActionBtn
          title="Configure"
          colorClass="text-teal-400 bg-teal-500/10 hover:bg-teal-500/20"
          onClick={onConfigure}
        >
          <Settings size={14} />
        </ActionBtn>

        <ActionBtn
          title="Migrate to Prod"
          colorClass="text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
          onClick={onMigrateToProd}
        >
          <UploadCloud size={14} />
        </ActionBtn>

        <ActionBtn
          title="Delete"
          colorClass="text-red-400 bg-red-500/10 hover:bg-red-500/20"
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </ActionBtn>
      </div>
    </div>
  );
};

export default WebsiteCard;

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
