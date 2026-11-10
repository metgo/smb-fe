import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Eye,
  EyeClosed,
  Loader2,
  MoreVertical,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import ColorPickerField from "./ColorPickerField";
import { LUCIDE_ICONS } from "../../utils/lucideIcons";

interface TopicHeaderProps {
  topic: {
    index: number;
    name: string;
    nameHe?: string | null;
    nameAr?: string | null;
    isHidden: boolean | undefined;
    isPrimary: boolean | undefined;
    colors?: string[];
    icon?: string | null;
  };
  onRename: (topicIdx: number, newName: string) => void | Promise<void>;
  isRenaming?: boolean;
  onToggleVisibility: (topicIdx: number) => void;
  onTogglePrimary: (topicIdx: number) => void;
  onColorChange?: (topicIdx: number, colors: string[]) => void;
  onApplyColorToChildren?: (topicIdx: number, colors: string[]) => void;
  onIconChange?: (topicIdx: number, icon: string) => void;
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  setTopicToDelete: React.Dispatch<React.SetStateAction<number | null>>;
}

const TopicHeader = ({
  topic,
  onRename,
  isRenaming = false,
  onToggleVisibility,
  onTogglePrimary,
  onColorChange,
  onApplyColorToChildren,
  onIconChange,
  setTopicToDelete,
  setShowDeleteConfirm,
}: TopicHeaderProps) => {
  const { t, i18n } = useTranslation("content");
  const { isDark } = useThemeClasses();
  const displayName =
    i18n.language === "he"
      ? topic.nameHe || topic.name
      : i18n.language === "ar"
        ? topic.nameAr || topic.name
        : topic.name;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayName);
  const [showMenu, setShowMenu] = useState(false);
  const [applyToChildren, setApplyToChildren] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const iconPanelRef = useRef<HTMLDivElement>(null);
  const iconPopupId = useRef(Math.random().toString(36));
  const [iconPopupPos, setIconPopupPos] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);

  useEffect(() => {
    if (!isEditing) setEditValue(displayName);
  }, [displayName, isEditing]);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  useEffect(() => {
    if (!iconPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        iconPickerRef.current &&
        !iconPickerRef.current.contains(e.target as Node) &&
        iconPanelRef.current &&
        !iconPanelRef.current.contains(e.target as Node)
      )
        setIconPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [iconPickerOpen]);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail.id !== iconPopupId.current)
        setIconPickerOpen(false);
    };
    document.addEventListener("popup-opened", handler);
    return () => document.removeEventListener("popup-opened", handler);
  }, []);

  useEffect(() => {
    if (!iconPickerOpen) {
      setIconPopupPos(null);
      return;
    }
    const raf = requestAnimationFrame(() => {
      if (!iconPickerRef.current) return;
      const rect = iconPickerRef.current.getBoundingClientRect();
      const PANEL_W = 288;
      const top = rect.bottom + 4;
      if (rect.left + PANEL_W > window.innerWidth - 8) {
        setIconPopupPos({ top, right: window.innerWidth - rect.right });
      } else {
        setIconPopupPos({ top, left: rect.left });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [iconPickerOpen]);

  const openIconPicker = () => {
    setIconPickerOpen((prev) => {
      if (!prev)
        document.dispatchEvent(
          new CustomEvent("popup-opened", {
            detail: { id: iconPopupId.current },
          }),
        );
      return !prev;
    });
  };

  const handleSelectIcon = (icon: string) => {
    onIconChange?.(topic.index, icon);
    setIconPickerOpen(false);
  };

  const handleRename = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== displayName) {
      await onRename(topic.index, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(displayName);
    setIsEditing(false);
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors",
        isDark
          ? "bg-gray-800/70 border-gray-700 text-gray-100"
          : "bg-linear-to-r from-slate-50 to-gray-50 border-gray-200 text-gray-900",
      )}
    >
      {/* Index badge */}
      <span
        className={clsx(
          "shrink-0 w-5 h-5 rounded-full text-xs font-semibold flex items-center justify-center",
          isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600",
        )}
      >
        {topic.index + 1}
      </span>

      {/* Icon selector */}
      <div ref={iconPickerRef} className="relative shrink-0">
        <button
          onClick={openIconPicker}
          title="Change icon"
          className={clsx(
            "w-6 h-6 rounded flex items-center justify-center transition-all duration-200",
            "hover:scale-105 active:scale-95",
            iconPickerOpen
              ? isDark
                ? "border-blue-400 bg-blue-900/40"
                : "border-blue-400 bg-blue-50"
              : isDark
                ? "border-gray-600 bg-gray-700/80 hover:border-gray-400 hover:bg-gray-600"
                : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50",
          )}
        >
          {(() => {
            const found = LUCIDE_ICONS.find(({ name }) => name === topic.icon);
            if (!found)
              return (
                <span className="text-base font-light text-gray-400">+</span>
              );
            return (
              <found.Icon
                className={clsx(
                  "w-4 h-4",
                  isDark ? "text-gray-200" : "text-gray-700",
                )}
              />
            );
          })()}
        </button>

        {iconPickerOpen &&
          iconPopupPos &&
          createPortal(
            <div
              ref={iconPanelRef}
              style={{
                position: "fixed",
                top: iconPopupPos.top,
                left: iconPopupPos.left,
                right: iconPopupPos.right,
                zIndex: 9999,
              }}
              className={clsx(
                "rounded-xl border shadow-2xl w-72 overflow-hidden",
                "animate-in fade-in slide-in-from-top-2 duration-150",
                isDark
                  ? "bg-gray-900 border-gray-700 shadow-black/60"
                  : "bg-white border-gray-200 shadow-gray-300/60",
              )}
            >
              <div
                className={clsx(
                  "flex items-center justify-between px-3 py-2 border-b",
                  isDark
                    ? "border-gray-700 bg-gray-800/60"
                    : "border-gray-100 bg-gray-50",
                )}
              >
                <span
                  className={clsx(
                    "text-xs font-semibold tracking-wide uppercase",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  {t("select_icon")}
                </span>
                <button
                  onClick={() => setIconPickerOpen(false)}
                  className={clsx(
                    "p-0.5 rounded transition-colors",
                    isDark
                      ? "text-gray-500 hover:text-gray-300 hover:bg-gray-700"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-200",
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2 max-h-56 overflow-y-auto">
                <div className="grid grid-cols-7 gap-0.5">
                  {LUCIDE_ICONS.map(({ name, Icon }) => {
                    const isSelected = topic.icon === name;
                    return (
                      <button
                        key={name}
                        onClick={() => handleSelectIcon(name)}
                        title={name}
                        className={clsx(
                          "relative w-9 h-9 rounded-lg flex items-center justify-center",
                          "transition-all duration-150 hover:scale-110 active:scale-95",
                          isSelected
                            ? isDark
                              ? "bg-blue-600/30 ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900"
                              : "bg-blue-50 ring-2 ring-blue-400 ring-offset-1 ring-offset-white"
                            : isDark
                              ? "hover:bg-gray-700/80"
                              : "hover:bg-gray-100",
                        )}
                      >
                        <Icon
                          className={clsx(
                            "w-5 h-5 transition-opacity",
                            isDark ? "text-gray-200" : "text-gray-700",
                            isSelected ? "opacity-100" : "opacity-60",
                          )}
                        />
                        {isSelected && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-400 rounded-full border-2 border-white dark:border-gray-900" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>

      {isEditing ? (
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Input
            value={editValue}
            disabled={isRenaming}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") handleCancel();
            }}
            className={clsx(
              "h-7 text-sm flex-1 min-w-0",
              isDark
                ? "bg-gray-900 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900",
            )}
            autoFocus
          />
          <button
            onClick={handleRename}
            disabled={isRenaming}
            className="shrink-0 p-1 rounded bg-green-400 text-white hover:shadow-md disabled:opacity-60"
          >
            {isRenaming ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isRenaming}
            className="shrink-0 p-1 rounded bg-red-400 text-white disabled:opacity-60"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <>
          {/* Title — click to rename inline */}
          <h3
            onClick={() => {
              setEditValue(displayName);
              setIsEditing(true);
            }}
            className={clsx(
              "flex-1 min-w-0 text-sm font-semibold truncate cursor-pointer rounded px-1 -mx-1 transition-colors",
              isDark
                ? "text-gray-100 hover:bg-gray-700/60"
                : "text-gray-800 hover:bg-gray-200/60",
            )}
          >
            {displayName}
            {topic.isPrimary && (
              <Star className="inline-block align-middle ml-1 w-3 h-3 text-yellow-400 fill-yellow-400" />
            )}
          </h3>

          {/* Right controls — grouped so they stay together */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ColorPickerField
              title={topic.name}
              colors={topic.colors ?? []}
              onChange={(colors) => {
                onColorChange?.(topic.index, colors);
                if (applyToChildren)
                  onApplyColorToChildren?.(topic.index, colors);
              }}
            />

            {onApplyColorToChildren && (
              <label className="flex items-center gap-1 cursor-pointer">
                <Checkbox
                  checked={applyToChildren}
                  onCheckedChange={(checked) => {
                    const next = checked === true;
                    setApplyToChildren(next);
                    if (next)
                      onApplyColorToChildren(topic.index, topic.colors ?? []);
                  }}
                  className={clsx(
                    "h-3 w-3 border",
                    isDark ? "border-white" : "border-black bg-white",
                  )}
                />
                <span
                  className={clsx(
                    "hidden sm:inline text-[10px] leading-tight font-bold select-none whitespace-nowrap",
                    isDark ? "text-gray-200" : "text-gray-800",
                  )}
                >
                  {t("apply_same")}
                </span>
              </label>
            )}

            <div ref={menuRef} className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu((v) => !v)}
                className={clsx(
                  "h-6 w-6 p-0 rounded-md transition-colors",
                  isDark
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
                )}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>

              {showMenu && (
                <div
                  className={clsx(
                    "absolute right-0 top-7 z-50 w-44 rounded-lg border shadow-lg overflow-hidden",
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

                  <button
                    className={clsx(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                      isDark
                        ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    )}
                    onClick={() => {
                      onTogglePrimary(topic.index);
                      setShowMenu(false);
                    }}
                  >
                    <Star
                      className={clsx(
                        "w-3.5 h-3.5 shrink-0",
                        topic.isPrimary
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-400",
                      )}
                    />
                    {topic.isPrimary
                      ? t("unset_primary_topic")
                      : t("set_primary_topic")}
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
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    {t("delete_topic")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TopicHeader;
