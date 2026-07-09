import clsx from "clsx";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  CheckCircle,
  Clock,
  Archive,
  Trash2,
  Edit3,
  Zap,
  ChevronDown,
  Loader,
  LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConfirmDialog } from "@/components/shared";
import {
  useActivateViewMutation,
  useDeleteContentMutation,
} from "@/store/api/contentMutationApi";
import CreateViewWizard from "./CreateViewWizard";
import { useTranslation } from "react-i18next";

interface Props {
  views: IView[];
  isLoading: boolean;
  externalApiId: string;
  websiteName: string;
  onViewSelect: (view: IView) => void;
  onRefetch: () => void;
  onRefetchTemplate?: () => void;
  hasUnsavedContent?: boolean;
  onSaveCurrentAsView?: () => void;
  isSavingCurrentAsView?: boolean;
  isMarketplace?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; colors: string }
> = {
  PUBLISHED: {
    icon: CheckCircle,
    label: "active_status",
    colors: "text-green-500 bg-green-100 dark:bg-green-900/30",
  },
  DRAFT: {
    icon: Clock,
    label: "draft_status",
    colors: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
  },
  ARCHIVED: {
    icon: Archive,
    label: "archived_status",
    colors: "text-gray-400 bg-gray-100 dark:bg-gray-800",
  },
};

const formatShortDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));

const formatUpdatedDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

interface ViewCardProps {
  view: IView;
  isActive: boolean;
  isDark: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isActivating: boolean;
}

