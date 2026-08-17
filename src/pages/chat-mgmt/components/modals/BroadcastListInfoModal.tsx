import clsx from "clsx";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Clock,
  Megaphone,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";

import { getApiErrorMessage, getInitials, timeAgo } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";
import {
  useBroadcastListDetailsQuery,
  useBroadcastMessagesQuery,
  useUpdateBroadcastListMutation,
  useAddBroadcastMembersMutation,
  useRemoveBroadcastMemberMutation,
  useDeleteBroadcastListMutation,
} from "@/store/api/chatSystemApi";
import type { ModalProps } from "./types";
import { ModalHeader } from "./ModalHeader";

interface BroadcastListInfoModalProps extends ModalProps {
  broadcastListId: string;
  currentUser: IChatUser | null;
  chatUsers: IChatUser[];
  onDeleted?: () => void;
}

export const BroadcastListInfoModal: React.FC<BroadcastListInfoModalProps> = ({
  isOpen,
  onClose,
  broadcastListId,
  currentUser,
  chatUsers,
  onDeleted,
}) => {
  const { t } = useTranslation("chat");
  const {
    isDark,
    borderColor,
    inputClasses,
    textPrimary,
    textSecondary,
    hoverBg,
  } = useThemeClasses();

  const { data: list, isFetching } = useBroadcastListDetailsQuery(
    broadcastListId,
    { skip: !isOpen || !broadcastListId },
  );
  const [updateBroadcastList] = useUpdateBroadcastListMutation();
  const [addBroadcastMembers] = useAddBroadcastMembersMutation();
  const [removeBroadcastMember] = useRemoveBroadcastMemberMutation();
  const [deleteBroadcastList, { isLoading: isDeleting }] =
    useDeleteBroadcastListMutation();

  const [mode, setMode] = useState<"info" | "add" | "history">("info");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const { data: history, isFetching: isHistoryFetching } =
    useBroadcastMessagesQuery(
      { broadcastListId, page: 1, limit: 10 },
      { skip: mode !== "history" || !broadcastListId },
    );

  useEffect(() => {
    if (list) {
      setName(list.name);
      setDescription(list.description || "");
    }
  }, [list]);

  useEffect(() => {
    if (!isOpen) {
      setMode("info");
      setIsEditingName(false);
      setSearch("");
      setSelectedMembers([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Owner-only, except SUPERADMIN who can manage any list.
  const isOwner = list && currentUser?._id === list.createdById;
  const isSuperAdmin = currentUser?.role === "superadmin";
  const canManage = isOwner || isSuperAdmin;

  const handleSaveName = async () => {
    if (!list) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t("broadcast_name_required"));
      return;
    }
    if (trimmed.length > 60) {
      toast.error(t("broadcast_name_max_length"));
      return;
    }
    if (trimmed === list.name) {
      setIsEditingName(false);
      return;
    }
    try {
      await updateBroadcastList({ broadcastListId, name: trimmed }).unwrap();
      setIsEditingName(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("failed_to_update_broadcast_list")),
      );
    }
  };

  const handleSaveDescription = async () => {
    if (!list || description === (list.description || "")) return;
    try {
      await updateBroadcastList({ broadcastListId, description }).unwrap();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("failed_to_update_broadcast_list")),
      );
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeBroadcastMember({ broadcastListId, userId }).unwrap();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("failed_to_remove_member")));
    }
  };

  const toggleSelectedMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;
    try {
      await addBroadcastMembers({
        broadcastListId,
        memberIds: selectedMembers,
      }).unwrap();
      setSelectedMembers([]);
      setSearch("");
      setMode("info");
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("failed_to_add_members")));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBroadcastList(broadcastListId).unwrap();
      onDeleted?.();
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("failed_to_delete_broadcast_list")),
      );
    }
  };

  const existingIds = new Set(list?.members.map((m) => m._id) || []);
  const addableUsers = chatUsers.filter((u) => {
    if (existingIds.has(u._id)) return false;
    const term = search.toLowerCase();
    return u.name.toLowerCase().includes(term);
  });

  const roleBadgeClasses: Record<TUserRole, string> = {
    superadmin: isDark
      ? "bg-purple-900/30 text-purple-400"
      : "bg-purple-50 text-purple-700",
    authority: isDark
      ? "bg-amber-900/30 text-amber-400"
      : "bg-amber-50 text-amber-700",
    dmo: isDark ? "bg-teal-900/30 text-teal-400" : "bg-teal-50 text-teal-700",
    traveller: isDark
      ? "bg-gray-800 text-gray-300"
      : "bg-gray-100 text-gray-600",
  };

  const modalTitle =
    mode === "add"
      ? t("broadcast_recipients_selected", { count: selectedMembers.length })
      : mode === "history"
        ? t("broadcast_send_history")
        : t("broadcast_list_info");

  return (
    <ModalWrapper
      onClose={onClose}
      showSpinner={isDeleting}
      maxWidth="max-w-md"
      height="h-[85dvh] md:h-max"
    >
      <ModalHeader title={modalTitle} />
      <div className="flex-1 overflow-y-auto p-4">
        {isFetching && !list ? (
          <p className={clsx("text-sm text-center py-8", textSecondary)}>
            {t("loading")}
          </p>
        ) : !list ? (
          <p className={clsx("text-sm text-center py-8", textSecondary)}>
            {t("failed_to_load_broadcast_list")}
          </p>
        ) : mode === "add" ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("search_contacts")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={clsx(
                  "w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm",
                  inputClasses,
                  "focus:outline-hidden focus:ring-2 focus:ring-teal-500",
                )}
              />
            </div>
            <div
              className={clsx(
                "max-h-72 overflow-y-auto space-y-1.5 border rounded-lg p-2",
                borderColor,
              )}
            >
              {addableUsers.length > 0 ? (
                addableUsers.map((user) => {
                  const isSelected = selectedMembers.includes(user._id);
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => toggleSelectedMember(user._id)}
                      className={clsx(
                        "w-full flex items-center justify-between p-2 rounded-md text-left transition-colors cursor-pointer",
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-50",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={clsx(
                            "w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs border",
                            isDark
                              ? "bg-gray-800 border-gray-700 text-gray-200"
                              : "bg-gray-100 border-gray-200 text-gray-600",
                          )}
                        >
                          {getInitials(user?.name)}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={clsx(
                              "text-sm font-semibold truncate",
                              textPrimary,
                            )}
                          >
                            {user.name}
                          </p>
                          <p className="text-[11px] text-gray-400 capitalize truncate">
                            {user.role}
                          </p>
                        </div>
                      </div>
                      <div
                        className={clsx(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-teal-500 border-teal-500 text-white"
                            : isDark
                              ? "border-gray-700"
                              : "border-gray-300",
                        )}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 stroke-3" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-center py-4 text-xs text-gray-400">
                  {t("no_contacts_found")}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMode("info");
                  setSelectedMembers([]);
                  setSearch("");
                }}
                className={clsx(
                  "flex-1 py-2.5 border rounded-lg text-sm font-semibold transition-colors cursor-pointer",
                  borderColor,
                  textSecondary,
                  hoverBg,
                )}
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleAddMembers}
                disabled={selectedMembers.length === 0}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                {t("add_members_button")}
              </button>
            </div>
          </div>
        ) : mode === "history" ? (
          <div className="space-y-3">
            <button
              onClick={() => setMode("info")}
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              {t("close_history")}
            </button>
            {isHistoryFetching && !history ? (
              <p className={clsx("text-sm text-center py-8", textSecondary)}>
                {t("loading")}
              </p>
            ) : history && history.data.length > 0 ? (
              <div className="space-y-2">
                {history.data.map((entry) => (
                  <div
                    key={entry._id}
                    className={clsx(
                      "p-3 rounded-lg border text-sm",
                      borderColor,
                    )}
                  >
                    <p className={clsx("truncate", textPrimary)}>
                      {entry.content}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span
                        className={clsx(
                          "text-[11px] flex items-center gap-1",
                          textSecondary,
                        )}
                      >
                        <Clock className="w-3 h-3" />
                        {timeAgo(entry.createdAt)}
                      </span>
                      <span className={clsx("text-[11px]", textSecondary)}>
                        {t("broadcast_sent_ratio", {
                          sent: entry.sentCount,
                          total: entry.sentCount + entry.failedCount,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-xs text-gray-400">
                {t("no_broadcast_history")}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={clsx(
                  "w-16 h-16 rounded-full border flex items-center justify-center",
                  borderColor,
                  isDark
                    ? "bg-gray-800 text-gray-200"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                <Megaphone className="w-7 h-7" />
              </div>

              {isEditingName ? (
                <div className="w-full flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    className={clsx(
                      "flex-1 px-3 py-2 border rounded-lg text-sm",
                      inputClasses,
                      "focus:outline-hidden focus:ring-2 focus:ring-teal-500",
                    )}
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setName(list.name);
                      setIsEditingName(false);
                    }}
                    className={clsx(
                      "p-2 rounded-lg border cursor-pointer",
                      borderColor,
                      hoverBg,
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  disabled={!canManage}
                  onClick={() => canManage && setIsEditingName(true)}
                  className={clsx(
                    "text-base font-bold",
                    textPrimary,
                    canManage && "cursor-pointer hover:underline",
                  )}
                >
                  {list.name}
                </button>
              )}

              <p className={clsx("text-xs", textSecondary)}>
                {t("members_count", { count: list.memberCount })}
              </p>
            </div>

            <div>
              <label
                className={clsx(
                  "block text-xs font-semibold mb-1",
                  textSecondary,
                )}
              >
                {t("description_optional")}
              </label>
              <textarea
                rows={2}
                disabled={!canManage}
                placeholder={t("broadcast_description_placeholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSaveDescription}
                className={clsx(
                  "w-full px-3 py-2.5 border rounded-lg text-sm resize-none disabled:opacity-70",
                  inputClasses,
                  "focus:outline-hidden focus:ring-2 focus:ring-teal-500",
                )}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  className={clsx("block text-xs font-semibold", textSecondary)}
                >
                  {t("members_count", { count: list.memberCount })}
                </label>
                {canManage && (
                  <button
                    onClick={() => setMode("add")}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {t("add_members_button")}
                  </button>
                )}
              </div>
              <div
                className={clsx(
                  "space-y-1 border rounded-lg p-2 max-h-64 overflow-y-auto",
                  borderColor,
                )}
              >
                {list.members.length === 0 ? (
                  <p className="text-center py-4 text-xs text-gray-400">
                    {t("no_members_yet")}
                  </p>
                ) : (
                  list.members.map((m) => (
                    <div
                      key={m._id}
                      className="flex items-center justify-between gap-2 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={clsx(
                            "w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs border",
                            isDark
                              ? "bg-gray-800 border-gray-700 text-gray-200"
                              : "bg-gray-100 border-gray-200 text-gray-600",
                          )}
                        >
                          {getInitials(m.name)}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={clsx(
                              "text-sm font-semibold truncate",
                              textPrimary,
                            )}
                          >
                            {m.name}
                          </p>
                          <span
                            className={clsx(
                              "px-1.5 py-0.5 text-[9px] font-bold rounded-full capitalize",
                              roleBadgeClasses[m.role],
                            )}
                          >
                            {m.role}
                          </span>
                        </div>
                      </div>
                      {canManage && (
                        <button
                          onClick={() => handleRemoveMember(m._id)}
                          title={t("remove_member")}
                          className={clsx(
                            "p-1.5 rounded-full cursor-pointer transition-colors shrink-0 text-destructive",
                            isDark ? "hover:bg-red-950/20" : "hover:bg-red-50",
                          )}
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {canManage && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={clsx(
                  "w-full py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 border",
                  isDark
                    ? "border-red-900 text-red-400 hover:bg-red-950/20"
                    : "border-red-200 text-red-600 hover:bg-red-50",
                )}
              >
                <Trash2 className="w-4 h-4" />
                {t("delete_broadcast_list")}
              </button>
            )}
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
