import clsx from "clsx";
import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";

// MockUser removed
import { UserRole } from "@/enums/user.types";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";
import { ModalHeader } from "./ModalHeader";
import type { ModalProps } from "./types";

interface NewBroadcastModalProps extends ModalProps {
  currentUser: IChatUser | null;
  onBroadcastCreated: (
    channelName: string,
    description: string,
    targetRole: UserRole,
  ) => void;
}

export const NewBroadcastModal: React.FC<NewBroadcastModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onBroadcastCreated,
}) => {
  const { isDark, borderColor, inputClasses, textSecondary } =
    useThemeClasses();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetRole, setTargetRole] = useState<UserRole>("dmo");
  const [error, setError] = useState("");

  const isEligible =
    currentUser && ["superadmin", "admin"].includes(currentUser.role);

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Broadcast channel name is required");
      return;
    }
    onBroadcastCreated(name.trim(), description.trim(), targetRole);
    setName("");
    setDescription("");
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
        <ModalHeader title="Access Restricted" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
            <p className={`text-sm ${textSecondary}`}>
              Only SUPERADMIN and ADMIN roles are authorized to create broadcast
              channels.
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
      height="h-[80dvh] md:h-[50vh]"
    >
      <ModalHeader title="New Broadcast Channel" />
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

          <div>
            <label
              className={clsx(
                "block text-xs font-semibold mb-1",
                textSecondary,
              )}
            >
              Channel Name *
            </label>
            <input
              type="text"
              placeholder="e.g. DMO Policy Updates"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className={clsx(
                "w-full px-3 py-2.5 rounded-lg text-sm",
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
              Target Audience Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as UserRole)}
              className={clsx(
                "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer",
                borderColor,
                isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900",
              )}
            >
              <option value="dmo">
                DMO (Destination Marketing Organization)
              </option>
              <option value="authority">AUTHORITY (Local Authority)</option>
              <option value="traveller">
                TRAVELLER (Business Owner/End-user)
              </option>
            </select>
          </div>

          <div>
            <label
              className={clsx(
                "block text-xs font-semibold mb-1",
                textSecondary,
              )}
            >
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What announcements this channel broadcasts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={clsx(
                "w-full px-3 py-2.5 rounded-lg text-sm resize-none",
                inputClasses,
                "focus:outline-hidden focus:ring-2 focus:ring-teal-500",
              )}
            />
          </div>

          <button
            onClick={handleCreate}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer mt-4"
          >
            Create Broadcast Channel
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
