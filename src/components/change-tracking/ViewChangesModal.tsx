import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Check, Loader2, Star } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";

import ModalWrapper from "@/components/wrapper/ModalWrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { UserRole } from "@/enums/user.types";
import StatusPill from "@/components/pills/StatusPill";
import { useApproveChangesMutation } from "@/store/api/businessQueryApi";
import { updateNotificationStatus } from "@/features/notificationSlice";

interface ChangeField {
  fieldName: string;
  fieldLabel: string;
  category: string;
  oldValue: any;
  newValue: any;
  fieldType: string;
  multiLanguage?: { languages: string[] };
}

interface ChangeData {
  changeId?: string | null;
  changes: ChangeField[];
  summary: string;
  changesCount: number;
  changedBy?:
    | { _id?: string; firstName?: string; lastName?: string; email?: string }
    | string
    | null;
  changedAt: Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface ViewChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "business" | "product" | "event" | "poi";
  entityName: string;
  entityId?: string;
  changeData?: ChangeData;
  onApprove?: (result?: any) => void;
  isLoading?: boolean;
  userRole?: UserRole;
  notificationId?: string;
}

const categoryLabels = {
  BASIC_INFO: "category_basic_info",
  CONTACT: "category_contact",
  MEDIA: "category_media",
  GEO: "category_geo",
  PRICING: "category_pricing",
  INVENTORY: "category_inventory",
  OPENING_HOURS: "category_opening_hours",
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "object") {
    // Handle multilingual fields (before array check)
    if (!Array.isArray(value) && (value.en || value.ar || value.he)) {
      return Object.values(value).filter(Boolean).join(" / ");
    }
    // Format all objects and arrays as pretty JSON
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const formatChangedBy = (changedBy: ChangeData["changedBy"]): string => {
  if (!changedBy) return "—";
  if (typeof changedBy === "string") return changedBy;
  return changedBy._id || changedBy.firstName || changedBy.email || "—";
};

const isImageArray = (value: any): boolean => {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => item && typeof item === "object" && "image" in item)
  );
};

const isCoverObject = (value: any): boolean => {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "image" in value
  );
};

const isEmptyObjectsArray = (value: any): boolean => {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        !item || (typeof item === "object" && Object.keys(item).length === 0),
    )
  );
};

