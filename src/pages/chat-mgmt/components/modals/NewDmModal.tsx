import clsx from "clsx";
import React, { useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getInitials } from "@/helpers";
import type { ModalProps } from "./types";
import { ModalHeader } from "./ModalHeader";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";

interface NewDmModalProps extends ModalProps {
  currentUser: IChatUser | null;
  onStartChat: (recipientId: string) => void;
  chatUsers: IChatUser[];
  conversations?: IConversation[];
}

export const NewDmModal: React.FC<NewDmModalProps> = ({
  isOpen,
  onClose,
  onStartChat,
  chatUsers,
  conversations = [],
}) => {
  const { t } = useTranslation("chat");
  const { isDark, borderColor, inputClasses, textPrimary, textSecondary } =
    useThemeClasses();
  const [search, setSearch] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

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
  const availableUsers = chatUsers.filter((u) => !dmMemberIds.has(u._id));

  const filtered = availableUsers.filter((u) => {
    const term = search.toLowerCase();
    const userName = u.name;
    const nameMatch = userName.toLowerCase().includes(term);
    const emailMatch = u.email?.toLowerCase().includes(term);
    const roleMatch = u.role?.toLowerCase().includes(term);
    return nameMatch || emailMatch || roleMatch;
  });

  if (!isOpen) return null;

  return (
    <ModalWrapper
      onClose={onClose}
      maxWidth="max-w-md"
      height="h-[80dvh] md:h-max"
    >
      <div className="flex h-full min-h-0 flex-col">
        <ModalHeader title={t("new_direct_message")} />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
          {/* Search */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_by_name_email_or_role")}
              value={search}
              onChange={handleSearchChange}
              className={clsx(
                "w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border",
                inputClasses,
                "focus:outline-hidden focus:ring-2 focus:ring-teal-500",
              )}
            />
          </div>

          <p className={clsx("text-xs font-medium shrink-0", textSecondary)}>
            {t("contacts_count", { count: filtered.length })}
          </p>

          {/* User List - scrollable */}
          <div className="max-h-90 flex-1 overflow-y-auto pr-1 space-y-1">
            {filtered.length > 0 ? (
              filtered.map((user) => (
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
            ) : (
              <p className={clsx("text-center py-8 text-sm", textSecondary)}>
                {t("no_matching_contacts")}
              </p>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
