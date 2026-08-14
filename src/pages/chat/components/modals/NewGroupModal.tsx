import clsx from "clsx";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getInitials } from "@/helpers";
import { Search, ShieldAlert, Check } from "lucide-react";

import type { ModalProps } from "./types";
import { ModalHeader } from "./ModalHeader";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";

interface NewGroupModalProps extends ModalProps {
  currentUser: IChatUser | null;
  onGroupCreated: (
    groupName: string,
    description: string,
    memberIds: string[],
  ) => void;
  chatUsers: IChatUser[];
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onGroupCreated,
  chatUsers,
}) => {
  const { t } = useTranslation("chat");
  const { isDark, borderColor, inputClasses, textPrimary, textSecondary } =
    useThemeClasses();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Group creation is only for ADMIN, SUPERADMIN, DMO, AUTHORITY. Travellers cannot.
  const isEligible =
    currentUser &&
    ["superadmin", "dmo", "authority"].includes(currentUser.role);

  const filtered = chatUsers.filter((u) => {
    const term = search.toLowerCase();
    const userName = u.name;
    return userName.toLowerCase().includes(term);
  });

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
      return;
    }
    if (name.length > 60) {
      setError(t("group_name_max_length"));
      return;
    }
    if (selectedMembers.length < 2) {
      setError(t("group_min_members"));
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
      maxWidth="max-w-md"
      height="h-[85dvh] md:h-max"
    >
      <ModalHeader title={t("create_group_chat")} />
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
          <div>
            <label
              className={clsx(
                "block text-xs font-semibold mb-1",
                textSecondary,
              )}
            >
              {t("add_members_selected", { count: selectedMembers.length })}
            </label>
            <div className="relative mb-2">
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
                "max-h-45 overflow-y-auto space-y-1.5 border rounded-lg p-2",
                borderColor,
              )}
            >
              {filtered.length > 0 ? (
                filtered.map((user) => {
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
          </div>

          <button
            onClick={handleCreate}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer mt-4"
          >
            {t("create_group")}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