const ImageDisplay = ({
  images,
  isDark,
}: {
  images: Array<{ image: string; isPrimary?: boolean }>;
  isDark: boolean;
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {images.map((item, idx) => (
        <div key={idx} className="relative group">
          <img
            src={item.image}
            alt={`Image ${idx + 1}`}
            className={clsx(
              "w-24 h-24 object-cover rounded border-2 transition-all",
              item.isPrimary
                ? isDark
                  ? "border-yellow-500 ring-1 ring-yellow-400"
                  : "border-yellow-400 ring-1 ring-yellow-300"
                : isDark
                  ? "border-gray-600"
                  : "border-gray-300",
            )}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='12' fill='%23999'%3EError%3C/text%3E%3C/svg%3E";
            }}
          />
          {item.isPrimary && (
            <div
              className={clsx(
                "absolute top-1 right-1 p-1 rounded-full",
                isDark ? "bg-yellow-500/90" : "bg-yellow-400/90",
              )}
            >
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function ViewChangesModal({
  isOpen,
  onClose,
  entityType,
  entityName,
  entityId,
  changeData,
  onApprove,
  isLoading = false,
  userRole,
  notificationId,
}: ViewChangesModalProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation("pending_approvals");
  const { isDark, textTertiary } = useThemeClasses();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [approveChanges] = useApproveChangesMutation();

  if (!isOpen) return null;

  const isAdmin =
    userRole === UserRole.SUPERADMIN || userRole === UserRole.SITE_MANAGER;

  const changesByCategory = changeData
    ? changeData.changes.reduce(
        (acc, change) => {
          const category = change.category || "OTHER";
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(change);
          return acc;
        },
        {} as Record<string, ChangeField[]>,
      )
    : {};

  const handleApproveClick = async () => {
    if (!entityId || !changeData?.changeId) {
      toast.error("Missing required information for approval");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await approveChanges({
        entityType,
        entityId,
        changeId: changeData.changeId,
      }).unwrap();
      toast.success(t("changes_approved"));

      // Update notification status in Redux
      if (notificationId) {
        dispatch(
          updateNotificationStatus({
            notificationId,
            status: "APPROVED",
          }),
        );
      }

      if (onApprove) {
        onApprove(result);
      }
      onClose();
    } catch (error) {
      toast.error(t("approval_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ModalWrapper onClose={onClose} maxWidth="max-w-5xl">
        <div
          className={clsx(
            "flex flex-col h-full overflow-hidden rounded-t-2xl md:rounded-2xl",
            isDark ? "bg-gray-900" : "bg-white",
          )}
        >
          {/* Header */}
          <div
            className={clsx(
              "flex-shrink-0 px-6 py-4 border-b",
              isDark ? "border-gray-800" : "border-gray-200",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2
                  className={clsx(
                    "text-lg font-semibold",
                    isDark ? "text-gray-100" : "text-gray-900",
                  )}
                >
                  {t("view_changes")}
                </h2>
                <p className={clsx("text-sm mt-1", textTertiary)}>
                  {entityName}
                </p>
              </div>
              {changeData && <StatusPill status={changeData.status} />}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className={clsx("text-sm", textTertiary)}>
                    Loading changes...
                  </p>
                </div>
              </div>
            ) : !changeData || changeData.changesCount === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className={clsx("text-sm", textTertiary)}>
                    No changes found
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Change Summary */}
                <div
                  className={clsx(
                    "p-4 rounded-lg",
                    isDark ? "bg-gray-800/50" : "bg-gray-50",
                  )}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className={clsx(
                          "text-xs font-medium uppercase",
                          textTertiary,
                        )}
                      >
                        {t("changes_count", {
                          count: changeData.changesCount,
                        })}
                      </p>
                      <p
                        className={clsx(
                          "text-sm font-semibold mt-1",
                          isDark ? "text-gray-100" : "text-gray-900",
                        )}
                      >
                        {changeData.changesCount} {t("fields")}
                      </p>
                    </div>
                    <div>
                      <p
                        className={clsx(
                          "text-xs font-medium uppercase",
                          textTertiary,
                        )}
                      >
                        {t("changed_by")}
                      </p>
                      <p
                        className={clsx(
                          "text-sm font-semibold mt-1",
                          isDark ? "text-gray-100" : "text-gray-900",
                        )}
                      >
                        {formatChangedBy(changeData.changedBy)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p
                        className={clsx(
                          "text-xs font-medium uppercase",
                          textTertiary,
                        )}
                      >
                        {t("changed_at")}
                      </p>
                      <p
                        className={clsx(
                          "text-sm font-semibold mt-1",
                          isDark ? "text-gray-100" : "text-gray-900",
                        )}
                      >
                        {new Date(changeData.changedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Changes by Category */}
                {Object.entries(changesByCategory).map(([category, fields]) => {
                  // Filter out fields with empty object arrays
                  const filteredFields = fields.filter(
                    (field) =>
                      !isEmptyObjectsArray(field.oldValue) &&
                      !isEmptyObjectsArray(field.newValue),
                  );

                  if (filteredFields.length === 0) return null;

                  return (
                    <div key={category}>
                      <h3
                        className={clsx(
                          "text-sm font-semibold mb-3 px-2",
                          isDark ? "text-gray-300" : "text-gray-700",
                        )}
                      >
                        {t(
                          categoryLabels[
                            category as keyof typeof categoryLabels
                          ] || category,
                        )}
                      </h3>
                      <div className="space-y-3">
                        {filteredFields.map((field, idx) => (
                          <div
                            key={`${category}-${idx}`}
                            className={clsx(
                              "p-4 rounded-lg border",
                              isDark
                                ? "bg-gray-800 border-gray-700"
                                : "bg-gray-50 border-gray-200",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <h4
                                  className={clsx(
                                    "text-sm font-semibold",
                                    isDark ? "text-gray-100" : "text-gray-900",
                                  )}
                                >
                                  {field.fieldLabel}
                                </h4>
                                {field.multiLanguage && (
                                  <p
                                    className={clsx(
                                      "text-xs mt-1",
                                      textTertiary,
                                    )}
                                  >
                                    {t("languages_changed", {
                                      languages:
                                        field.multiLanguage.languages.join(
                                          ", ",
                                        ),
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Value Comparison */}
                            {isImageArray(field.oldValue) ||
                            isImageArray(field.newValue) ||
                            isCoverObject(field.oldValue) ||
                            isCoverObject(field.newValue) ? (
                              <div className="grid grid-cols-2 gap-3">
                                {/* Old Images */}
                                <div>
                                  <p
                                    className={clsx(
                                      "text-xs font-medium uppercase mb-2",
                                      textTertiary,
                                    )}
                                  >
                                    {t("old_value")}
                                  </p>
                                  {isImageArray(field.oldValue) &&
                                  field.oldValue.length > 0 ? (
                                    <ImageDisplay
                                      images={field.oldValue}
                                      isDark={isDark}
                                    />
                                  ) : isCoverObject(field.oldValue) ? (
                                    <ImageDisplay
                                      images={[field.oldValue]}
                                      isDark={isDark}
                                    />
                                  ) : (
                                    <p
                                      className={clsx("text-xs", textTertiary)}
                                    >
                                      —
                                    </p>
                                  )}
                                </div>

                                {/* New Images */}
                                <div>
                                  <p
                                    className={clsx(
                                      "text-xs font-medium uppercase mb-2",
                                      textTertiary,
                                    )}
                                  >
                                    {t("new_value")}
                                  </p>
                                  {isImageArray(field.newValue) &&
                                  field.newValue.length > 0 ? (
                                    <ImageDisplay
                                      images={field.newValue}
                                      isDark={isDark}
                                    />
                                  ) : isCoverObject(field.newValue) ? (
                                    <ImageDisplay
                                      images={[field.newValue]}
                                      isDark={isDark}
                                    />
                                  ) : (
                                    <p
                                      className={clsx("text-xs", textTertiary)}
                                    >
                                      —
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-3">
                                {/* Old Value */}
                                <div>
                                  <p
                                    className={clsx(
                                      "text-xs font-medium uppercase mb-1.5",
                                      textTertiary,
                                    )}
                                  >
                                    {t("old_value")}
                                  </p>
                                  <pre
                                    className={clsx(
                                      "p-2.5 rounded text-xs font-mono break-words overflow-auto max-h-48 whitespace-pre-wrap",
                                      isDark
                                        ? "bg-red-900/20 text-red-400"
                                        : "bg-red-50 text-red-900",
                                    )}
                                  >
                                    {formatValue(field.oldValue)}
                                  </pre>
                                </div>

                                {/* New Value */}
                                <div>
                                  <p
                                    className={clsx(
                                      "text-xs font-medium uppercase mb-1.5",
                                      textTertiary,
                                    )}
                                  >
                                    {t("new_value")}
                                  </p>
                                  <pre
                                    className={clsx(
                                      "p-2.5 rounded text-xs font-mono break-words overflow-auto max-h-48 whitespace-pre-wrap",
                                      isDark
                                        ? "bg-green-900/20 text-green-400"
                                        : "bg-green-50 text-green-900",
                                    )}
                                  >
                                    {formatValue(field.newValue)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          {isAdmin && changeData && (
            <div
              className={clsx(
                "flex-shrink-0 px-6 py-4 border-t",
                isDark ? "border-gray-800" : "border-gray-200",
              )}
            >
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading || isSubmitting}
                  className={clsx(
                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isDark
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-100"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {t("cancel")}
                </button>

                {changeData.status === "PENDING" && (
                  <>
                    {/* Reject Changes button - commented out for now */}
                    {/* <button
                      onClick={handleRejectClick}
                      disabled={isLoading || isSubmitting}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting && approvalAction === "reject" && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      <X className="w-4 h-4" />
                      {t("reject_changes")}
                    </button> */}

                    <button
                      onClick={handleApproveClick}
                      disabled={isLoading || isSubmitting}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      <Check className="w-4 h-4" />
                      {t("approve_changes")}
                    </button>
                  </>
                )}

                {changeData.status === "APPROVED" && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gray-500">
                    <Check className="w-4 h-4" />
                    {t("approved")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalWrapper>
    </>
  );
}
