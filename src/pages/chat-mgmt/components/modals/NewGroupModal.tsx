import clsx from "clsx";
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getInitials } from "@/helpers";
import { Search, ShieldAlert, Check, SlidersHorizontal } from "lucide-react";

import type { ModalProps } from "./types";
import { ModalHeader } from "./ModalHeader";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";
import { useChatUserPicker } from "../../hooks/useChatUserPicker";
import { ChatUsersFilterDropdown } from "../ChatUsersFilterDropdown";
import { ChatUserRowSkeleton, ChatUserRoleBadge } from "../sub-components";

interface NewGroupModalProps extends ModalProps {
  currentUser: IChatUser | null;
  onGroupCreated: (
    groupName: string,
    description: string,
    memberIds: string[],
  ) => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onGroupCreated,
}) => {
  const { t } = useTranslation("chat");
  const { isDark, borderColor, inputClasses, textPrimary, textSecondary } =
    useThemeClasses();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

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

  const userSectionRef = useRef<HTMLDivElement>(null);

  const handleToggleFilterPopover = () => {
    setShowFilterPopover((v) => {
      const next = !v;
      if (next) {
        setTimeout(() => {
          userSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 50);
      }
      return next;
    });
  };

  // Group creation is only for ADMIN, SUPERADMIN, DMO, AUTHORITY. Travellers cannot.
  const isEligible =
    currentUser &&
    ["superadmin", "dmo", "authority"].includes(currentUser.role);

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== id));
    } else {
      if (selectedMembers.length >= 49) {
        setError(t("group_max_members"));
        return;
      }
      setSelectedMembers([...selectedMembers, id]);
    }
    setError("");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError(t("group_name_required"));
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      nameInputRef.current?.focus();
      return;
    }
    if (name.length > 60) {
      setError(t("group_name_max_length"));
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      nameInputRef.current?.focus();
      return;
    }
    if (selectedMembers.length < 2) {
      setError(t("group_min_members"));
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onGroupCreated(name.trim(), description.trim(), selectedMembers);
    // Reset state
    setName("");
    setDescription("");
    setSelectedMembers([]);
    setError("");
    onClose();
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
              {t("traveller_not_authorized_group")}
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
      maxWidth="max-w-xl"
      height="h-auto max-h-[85dvh] md:max-h-[85vh]"
    >
      <ModalHeader title={t("create_group_chat")} />
      <div ref={contentRef} className="flex-1 overflow-y-auto p-4 min-h-0">
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

          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label
                className={clsx(
                  "block text-xs font-semibold mb-1",
                  textSecondary,
                )}
              >
                {t("group_name_char_count", { count: name.length })}
              </label>
              <input
                ref={nameInputRef}
                type="text"
                maxLength={60}
                placeholder={t("group_name_placeholder")}
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
                placeholder={t("group_description_placeholder")}
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

          {/* Member selection */}
          <div ref={userSectionRef}>
            <label
              className={clsx(
                "block text-xs font-semibold mb-1",
                textSecondary,
              )}
            >
              {t("add_members_selected", { count: selectedMembers.length })}
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
                  onClick={handleToggleFilterPopover}
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
                "max-h-88 overflow-y-auto mt-2 space-y-1.5 border rounded-lg p-2",
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
                              "w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs",
                              isDark
                                ? "bg-gray-800 border-gray-700 text-gray-200"
                                : "bg-gray-100 border-gray-200 text-gray-600",
                              "border",
                            )}
                          >
                            {getInitials(user?.name)}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={clsx(
                                "text-sm font-semibold",
                                textPrimary,
                                "truncate",
                              )}
                            >
                              {user.name}
                            </p>
                            <ChatUserRoleBadge
                              role={user.role}
                              isDark={isDark}
                              className="mt-0.5"
                            />
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
        </div>
      </div>
      <div className={clsx("p-4 border-t shrink-0", borderColor)}>
        <button
          onClick={handleCreate}
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          {t("create_group")}
        </button>
      </div>
    </ModalWrapper>
  );
};
