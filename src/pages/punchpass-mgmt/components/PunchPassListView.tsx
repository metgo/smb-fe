import type React from "react";
import { toast } from "sonner";
import { useRef, useState, useEffect } from "react";
import { Loader, Ticket, Pencil, Eye, PenBox, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ConfirmDialog, ReordableDataTable } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { StatusPill } from "@/components/pills";
import { ActionIconButtons } from "@/components/btns";
import {
  useDeletePunchPassMutation,
  useUpdatePunchPassMutation,
} from "@/store/api/punchPassApi";
import { formatDate } from "@/helpers/formatter";

const STATUS_OPTIONS = [
  "approved",
  "pending",
  "rejected",
  "closed",
  "archived",
  "draft",
];

const InlineStatusSelect = ({
  punchPass,
  onUpdate,
}: {
  punchPass: IPunchPass;
  onUpdate: (id: string, status: string) => Promise<boolean>;
}) => {
  const { t } = useTranslation("common");
  const ref = useRef<HTMLDivElement>(null);
  const { isDark } = useThemeClasses();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>(
    (punchPass as any)?.status || "",
  );

  // Resync when the server's status changes under us (e.g. after create/
  // refetch) - without this, localStatus is only ever set once at mount and
  // silently goes stale if this component instance is reused for different
  // row data (React reconciliation reusing the slot) instead of remounting.
  const punchPassStatus = (punchPass as any)?.status || "";
  useEffect(() => {
    setLocalStatus(punchPassStatus);
  }, [punchPass?._id, punchPassStatus]);

  useEffect(() => {
    if (!isEditing) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isEditing]);

  const handleChange = async (status: string) => {
    setIsLoading(true);
    const ok = await onUpdate(punchPass._id, status);
    if (ok) setLocalStatus(status);
    setIsLoading(false);
    setIsEditing(false);
  };

  if (isLoading) {
    return <Loader className="w-4 h-4 animate-spin text-teal-500" />;
  }

  if (!isEditing) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="group/status flex items-center gap-1.5 cursor-pointer w-fit"
      >
        <StatusPill status={localStatus} />
        <Pencil className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/status:opacity-100 transition-opacity shrink-0" />
      </div>
    );
  }

  return (
    <div ref={ref} onClick={(e) => e.stopPropagation()}>
      <select
        autoFocus
        defaultValue={localStatus.toLowerCase()}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        className={`text-sm border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500 ${
          isDark
            ? "bg-gray-800 border-gray-600 text-gray-200"
            : "bg-white border-gray-300 text-gray-900"
        }`}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {t(s) || s}
          </option>
        ))}
      </select>
    </div>
  );
};

interface PunchPassListViewProps {
  punchPasses: IPunchPass[];
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  selectedPunchPasses: Set<string>;
  setSelectedPunchPasses: (v: Set<string>) => void;
  refetch: () => void;
  onRowClick?: (punchPass: IPunchPass) => void;
  onViewDetails: (punchPass: IPunchPass) => void;
  onEdit: (punchPass: IPunchPass) => void;
}

