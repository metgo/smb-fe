import clsx from "clsx";
import { toast } from "sonner";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ShieldAlert, Check, SlidersHorizontal } from "lucide-react";

import { getApiErrorMessage, getInitials } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";
import { useCreateBroadcastListMutation } from "@/store/api/chatSystemApi";
import { ModalHeader } from "./ModalHeader";
import type { ModalProps } from "./types";
import { useChatUserPicker } from "../../hooks/useChatUserPicker";
import { ChatUsersFilterDropdown } from "../ChatUsersFilterDropdown";
import { ChatUserRowSkeleton } from "../sub-components";

interface NewBroadcastModalProps extends ModalProps {
  currentUser: IChatUser | null;
  onBroadcastCreated: (broadcastList: IChatBroadcastList) => void;
}

export const NewBroadcastModal: React.FC<NewBroadcastModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onBroadcastCreated,
}) => {
  const { t } = useTranslation("chat");
  const { isDark, borderColor, inputClasses, textPrimary, textSecondary } =
    useThemeClasses();
  const [createBroadcastList, { isLoading }] = useCreateBroadcastListMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [error, setError] = useState("");

  const {
    users: chatUsers,
    isFetching: isUsersFetching,
    listRef,
    search,
    setSearch,
    filters,
    setFilters,
    showFilterPopover,
    setShowFilterPopover,
    appliedFilterCount,
    lockDmo,
    lockAuthority,
  } = useChatUserPicker(currentUser, isOpen);

  // Only SUPERADMIN/DMO/AUTHORITY may manage broadcast lists — TRAVELLER
  // gets a 403 on every broadcast endpoint.
  const isEligible =
    currentUser &&
    ["superadmin", "dmo", "authority"].includes(currentUser.role);

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
    setError("");
  };

  const resetState = () => {
    setName("");
    setDescription("");
    setSelectedMembers([]);
    setError("");
  };

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t("broadcast_name_required"));
      return;
    }
    if (trimmedName.length > 60) {
      setError(t("broadcast_name_max_length"));
      return;
    }
    if (selectedMembers.length === 0) {
      setError(t("broadcast_min_members"));
      return;
    }
    try {
      const list = await createBroadcastList({
        name: trimmedName,
        description: description.trim() || undefined,
        memberIds: selectedMembers,
      }).unwrap();
      resetState();
      onClose();
      onBroadcastCreated(list);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, t("failed_to_create_broadcast_list")),
      );
    }
  };

  if (!isEligible) {
    if (!isOpen) return null;
    return (
      <ModalWrapper
        onClose={onClose}
        maxWidth="max-w-md"
        height="max-h-[85vh] md:max-h-[50vh]"
      >
        <ModalHeader title={t("access_restricted")} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
            <p className={`text-sm ${textSecondary}`}>
              {t("only_admin_can_create_broadcast")}
            </p>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  if (!isOpen) return null;

  return (
    <ModalWrapper
      onClose={onClose}
      showSpinner={isLoading}
      maxWidth="max-w-md"
      height="h-[85dvh] md:h-max"
    >
      <ModalHeader title={t("new_broadcast_list")} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 text-left">
          {error && (
            <div
              className={clsx(
                "p-3 text-xs rounded-lg border",
                isDark
                  ? "bg-red-950/20 text-red-400 border-red-900"
                  : "bg-red-50 text-red-600 border-red-200",
              )}
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label
                className={clsx(
                  "block text-xs font-semibold mb-1",
                  textSecondary,
                )}
              >
                {t("broadcast_name_char_count", { count: name.length })}
              </label>
              <input
                type="text"
                maxLength={60}
                placeholder={t("broadcast_name_placeholder")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                className={clsx(
                  "w-full px-3 py-2.5 border rounded-lg text-sm",
                  inputClasses,
                  "focus:outline-hidden focus:ring-2 focus:ring-teal-500",
                )}
              />
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
                placeholder={t("broadcast_description_placeholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={clsx(
                  "w-full px-3 py-2.5 border rounded-lg text-sm resize-none",
                  inputClasses,
                  "focus:outline-hidden focus:ring-2 focus:ring-teal-500",
                )}
              />
            </div>
          </div>

          <div>
            <label
              className={clsx(
                "block text-xs font-semibold mb-1",
                textSecondary,
              )}
            >
              {t("broadcast_recipients_selected", {
                count: selectedMembers.length,
              })}
            </label>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="relative flex-1">
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

                <button
                  type="button"
                  onClick={() => setShowFilterPopover((v) => !v)}
                  title={t("filters")}
                  className={clsx(
                    "relative p-2.5 rounded-lg border cursor-pointer transition-colors shrink-0",
                    borderColor,
                    appliedFilterCount > 0
                      ? isDark
                        ? "bg-teal-900/30 text-teal-400 border-teal-700"
                        : "bg-teal-50 text-teal-700 border-teal-300"
                      : isDark
                        ? "text-gray-400 hover:bg-gray-800"
                        : "text-gray-500 hover:bg-gray-100",
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {appliedFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-bold">
                      {appliedFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {showFilterPopover && (
                <ChatUsersFilterDropdown
                  filters={filters}
                  onChange={setFilters}
                  lockDmo={lockDmo}
                  lockAuthority={lockAuthority}
                />
              )}
            </div>

            <div
              ref={listRef}
              className={clsx(
                "max-h-45 overflow-y-auto mt-2 space-y-1.5 border rounded-lg p-2",
                borderColor,
              )}
            >
              {chatUsers.length > 0
                ? chatUsers.map((user) => {
                    const isSelected = selectedMembers.includes(user._id);
                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => toggleMember(user._id)}
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
                            "w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0",
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
                : !isUsersFetching && (
                    <p className="text-center py-4 text-xs text-gray-400">
                      {t("no_contacts_found")}
                    </p>
                  )}

              {isUsersFetching && (
                <ChatUserRowSkeleton
                  borderColor={borderColor}
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer mt-4"
          >
            {t("create_broadcast_list_button")}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
