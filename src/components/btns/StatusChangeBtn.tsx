import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface StatusChangeBtnProps {
  status: TStatus;
  isProduct?: boolean;
  handleStatusChange: (status: TStatus) => void;
}
type StatusOption = {
  color: string;
  label: string;
};

type StatusConfig = Partial<Record<TStatus, StatusOption>>;

const StatusChangeBtn: React.FC<StatusChangeBtnProps> = ({
  status,
  isProduct = false,
  handleStatusChange,
}) => {
  const { t } = useTranslation("common");
  const { isRTL } = useAppSelector((state) => state.settings);
  const { isDark } = useThemeClasses();

  const [currentStatus, setCurrentStatus] = useState<TStatus>(
    status?.toLowerCase() as TStatus,
  );
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* -------------------- Status Config -------------------- */
  const statusConfig = useMemo<StatusConfig>(() => {
    const allStatuses: Record<TStatus, StatusOption> = {
      draft: { color: "bg-gray-500", label: t("draft") },
      pending: { color: "bg-yellow-500", label: t("pending") },
      approved: { color: "bg-green-500", label: t("approved") },
      rejected: { color: "bg-red-500", label: t("rejected") },
      archived: { color: "bg-gray-400", label: t("archived") },
      active: { color: "bg-green-400", label: t("active") },
      inactive: { color: "bg-red-400", label: t("inactive") },
    };

    if (isProduct) {
      return {
        draft: allStatuses.draft,
        active: allStatuses.active,
        inactive: allStatuses.inactive,
      };
    }

    const { active, inactive, ...rest } = allStatuses;
    return rest;
  }, [t, isProduct]);

  /* -------------------- Outside Click Handler -------------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  /* -------------------- Handlers -------------------- */
  const handleChange = (newStatus: TStatus) => {
    setCurrentStatus(newStatus);
    handleStatusChange(newStatus);
    setIsOpen(false);
  };

  /* -------------------- Render -------------------- */
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm border border-gray-300 text-gray-200 font-medium"
      >
        <span>{t("change_status")}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-48 rounded-lg shadow-lg border z-60
            ${isRTL ? "left-0" : "-right-4"}
            ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
          `}
        >
          <div
            className={`p-2 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <p
              className={`text-xs px-2 py-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("status")}
            </p>
          </div>

          <div className="p-2">
            {(Object.keys(statusConfig) as TStatus[]).map((key) => {
              const option = statusConfig[key];
              if (!option) return null;
              const isActive = key === currentStatus;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange(key)}
                  className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between
                    ${isRTL ? "text-right" : "text-left"}
                    ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${option.color}`} />
                    <span>{option.label}</span>
                  </div>

                  {isActive && <Check className="w-4 h-4 text-teal-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusChangeBtn;
