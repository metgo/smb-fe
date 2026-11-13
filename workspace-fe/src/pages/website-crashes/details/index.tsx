import clsx from "clsx";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Clock, Trash2 } from "lucide-react";

import { routes } from "@/lib/routes";
import { formatDate } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { TabsSection, Spinner } from "@/components/shared";
import { BackToListBtn } from "@/components/btns";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  useGetCrashByIdQuery,
  useDeleteCrashMutation,
} from "@/store/api/websiteCrashApi";
import { crashTabs } from "@/constants/tabs";
import {
  CrashErrorTab,
  CrashStackTab,
  CrashUserTab,
  CrashDeviceTab,
} from "./components";

export default function WebsiteCrashDetailsPage() {
  const [searchParams] = useSearchParams();
  const crashId = searchParams.get("crashId") ?? "";

  const { isDark, borderColor, textPrimary, textSecondary, textTertiary } =
    useThemeClasses();

  const [activeTab, setActiveTab] = useState("error");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: crash, isLoading } = useGetCrashByIdQuery(crashId, {
    skip: !crashId,
  });
  const [deleteCrash, { isLoading: deleting }] = useDeleteCrashMutation();

  const handleDelete = async () => {
    try {
      await deleteCrash(crashId).unwrap();
      toast.success("Crash report deleted");
      window.history.back();
    } catch {
      toast.error("Failed to delete crash report");
    }
  };

  const renderTab = () => {
    if (!crash) return null;
    switch (activeTab) {
      case "error":
        return <CrashErrorTab crash={crash} />;
      case "stack":
        return <CrashStackTab crash={crash} />;
      case "user":
        return <CrashUserTab crash={crash} />;
      case "device":
        return <CrashDeviceTab crash={crash} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden relative pt-10 md:pt-0">
      <Spinner isLoading={isLoading} />

      {/* Top row */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <BackToListBtn navPath={routes.websiteCrashes} />
        <button
          onClick={() => setConfirmDelete(true)}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>

      {/* Header card */}
      {crash && (
        <div
          className={clsx(
            "shrink-0 rounded-xl border px-5 py-4 flex flex-col gap-2 mb-4",
            borderColor,
            isDark ? "bg-gray-800/50" : "bg-gray-50",
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span
              className={clsx(
                "font-bold text-lg",
                isDark ? "text-red-300" : "text-red-600",
              )}
            >
              {crash.error?.name ?? "Error"}
            </span>
          </div>
          <p className={clsx("text-sm", textSecondary)}>
            {crash.error?.message}
          </p>
          <div
            className={clsx(
              "flex flex-wrap gap-x-5 gap-y-1 text-xs mt-1",
              textTertiary,
            )}
          >
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(crash.timestamp)}
            </span>
            {crash.timezone && <span>{crash.timezone}</span>}
            <span className={clsx("font-mono", textPrimary)}>
              ID: {crash._id}
            </span>
          </div>
        </div>
      )}

      {/* Tabs + content */}
      <div className="mt-2 flex flex-col flex-1 min-h-0">
        <div className="shrink-0">
          <TabsSection
            tabs={crashTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 pt-4">{renderTab()}</div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        variant="danger"
        title="delete_crash_title"
        message="delete_crash_message"
        confirmText="delete"
        cancelText="cancel"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
