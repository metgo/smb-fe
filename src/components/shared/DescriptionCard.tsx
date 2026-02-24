import clsx from "clsx";
import type { ReactNode } from "react";

type DescriptionCardProps = {
  title: string;
  content: string;
  icon?: ReactNode;
  iconBgClass?: string;
  isDark?: boolean;
  preWrap?: boolean; // for plain text line breaks
};

const DescriptionCard: React.FC<DescriptionCardProps> = ({
  title,
  content,
  icon,
  iconBgClass,
  isDark = false,
  preWrap = false,
}) => {
  return (
    <div
      className={clsx(
        "rounded-xl border p-6 transition-all duration-200",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      {icon && (
        <div className="flex items-start gap-3 mb-3">
          <div
            className={clsx(
              "p-2 rounded-lg",
              iconBgClass || (isDark ? "bg-gray-700/20" : "bg-gray-100"),
            )}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h3
              className={clsx(
                "text-sm font-semibold uppercase tracking-wide mb-1",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              {title}
            </h3>
          </div>
        </div>
      )}

      <div
        className={clsx(
          "text-base leading-relaxed pl-11",
          preWrap && "whitespace-pre-wrap",
          isDark ? "text-gray-200" : "text-gray-800",
        )}
        dangerouslySetInnerHTML={{ __html: content || "" }}
      ></div>
    </div>
  );
};

export default DescriptionCard;
