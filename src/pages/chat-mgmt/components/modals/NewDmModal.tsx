import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal } from "lucide-react";

import { getInitials } from "@/helpers";
import type { ModalProps } from "./types";
import { ModalHeader } from "./ModalHeader";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";
import { useChatUserPicker } from "../../hooks/useChatUserPicker";
import { ChatUsersFilterPopover } from "../ChatUsersFilterPopover";
import { ChatUserRowSkeleton } from "../sub-components";

interface NewDmModalProps extends ModalProps {
  currentUser: IChatUser | null;
  onStartChat: (recipientId: string) => void;
  conversations?: IConversation[];
}

export const NewDmModal: React.FC<NewDmModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartChat,
  conversations = [],
}) => {
  const { t } = useTranslation("chat");
  const { isDark, borderColor, inputClasses, textPrimary, textSecondary } =
    useThemeClasses();

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

  // Users who already have a started DM conversation (pending DM shells with
  // no message yet are excluded, so they still show up here) are hidden —
  // starting a new chat with them belongs in the existing conversation.
  const dmMemberIds = new Set(
    conversations
      .filter(
        (c) =>
          c.type === "dm" &&
          !(c.id.startsWith("pending-dm-") && !c.lastMessage),
      )
      .flatMap((c) => c.members),
  );
  const filtered = chatUsers.filter((u) => !dmMemberIds.has(u._id));

  if (!isOpen) return null;

  return (
    <ModalWrapper
      onClose={onClose}
      maxWidth="max-w-md"
      height="h-[80dvh] md:h-[640px]"
    >
      <div className="flex h-full min-h-0 flex-col">
        <ModalHeader title={t("new_direct_message")} />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
          {/* Search + Filters */}
          <div className="flex items-start gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("search_contacts")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={clsx(
                  "w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border",
                  inputClasses,
                  "focus:outline-hidden focus:ring-2 focus:ring-teal-500",
                )}
              />
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowFilterPopover((v) => !v)}
                title={t("filters")}
                className={clsx(
                  "relative p-2.5 rounded-lg border cursor-pointer transition-colors",
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

              {showFilterPopover && (
                <ChatUsersFilterPopover
                  filters={filters}
                  onChange={setFilters}
                  onClose={() => setShowFilterPopover(false)}
                  lockDmo={lockDmo}
                  lockAuthority={lockAuthority}
                />
              )}
            </div>
          </div>

          <p className={clsx("text-xs font-medium shrink-0", textSecondary)}>
            {t("contacts_count", { count: filtered.length })}
          </p>

          {/* User List - scrollable */}
          <div
            ref={listRef}
            className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1"
          >
            {filtered.length > 0
              ? filtered.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      onStartChat(user._id);
                      onClose();
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-100",
                      "cursor-pointer",
                    )}
                  >
                    <div
                      className={clsx(
                        "w-12 h-12 rounded-full border shrink-0 flex items-center justify-center font-bold text-lg",
                        borderColor,
                        isDark
                          ? "bg-gray-800 text-gray-200"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {getInitials(user?.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          "text-sm font-semibold",
                          textPrimary,
                          "truncate",
                        )}
                      >
                        {user.name}
                      </p>
                      <p className={clsx("text-xs", textSecondary, "truncate")}>
                        {user.email}
                      </p>
                    </div>

                    <span
                      className={clsx(
                        "px-2 py-0.5 text-xs font-semibold rounded-full capitalize",
                        isDark
                          ? "bg-teal-900/30 text-teal-400"
                          : "bg-teal-50 text-teal-700",
                      )}
                    >
                      {user.role}
                    </span>
                  </button>
                ))
              : !isUsersFetching && (
                  <p
                    className={clsx("text-center py-8 text-sm", textSecondary)}
                  >
                    {t("no_matching_contacts")}
                  </p>
                )}

            {isUsersFetching && (
              <ChatUserRowSkeleton borderColor={borderColor} isDark={isDark} />
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