const PunchPassListView: React.FC<PunchPassListViewProps> = ({
  punchPasses,
  hasMore,
  fetchNextPage,
  isLoading,
  selectedPunchPasses,
  setSelectedPunchPasses,
  refetch,
  onRowClick,
  onViewDetails,
  onEdit,
}) => {
  const { t } = useTranslation("punch_pass");
  const { t: tc } = useTranslation("toast");
  const { borderColor, bgSecondary, textPrimary, language, isDark } =
    useThemeClasses();

  const [updatePunchPass] = useUpdatePunchPassMutation();
  const [deletePunchPass, { isLoading: isDeleting }] =
    useDeletePunchPassMutation();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handlePunchPassDelete = async (punchPassId: string) => {
    try {
      await deletePunchPass(punchPassId).unwrap();
      toast.success(t("punch_pass_deleted_success"));
      refetch();
    } catch (error: any) {
      toast.error(error?.message || t("punch_pass_delete_failed"));
    }
  };

  const handleStatusUpdate = async (
    punchPassId: string,
    status: string,
  ): Promise<boolean> => {
    const toastId = toast.loading(tc("punch_pass_status_change_loading"));
    try {
      await updatePunchPass({
        language,
        punchPassId,
        body: { status: status.toUpperCase() },
      }).unwrap();
      toast.success(tc("punch_pass_status_update_success"), { id: toastId });
      refetch();
      return true;
    } catch (error: any) {
      toast.error(error?.message || tc("punch_pass_status_update_failed"), {
        id: toastId,
      });
      return false;
    }
  };

  const columns = [
    { key: "checkbox", label: "", width: "50px" },

    {
      key: "image",
      label: t("images"),
      render: (punchPass: IPunchPass) => (
        <div className="w-12 h-12 rounded-lg bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center overflow-hidden">
          {punchPass?.image ? (
            <img
              src={punchPass.image as unknown as string}
              alt={punchPass.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Ticket className="w-6 h-6 text-white" />
          )}
        </div>
      ),
    },

    {
      key: "name",
      label: t("name"),
      sortable: true,
      render: (punchPass: IPunchPass) => (
        <div className={`${textPrimary} line-clamp-1`}>
          {punchPass.name || "-"}
        </div>
      ),
    },

    {
      key: "businessId",
      label: t("business_name"),
      render: (punchPass: IPunchPass) => (
        <div className={`${textPrimary} line-clamp-1`}>
          {punchPass.businessId?.name || "-"}
        </div>
      ),
    },

    {
      key: "status",
      label: t("status"),
      render: (punchPass: IPunchPass) => (
        <InlineStatusSelect
          punchPass={punchPass}
          onUpdate={handleStatusUpdate}
        />
      ),
    },

    {
      key: "price",
      label: t("price"),
      sortable: true,
      render: (punchPass: IPunchPass) => (
        <div>
          {punchPass?.price?.markedPrice != null &&
            punchPass?.price?.sellingPrice != null &&
            punchPass.price.markedPrice !== punchPass.price.sellingPrice && (
              <div className="text-xs text-gray-400 line-through">
                ₪{punchPass.price.markedPrice}
              </div>
            )}
          <div className="font-medium">
            {punchPass.price?.sellingPrice != null
              ? `₪${punchPass.price?.sellingPrice}`
              : "-"}
          </div>
        </div>
      ),
    },

    {
      key: "quantity",
      label: t("quantity"),
      sortable: true,
      render: (punchPass: IPunchPass) => (
        <div className={`${textPrimary} line-clamp-1`}>
          {punchPass.quantity?.isUnlimited
            ? "∞"
            : (punchPass.quantity?.remaining ?? "-")}
        </div>
      ),
    },

    {
      key: "catalogueCount",
      label: t("catalogues"),
      render: (punchPass: IPunchPass) => (
        <div className={`${textPrimary}`}>
          {punchPass.catalogueCount ?? punchPass.catelogCount ?? 0}
        </div>
      ),
    },

    {
      key: "updatedAt",
      label: t("last_updated"),
      sortable: true,
      render: (punchPass: IPunchPass) => (
        <div className={`${textPrimary}`}>
          {punchPass.updatedAt
            ? formatDate(punchPass.updatedAt, language)
            : "-"}
        </div>
      ),
    },

    {
      key: "action",
      label: t("actions"),
      render: (punchPass: IPunchPass) => (
        <ActionIconButtons
          isDark={isDark}
          actions={[
            {
              title: t("details"),
              icon: Eye,
              color: "green",
              onClick: () => onViewDetails(punchPass),
            },
            {
              title: t("edit_punch_pass"),
              icon: PenBox,
              color: "blue",
              onClick: () => onEdit(punchPass),
            },
            {
              title: t("delete_punch_pass"),
              icon: Trash2,
              color: "red",
              onClick: () => setItemToDelete(punchPass._id),
            },
          ]}
        />
      ),
    },
  ] as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: IPunchPass) => React.ReactNode;
  }[];

  return (
    <div className={`rounded-xl border ${borderColor} ${bgSecondary}`}>
      <ReordableDataTable
        rowKey="_id"
        data={punchPasses}
        isDataLoading={isLoading}
        selectedItems={selectedPunchPasses}
        onSelectionChange={setSelectedPunchPasses}
        onRowClick={onRowClick}
        storageKey="punchPassesTableColumnOrder"
        columns={columns}
        hasMore={hasMore}
        next={fetchNextPage}
      />

      <ConfirmDialog
        open={!!itemToDelete}
        title={t("delete_punch_pass")}
        message={t("delete_punch_pass_confirm")}
        confirmText="delete"
        loading={isDeleting}
        variant="danger"
        onCancel={() => setItemToDelete(null)}
        onConfirm={async () => {
          if (!itemToDelete) return;
          await handlePunchPassDelete(itemToDelete);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};

export default PunchPassListView;
