import clsx from "clsx";
import React, { useState } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";
// Removed MOCK_USERS
import { ModalHeader } from "./ModalHeader";
import type { ModalProps } from "./types";

interface SilenceUserModalProps extends ModalProps {
  onSilence: (userId: string, duration: string, reason: string) => void;
  chatUsers: any[];
}

export const SilenceUserModal: React.FC<SilenceUserModalProps> = ({
  isOpen,
  onClose,
  onSilence,
  chatUsers,
}) => {
  const { isDark, inputClasses, textSecondary } = useThemeClasses();
  const [selectedUser, setSelectedUser] = useState("");
  const [duration, setDuration] = useState("24h");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const nonAdmins = chatUsers.filter(
    (u) => !["superadmin", "admin"].includes(u.role || ""),
  );

  const handleSilence = () => {
    if (!selectedUser) {
      setError("Please select a user to silence");
      return;
    }
    if (!reason.trim()) {
      setError("Please specify a reason for silencing");
      return;
    }
    onSilence(selectedUser, duration, reason.trim());
    setSelectedUser("");
    setReason("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      onClose={onClose}
      maxWidth="max-w-md"
      height="h-[80dvh] md:h-[50vh]"
    >
      <ModalHeader title="Silence User Globally" />
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
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setError("");
              }}
              className={clsx(
                "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer",
                inputClasses,
              )}
            >
              <option value="">-- Choose User --</option>
              {nonAdmins.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim()}{" "}
                  ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={clsx(
                "block text-xs font-semibold mb-1",
                textSecondary,
              )}
            >
              Silence Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={clsx(
                "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer",
                inputClasses,
              )}
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours (1 Day)</option>
              <option value="7d">7 Days (1 Week)</option>
              <option value="permanent">Permanent (Indefinite)</option>
            </select>
          </div>

          <div>
            <label
              className={clsx(
                "block text-xs font-semibold mb-1",
                textSecondary,
              )}
            >
              Reason *
            </label>
            <input
              type="text"
              placeholder="e.g. Inappropriate language or policy violation"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              className={clsx(
                "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500",
                inputClasses,
              )}
            />
          </div>

          <button
            onClick={handleSilence}
            className="w-full py-2.5 bg-destructive hover:bg-destructive/90 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer mt-4"
          >
            Silence User
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
