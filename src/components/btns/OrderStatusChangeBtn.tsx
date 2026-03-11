import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";
import { UserRole } from "@/enums/user.types";

interface StatusChangeBtnProps {
  status: TOrderStatus;
  handleStatusChange: (status: TOrderStatus) => void;
}

type StatusOption = {
  color: string; // dot bg color
  textColor: string; // button text color
  borderColor: string; // button border color
  label: string;
};

const OrderStatusChangeBtn: React.FC<StatusChangeBtnProps> = ({
  status,
  handleStatusChange,
}) => {
  const { t } = useTranslation("orders");
  const { isDark, isRTL } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);

  const [currentStatus, setCurrentStatus] = useState<
    TOrderStatus | undefined
  >();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status) setCurrentStatus(status.toLowerCase() as TOrderStatus);
  }, [status]);

  /* -------------------- Status Config -------------------- */
  const allStatuses: Record<TOrderStatus, StatusOption> = {
    draft: {
      color: "bg-gray-400",
      textColor: "text-gray-400",
      borderColor: "border-gray-400",
      label: t("draft"),
    },
    processing: {
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      borderColor: "border-yellow-500",
      label: t("processing"),
    },
    paid: {
      color: "bg-blue-500",
      textColor: "text-blue-500",
      borderColor: "border-blue-500",
      label: t("paid"),
    },
    confirmed: {
      color: "bg-indigo-500",
      textColor: "text-indigo-500",
      borderColor: "border-indigo-500",
      label: t("confirmed"),
    },
    delivered: {
      color: "bg-teal-500",
      textColor: "text-teal-500",
      borderColor: "border-teal-500",
      label: t("delivered"),
    },
    completed: {
      color: "bg-green-500",
      textColor: "text-green-500",
      borderColor: "border-green-500",
      label: t("completed"),
    },
    canceled: {
      color: "bg-red-500",
      textColor: "text-red-500",
      borderColor: "border-red-500",
      label: t("canceled"),
    },
    partially_cancelled: {
      color: "bg-orange-400",
      textColor: "text-orange-400",
      borderColor: "border-orange-400",
      label: t("partially_cancelled"),
    },
    failed: {
      color: "bg-pink-500",
      textColor: "text-pink-500",
      borderColor: "border-pink-500",
      label: t("failed"),
    },
  };

  const activeOption = currentStatus ? allStatuses[currentStatus] : undefined;
  const restrictedStatuses: TOrderStatus[] = ["completed", "canceled"];
  const isTraveller = userRole === UserRole.TRAVELLER;

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

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  /* -------------------- Handlers -------------------- */
  const handleChange = (newStatus: TOrderStatus) => {
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
        className={clsx(
          "flex items-center gap-2 px-2 py-2 rounded-md text-sm border font-medium transition-colors duration-200",
          activeOption
            ? [activeOption.textColor, activeOption.borderColor]
            : isDark
              ? "text-gray-400 border-gray-500"
              : "text-gray-400 border-gray-300",
        )}
      >
        {activeOption ? (
          <>
            <span
              className={clsx("w-2.5 h-2.5 rounded-full", activeOption.color)}
            />
            <span>{activeOption.label}</span>
          </>
        ) : (
          <span>{t("change_status")}</span>
        )}

        <ChevronDown
          className={clsx(
            "w-4 h-4 transition-transform",
            isOpen ? "rotate-180" : "",
            activeOption ? activeOption.textColor : "text-gray-400",
          )}
        />
      </button>

      {isOpen && (
        <div
          className={clsx(
            "absolute top-full mt-2 w-48 rounded-lg shadow-lg border z-60",
            isRTL ? "left-0" : "-right-4",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300",
          )}
        >
          <div
            className={clsx(
              "p-2 border-b",
              isDark ? "border-gray-700" : "border-gray-200",
            )}
          >
            <p
              className={clsx(
                "text-xs px-2 py-1",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              {t("status")}
            </p>
          </div>

          <div className="p-2">
            {(Object.keys(allStatuses) as TOrderStatus[]).map((key) => {
              const option = allStatuses[key];
              if (!option) return null;

              const isActive = key === currentStatus;
              const isDisabled =
                isTraveller && restrictedStatuses.includes(key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => !isDisabled && handleChange(key)}
                  disabled={isDisabled}
                  className={clsx(
                    "w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors duration-150",
                    isRTL ? "text-right" : "text-left",
                    isDisabled
                      ? "cursor-not-allowed opacity-60 text-gray-500"
                      : isDark
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <div className={clsx("flex items-center gap-2")}>
                    <span
                      className={clsx("w-3 h-3 rounded-full", option.color)}
                    />
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

export default OrderStatusChangeBtn;
