import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from "react";
import { Eye, Pencil, Send, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { timeAgo } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useUpdateEmailConfigMutation,
  useDeleteEmailConfigMutation,
} from "@/store/api/emailConfigMutationApi";

import EmailConfigFormModal from "./EmailConfigFormModal";
import EmailConfigPreviewModal from "./EmailConfigPreviewModal";
import EmailConfigTestSendModal from "./EmailConfigTestSendModal";
import { ReordableDataTable, ConfirmDialog } from "@/components/shared";

interface EmailConfigListProps {
  data: IEmailConfig[];
  isLoading: boolean;
  onRefetch: () => void;
  hasMore?: boolean;
  next?: () => void;
}

const EmailConfigList = ({
  data,
  isLoading,
  onRefetch,
  hasMore,
  next,
}: EmailConfigListProps) => {
  const { t } = useTranslation("email_config");
  const { textTertiary } = useThemeClasses();

  const [editTarget, setEditTarget] = useState<IEmailConfig | null>(null);
  const [previewTarget, setPreviewTarget] = useState<IEmailConfig | null>(null);
  const [testSendTarget, setTestSendTarget] = useState<IEmailConfig | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<IEmailConfig | null>(null);

  const [updateEmailConfig] = useUpdateEmailConfigMutation();
  const [deleteEmailConfig, { isLoading: isDeleting }] =
    useDeleteEmailConfigMutation();

  const handleToggleActive = useCallback(
    async (emailConfig: IEmailConfig, isActive: boolean) => {
      try {
        await updateEmailConfig({
          id: emailConfig._id,
          body: { isActive },
        }).unwrap();
        toast.success(t("template_updated_success"));
        onRefetch();
      } catch {
        toast.error(t("template_update_failed"));
      }
    },
    [updateEmailConfig, onRefetch, t],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmailConfig(deleteTarget._id).unwrap();
      toast.success(t("template_deleted_success"));
      onRefetch();
    } catch {
      toast.error(t("template_delete_failed"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "label",
        label: t("label"),
        sortable: true,
        render: (item: IEmailConfig) => (
          <div className="flex flex-col">
            <span className="font-medium">{item.label}</span>
            <span className={`text-xs ${textTertiary}`}>{item.eventKey}</span>
          </div>
        ),
      },
      {
        key: "category",
        label: t("category"),
        render: (item: IEmailConfig) => (
          <Badge variant="secondary">{item.category}</Badge>
        ),
      },
      {
        key: "subject",
        label: t("subject"),
        render: (item: IEmailConfig) => <div>{item.subject}</div>,
      },
      {
        key: "isActive",
        label: t("is_active"),
        render: (item: IEmailConfig) => (
          <Switch
            checked={item.isActive}
            onCheckedChange={(checked) => handleToggleActive(item, checked)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        key: "lastSyncedAt",
        label: t("last_synced_at"),
        render: (item: IEmailConfig) => (
          <span className={`text-sm ${textTertiary}`}>
            {item.lastSyncedAt ? timeAgo(item.lastSyncedAt) : t("never_synced")}
          </span>
        ),
      },
      {
        key: "actions",
        label: t("actions"),
        render: (item: IEmailConfig) => (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              title={t("edit_template")}
              onClick={() => setEditTarget(item)}
              className="p-1.5 rounded-md text-violet-500 bg-violet-500/10 hover:bg-violet-500/20 transition-colors cursor-pointer"
            >
              <Pencil size={14} />
            </button>
            <button
              title={t("preview")}
              onClick={() => setPreviewTarget(item)}
              className="p-1.5 rounded-md text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-pointer"
            >
              <Eye size={14} />
            </button>
            <button
              title={t("test_send")}
              onClick={() => setTestSendTarget(item)}
              className="p-1.5 rounded-md text-teal-500 bg-teal-500/10 hover:bg-teal-500/20 transition-colors cursor-pointer"
            >
              <Send size={14} />
            </button>
            <button
              title={t("delete_template")}
              onClick={() => setDeleteTarget(item)}
              className="p-1.5 rounded-md text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ],
    [t, textTertiary, handleToggleActive],
  );

  return (
    <>
      <ReordableDataTable<IEmailConfig>
        rowKey="_id"
        columns={columns}
        data={data}
        isDataLoading={isLoading}
        onRowClick={(item) => setEditTarget(item)}
        storageKey="emailConfigTableColumnOrder"
        hasMore={hasMore}
        next={next}
      />

      {editTarget && (
        <EmailConfigFormModal
          emailConfig={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={onRefetch}
        />
      )}

      {previewTarget && (
        <EmailConfigPreviewModal
          emailConfig={previewTarget}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {testSendTarget && (
        <EmailConfigTestSendModal
          emailConfig={testSendTarget}
          onClose={() => setTestSendTarget(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("delete_template")}
        message={t("delete_template_confirm")}
        variant="danger"
        confirmText="delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default EmailConfigList;