function ViewCard({
  view,
  isActive,
  isDark,
  onActivate,
  onEdit,
  onDelete,
  isActivating,
}: ViewCardProps) {
  const { t } = useTranslation("content");
  const status = view.isActive ? "PUBLISHED" : view.status;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const Icon = cfg.icon;
  const name = view.viewName || `View (${formatShortDate(view.createdAt)})`;
  const updated = view.updatedAt
    ? formatUpdatedDate(view.updatedAt)
    : formatUpdatedDate(view.createdAt);
  const topicCount = view.siteTopics?.length ?? 0;

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 transition-all",
        isActive
          ? isDark
            ? "border-teal-700 bg-teal-900/20"
            : "border-teal-200 bg-teal-50"
          : isDark
            ? "border-gray-700 bg-gray-800 hover:border-gray-600"
            : "border-gray-200 bg-white hover:border-gray-300",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                "text-sm font-semibold truncate",
                isDark ? "text-gray-200" : "text-gray-800",
              )}
            >
              {name}
            </span>
            <span
              className={clsx(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                cfg.colors,
              )}
            >
              <Icon className="w-3 h-3" />
              {t(cfg.label)}
            </span>
          </div>
          <p
            className={clsx(
              "text-xs mt-1",
              isDark ? "text-gray-500" : "text-gray-400",
            )}
          >
            {t("topics_count", { count: topicCount })} ·{" "}
            {t("updated_on", { date: updated })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!isActive && (
            <button
              onClick={onActivate}
              disabled={isActivating}
              title={t("set_as_active_view")}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60"
            >
              {isActivating ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              {t("activate")}
            </button>
          )}
          <button
            onClick={onEdit}
            title={t("edit_this_view")}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              isDark
                ? "text-gray-400 hover:bg-gray-700"
                : "text-gray-400 hover:bg-gray-100",
            )}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {!isActive && (
            <button
              onClick={onDelete}
              title={t("delete_this_view")}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Drawer (list of all views) ────────────────────────────────────────────── */

interface DrawerProps {
  views: IView[];
  isLoading: boolean;
  isDark: boolean;
  websiteName: string;
  onClose: () => void;
  onViewSelect: (view: IView) => void;
  onRefetch: () => void;
  onRefetchTemplate?: () => void;
  onOpenWizard: () => void;
  onEditView: (view: IView) => void;
}

function ViewDrawer({
  views,
  isLoading,
  isDark,
  websiteName,
  onClose,
  onViewSelect: _onViewSelect,
  onRefetch,
  onRefetchTemplate,
  onOpenWizard,
  onEditView,
}: DrawerProps) {
  const { t } = useTranslation("content");
  const [activateView] = useActivateViewMutation();
  const [deleteContent] = useDeleteContentMutation();
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IView | null>(null);

  const handleActivate = async (view: IView) => {
    setActivatingId(view._id);
    try {
      await activateView({ viewId: view._id }).unwrap();
      toast.success(
        t("toast_view_activated", { name: view.viewName || t("view") }),
      );
      onRefetch();
      if (onRefetchTemplate) {
        onRefetchTemplate();
      }
      onClose();
    } catch (err: any) {
      console.error("[ViewManager] Activation failed:", {
        viewId: view._id,
        error: err?.data?.message || err?.message,
      });
      toast.error(
        err?.data?.message || err?.message || t("toast_activate_view_error"),
      );
    } finally {
      setActivatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContent({ eventId: deleteTarget._id }).unwrap();
      toast.success(t("toast_view_deleted"));
      onRefetch();
    } catch (err: any) {
      toast.error(err?.data?.message || t("toast_delete_view_error"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className={clsx(
          "relative z-10 flex flex-col w-full max-w-sm shadow-2xl h-full overflow-hidden",
          isDark
            ? "bg-gray-900 border-l border-gray-700"
            : "bg-white border-l border-gray-200",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={clsx(
            "flex items-center justify-between px-4 py-3 border-b shrink-0",
            isDark
              ? "border-gray-700 bg-gray-800/60"
              : "border-gray-100 bg-gray-50",
          )}
        >
          <div className="flex items-center gap-2">
            <LayoutTemplate
              className={clsx(
                "w-4 h-4",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            />
            <span
              className={clsx(
                "text-sm font-semibold",
                isDark ? "text-gray-200" : "text-gray-800",
              )}
            >
              {t("views_for", { name: websiteName })}
            </span>
          </div>
          <button
            onClick={onClose}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              isDark
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-400",
            )}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={clsx(
                    "h-16 rounded-xl animate-pulse",
                    isDark ? "bg-gray-800" : "bg-gray-100",
                  )}
                />
              ))}
            </div>
          )}

          {!isLoading && views.length === 0 && (
            <div
              className={clsx(
                "text-center py-12 text-sm",
                isDark ? "text-gray-500" : "text-gray-400",
              )}
            >
              <LayoutTemplate className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{t("no_views_yet")}</p>
              <p className="text-xs mt-1">{t("create_first_view_wizard")}</p>
            </div>
          )}

          {!isLoading &&
            views.map((view) => (
              <ViewCard
                key={view._id}
                view={view}
                isActive={view.isActive}
                isDark={isDark}
                isActivating={activatingId === view._id}
                onActivate={() => handleActivate(view)}
                onEdit={() => onEditView(view)}
                onDelete={() => setDeleteTarget(view)}
              />
            ))}
        </div>

        {/* Footer */}
        <div
          className={clsx(
            "p-3 border-t shrink-0",
            isDark ? "border-gray-700" : "border-gray-200",
          )}
        >
          <button
            onClick={onOpenWizard}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("create_new_view")}
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          open
          title={t("delete_view")}
          message={t("delete_view_confirm_message", {
            name: deleteTarget.viewName || t("this_view"),
          })}
          confirmText={t("delete")}
          cancelText={t("cancel")}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>,
    document.body,
  );
}

/* ─── Exported ViewManagerPanel ────────────────────────────────────────────── */

export default function ViewManagerPanel({
  views,
  isLoading,
  externalApiId,
  websiteName,
  onViewSelect: _onViewSelect,
  onRefetch,
  onRefetchTemplate,
  hasUnsavedContent = false,
  onSaveCurrentAsView,
  isSavingCurrentAsView = false,
  isMarketplace = false,
}: Props) {
  const { t } = useTranslation("content");
  const { isDark } = useThemeClasses();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingView, setEditingView] = useState<IView | null>(null);

  const activeView = views.find((v) => v.isActive);
  const noActiveView = !isLoading && views.length > 0 && !activeView;

  const handleWizardCreated = (_viewId: string, publishNow: boolean) => {
    setShowWizard(false);
    setShowDrawer(false);
    setEditingView(null);

    toast.success(
      publishNow ? t("toast_view_live") : t("toast_view_draft_saved"),
    );

    // Trigger refetch to update the views list and the active template
    onRefetch();
    if (onRefetchTemplate) {
      onRefetchTemplate();
    }
  };

  const handleEditView = (view: IView) => {
    // Ensure we're using fresh data by refetching the view before opening the wizard
    // This prevents showing stale topics/categories that were deleted
    onRefetch();
    setEditingView(view);
    setShowDrawer(false);
    setShowWizard(true);
  };

  const handleOpenWizardSafely = () => {
    if (hasUnsavedContent && onSaveCurrentAsView) {
      onSaveCurrentAsView();
      toast.info(t("toast_current_layout_saved_draft"));
    }
    setShowDrawer(false);
    setShowWizard(true);
  };

  return (
    <>
      {/* Compact bar shown inside ContentComposer header */}
      <div
        className={clsx(
          "flex items-center gap-2 px-3 py-2 rounded-lg border mt-2",
          noActiveView
            ? isDark
              ? "border-amber-700/50 bg-amber-900/10"
              : "border-amber-200 bg-amber-50"
            : isDark
              ? "border-gray-700 bg-gray-800/40"
              : "border-gray-200 bg-gray-50",
        )}
      >
        <LayoutTemplate
          className={clsx(
            "w-4 h-4 shrink-0",
            isDark ? "text-gray-500" : "text-gray-400",
          )}
        />

        {isLoading ? (
          <Loader className="w-3.5 h-3.5 animate-spin text-gray-400" />
        ) : activeView ? (
          <>
            <span
              className={clsx(
                "text-xs font-medium flex-1 truncate",
                isDark ? "text-gray-300" : "text-gray-700",
              )}
            >
              {activeView.viewName || t("active_view")}
            </span>
            <span className="flex items-center gap-1 text-xs text-green-500 font-medium shrink-0">
              <CheckCircle className="w-3 h-3" />
              {t("live")}
            </span>
          </>
        ) : views.length === 0 ? (
          <span
            className={clsx(
              "text-xs flex-1",
              isDark ? "text-gray-500" : "text-gray-400",
            )}
          >
            {t("no_views_yet")}
          </span>
        ) : (
          <span className="text-xs flex-1 text-amber-600 dark:text-amber-400 font-medium">
            {t("no_active_view_warning")}
          </span>
        )}

        {/* Manage / Create buttons */}
        {views.length > 0 ? (
          <button
            onClick={() => setShowDrawer(true)}
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors shrink-0",
              isDark
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-100",
            )}
          >
            {t("manage")} <ChevronDown className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={handleOpenWizardSafely}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors shrink-0"
          >
            <Plus className="w-3 h-3" />
            {t("new_view")}
          </button>
        )}
      </div>

      {/* No active view warning — commented out: duplicate of the main bar message + Manage button above */}
      {/* {noActiveView && (...)} */}

      {/* Save current layout banner — shown when no views exist but content is present */}
      {!isLoading && views.length === 0 && hasUnsavedContent && (
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-lg border mt-1 text-xs",
            isDark
              ? "border-blue-700/40 bg-blue-900/10 text-blue-300"
              : "border-blue-200 bg-blue-50 text-blue-700",
          )}
        >
          <LayoutTemplate className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1">{t("unsaved_layout_warning")}</span>
          <button
            onClick={onSaveCurrentAsView}
            disabled={isSavingCurrentAsView}
            className={clsx(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium border transition-colors shrink-0 disabled:opacity-50",
              isDark
                ? "border-blue-600 text-blue-300 hover:bg-blue-900/40"
                : "border-blue-300 text-blue-700 hover:bg-blue-100",
            )}
          >
            {isSavingCurrentAsView ? (
              <Loader className="w-3 h-3 animate-spin" />
            ) : null}
            {t("save_as_view")}
          </button>
        </div>
      )}

      {/* Views drawer */}
      {showDrawer && (
        <ViewDrawer
          views={views}
          isLoading={isLoading}
          isDark={isDark}
          websiteName={websiteName}
          onClose={() => setShowDrawer(false)}
          onViewSelect={_onViewSelect}
          onRefetch={onRefetch}
          onRefetchTemplate={onRefetchTemplate}
          onOpenWizard={handleOpenWizardSafely}
          onEditView={handleEditView}
        />
      )}

      {/* Wizard — create or edit */}
      {showWizard && (
        <CreateViewWizard
          externalApiId={externalApiId}
          websiteName={websiteName}
          existingView={editingView ?? undefined}
          isMarketplace={isMarketplace}
          onClose={() => {
            setShowWizard(false);
            setEditingView(null);
          }}
          onCreated={handleWizardCreated}
        />
      )}
    </>
  );
}
