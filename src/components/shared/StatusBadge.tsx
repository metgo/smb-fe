import React from "react";
import { useTranslation } from "react-i18next";

export type StatusKey =
  | "DRAFT"
  | "INACTIVE"
  | "ACTIVE"
  | "APPROVED"
  | "REJECTED"
  | "PENDING"
  | "ARCHIVED";

interface StatusBadgeProps {
  status: StatusKey | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  console.log("🚀 ~ StatusBadge ~ status:", status);
  const { t } = useTranslation("common");

  const statusConfig: Record<StatusKey, { color: string; label: string }> = {
    DRAFT: { color: "bg-gray-500", label: t("draft") || "Draft" },
    INACTIVE: { color: "bg-yellow-500", label: t("inactive") || "Inactive" },
    ACTIVE: { color: "bg-green-500", label: t("active") || "Active" },
    APPROVED: { color: "bg-emerald-600", label: t("approved") || "Approved" },
    REJECTED: { color: "bg-red-600", label: t("rejected") || "Rejected" },
    PENDING: { color: "bg-orange-500", label: t("pending") || "Pending" },
    ARCHIVED: { color: "bg-slate-600", label: t("archived") || "Archived" },
  };

  const key = status?.toUpperCase() as StatusKey;
  const config = statusConfig[key];

  if (!config) return null;

  return (
    <span
      className={`px-4 py-2 inline-flex items-center rounded-md text-sm font-medium text-white ${config.color}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
