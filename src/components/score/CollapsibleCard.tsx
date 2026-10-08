import clsx from "clsx";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { usePersistentState } from "@/hooks/usePersistentState";

interface CollapsibleCardProps {
  // stable id - the open/closed choice is remembered per browser under it
  id: string;
  title: string;
  icon?: ReactNode;
  // short status shown next to the title, visible even when collapsed
  summary?: ReactNode;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

const CollapsibleCard = ({
  id,
  title,
  icon,
  summary,
  description,
  defaultOpen = false,
  children,
}: CollapsibleCardProps) => {
  const { cardClasses, textPrimary, textTertiary, hoverBg } = useThemeClasses();
  const [open, setOpen] = usePersistentState<boolean>(
    `scoreSettings.section.${id}`,
    defaultOpen,
  );
  const bodyId = `section-${id}`;

  return (
    <section className={clsx("rounded-xl", cardClasses)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={bodyId}
        className={clsx(
          "w-full flex items-center gap-3 px-5 py-4 text-start rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
          hoverBg,
        )}
      >
        {icon}
        <span className="flex-1 min-w-0">
          <span className={clsx("block text-lg font-semibold", textPrimary)}>
            {title}
          </span>
          {description && open && (
            <span className={clsx("block text-sm font-normal", textTertiary)}>
              {description}
            </span>
          )}
        </span>
        {summary && (
          <span className={clsx("text-sm shrink-0", textTertiary)}>
            {summary}
          </span>
        )}
        <ChevronDown
          className={clsx(
            "w-5 h-5 shrink-0 transition-transform motion-reduce:transition-none",
            textTertiary,
            open && "rotate-180",
          )}
        />
      </button>
      <div id={bodyId} hidden={!open} className="px-5 pb-5">
        {children}
      </div>
    </section>
  );
};

export default CollapsibleCard;
