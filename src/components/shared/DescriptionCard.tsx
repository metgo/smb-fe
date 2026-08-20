import { getPlainTextFromRichText } from "@/helpers";
import clsx from "clsx";
import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type DescriptionCardProps = {
  title: string;
  content: string;
  icon?: ReactNode;
  iconBgClass?: string;
  isDark?: boolean;
  preWrap?: boolean;
  isEvent?: boolean;
  /** Character count before the content gets truncated with a "Show more" toggle. Set to 0 to disable. */
  collapseAt?: number;
};

const DescriptionCard: React.FC<DescriptionCardProps> = ({
  title,
  content,
  icon,
  iconBgClass,
  isDark = false,
  preWrap = false,
  isEvent = false,
  collapseAt = 320,
}) => {
  const [expanded, setExpanded] = useState(false);

  const plainText = useMemo(
    () => (isEvent ? content || "" : getPlainTextFromRichText(content || "")),
    [content, isEvent],
  );

  const isEmpty = !plainText || plainText.trim().length === 0;
  const isLong = collapseAt > 0 && plainText.length > collapseAt;
  const shouldTruncate = isLong && !expanded && !isEvent;

  const displayText = shouldTruncate
    ? `${plainText.slice(0, collapseAt).trimEnd()}…`
    : plainText;

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 md:p-2 transition-all duration-200",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      {icon && (
        <div className="flex items-start gap-3 ">
          <div
            className={clsx(
              "p-0.5 rounded-lg shrink-0",
              iconBgClass || (isDark ? "bg-gray-700/20" : "bg-gray-100"),
            )}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={clsx(
                "text-sm md:text-md font-semibold tracking-wide",
                isDark ? "text-gray-300" : "text-gray-900",
              )}
            >
              {title}
            </h3>
          </div>
        </div>
      )}

      {isEmpty ? (
        <p
          className={clsx(
            "text-sm italic md:pl-11",
            isDark ? "text-gray-500" : "text-gray-400",
          )}
        >
          No {title.toLowerCase()} provided.
        </p>
      ) : isEvent ? (
        <div
          className={clsx(
            "text-base leading-relaxed pl-11",
            preWrap && "whitespace-pre-wrap",
            isDark ? "text-gray-200" : "text-gray-800",
          )}
          dangerouslySetInnerHTML={{ __html: content || "" }}
        />
      ) : (
        <div className="md:pl-11">
          <div
            className={clsx(
              "text-sm md:text-base leading-relaxed",
              preWrap && "whitespace-pre-wrap",
              isDark ? "text-gray-200" : "text-gray-800",
            )}
          >
            {displayText}
          </div>

          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className={clsx(
                "mt-2 inline-flex items-center gap-1 text-xs font-medium transition-colors",
                isDark
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700",
              )}
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DescriptionCard;