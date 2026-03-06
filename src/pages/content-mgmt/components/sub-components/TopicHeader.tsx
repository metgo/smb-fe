import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Edit2,
  Eye,
  EyeClosed,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface TopicHeaderProps {
  topic: {
    index: number;
    name: string;
    isHidden: boolean | undefined;
  };
  onRename: (topicIdx: number, newName: string) => void;
  onToggleVisibility: (topicIdx: number) => void;
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  setTopicToDelete: React.Dispatch<React.SetStateAction<number | null>>;
}

const TopicHeader = ({
  topic,
  onRename,
  onToggleVisibility,
  setTopicToDelete,
  setShowDeleteConfirm,
}: TopicHeaderProps) => {
  const { isDark } = useThemeClasses();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(topic.name);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation("content");
  // Keep editValue in sync if topic.name changes externally
  useEffect(() => {
    setEditValue(topic.name);
  }, [topic.name]);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const handleRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== topic.name) {
      onRename(topic.index, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(topic.name);
    setIsEditing(false);
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors",
        isDark
          ? "bg-gray-800/70 border-gray-700 text-gray-100"
          : "bg-linear-to-r from-slate-50 to-gray-50 border-gray-200 text-gray-900",
      )}
    >
      <span
        className={clsx(
          "shrink-0 w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center",
          isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600",
        )}
      >
        {topic.index + 1}
      </span>

      {isEditing ? (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") handleCancel();
            }}
            className={clsx(
              "h-8 text-sm flex-1 min-w-60",
              isDark
                ? "bg-gray-900 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900",
            )}
            autoFocus
          />
          <button
            onClick={handleRename}
            className={clsx(
              "p-1.5 rounded bg-green-400 text-white hover:shadow-md",
            )}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className={clsx("p-1.5 rounded bg-red-400 text-white")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <h3
            className={clsx(
              "flex-1 text-sm font-semibold truncate min-w-60",
              isDark ? "text-gray-100" : "text-gray-800",
            )}
          >
            {topic.name}
          </h3>

          <div ref={menuRef} className="relative shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu((v) => !v)}
              className={clsx(
                "h-7 w-7 p-0 rounded-md transition-colors",
                isDark
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
              )}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {showMenu && (
              <div
                className={clsx(
                  "absolute right-0 top-8 z-50 w-44 rounded-lg border shadow-lg overflow-hidden",
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <button
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    isDark
                      ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                >
                  <Edit2 className="w-3.5 h-3.5 shrink-0" />
                  {t("rename_topic")}
                </button>

                <button
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    isDark
                      ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  onClick={() => {
                    onToggleVisibility(topic.index);
                    setShowMenu(false);
                  }}
                >
                  {topic.isHidden ? (
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <EyeClosed className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {topic.isHidden ? t("show_topic") : t("hide_topic")}
                </button>

                <div
                  className={clsx(
                    "mx-3 my-1 h-px",
                    isDark ? "bg-gray-700" : "bg-gray-100",
                  )}
                />

                <button
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    isDark
                      ? "text-red-400 hover:bg-gray-700 hover:text-red-300"
                      : "text-red-600 hover:bg-red-50 hover:text-red-700",
                  )}
                  onClick={() => {
                    setShowMenu(false);
                    setTopicToDelete(topic.index);
                    setShowDeleteConfirm(true);
                    // onDelete(topic.index);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  {t("delete_topic")}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TopicHeader;
