import React, { useState, useEffect } from "react";
import { X, Search, ShieldAlert, Check } from "lucide-react";
import { getPermittedUsersToMessage, MOCK_USERS } from "../mockDb";
import type { MockUser } from "../mockDb";
import { UserRole } from "@/enums/user.types";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal Wrapper for styling consistency
const ModalWrapper: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const { isDark, borderColor, textPrimary } = useThemeClasses();
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300">
      <div className={`relative w-full max-w-md ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-2xl border ${borderColor} overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${borderColor} ${isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-1 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} rounded-lg transition-colors cursor-pointer`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};

// 1. NEW DM MODAL
interface NewDmModalProps extends ModalProps {
  currentUser: MockUser | null;
  onStartChat: (recipientId: string) => void;
}

export const NewDmModal: React.FC<NewDmModalProps> = ({ isOpen, onClose, currentUser, onStartChat }) => {
  const { isDark, borderColor, inputClasses, textPrimary, textSecondary } = useThemeClasses();
  const [search, setSearch] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const permitted = getPermittedUsersToMessage(currentUser);

  const filtered = permitted.filter((u) => {
    const term = search.toLowerCase();
    const nameMatch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(term);
    const emailMatch = u.email.toLowerCase().includes(term);
    const roleMatch = u.role.toLowerCase().includes(term);
    return nameMatch || emailMatch || roleMatch;
  });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="New Direct Message">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={handleSearchChange}
            className={`w-full pl-9 pr-4 py-2 ${inputClasses} rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm`}
          />
        </div>

        {/* User List */}
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onStartChat(user.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} cursor-pointer`}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.firstName}`}
                  alt={user.firstName}
                  className={`w-10 h-10 rounded-full border ${borderColor} ${isDark ? 'bg-gray-800' : 'bg-gray-50'} shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${textPrimary} truncate`}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className={`text-xs ${textSecondary} truncate`}>{user.email}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isDark ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700'} capitalize`}>
                  {user.role}
                </span>
              </button>
            ))
          ) : (
            <p className={`text-center py-8 text-sm ${textSecondary}`}>
              No matching contacts found under your hierarchy permissions.
            </p>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

// 2. NEW GROUP MODAL
interface NewGroupModalProps extends ModalProps {
  currentUser: MockUser | null;
  onGroupCreated: (groupName: string, description: string, memberIds: string[]) => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, onClose, currentUser, onGroupCreated }) => {
  const { isDark, borderColor, inputClasses, textPrimary, textSecondary } = useThemeClasses();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [error, setError] = useState("");

  const permitted = getPermittedUsersToMessage(currentUser);

  // Group creation is only for ADMIN, SUPERADMIN, DMO, AUTHORITY. Travellers cannot.
  const isEligible = currentUser && ["superadmin", "admin", "dmo", "authority", "authorityAdmin"].includes(currentUser.role);

  const filtered = permitted.filter((u) => {
    const term = search.toLowerCase();
    return `${u.firstName} ${u.lastName}`.toLowerCase().includes(term);
  });

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== id));
    } else {
      if (selectedMembers.length >= 49) {
        setError("Maximum group size (50 members) reached.");
        return;
      }
      setSelectedMembers([...selectedMembers, id]);
    }
    setError("");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Group name is required");
      return;
    }
    if (name.length > 60) {
      setError("Group name must be 60 characters or less");
      return;
    }
    if (selectedMembers.length < 2) {
      setError("Add at least 2 members to create a group");
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
    return (
      <ModalWrapper isOpen={isOpen} onClose={onClose} title="Access Restricted">
        <div className="text-center py-6 space-y-4">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
          <p className={`text-sm ${textSecondary}`}>
            Traveller role users are not authorized to create group chats.
          </p>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Create Group Chat">
      <div className="space-y-4 text-left">
        {error && (
          <div className={`p-3 text-xs ${isDark ? 'bg-red-950/20 text-red-400 border-red-900' : 'bg-red-50 text-red-600 border-red-200'} rounded-lg`}>
            {error}
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>
              Group Name * ({name.length}/60)
            </label>
            <input
              type="text"
              maxLength={60}
              placeholder="e.g. Regional Coordination"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className={`w-full px-3 py-2 border ${inputClasses} rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What this group is for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 border ${inputClasses} rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 resize-none`}
            />
          </div>
        </div>

        {/* Member selection */}
        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>
            Add Members (Selected: {selectedMembers.length})
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border ${inputClasses} rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500`}
            />
          </div>

          <div className={`max-h-[160px] overflow-y-auto space-y-1.5 border ${borderColor} rounded-lg p-2 custom-scrollbar`}>
            {filtered.length > 0 ? (
              filtered.map((user) => {
                const isSelected = selectedMembers.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleMember(user.id)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-md text-left transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} cursor-pointer`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={user.avatar} className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-800 border-gray-850' : 'bg-gray-50 border-gray-100'}`} alt="" />
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${textPrimary} truncate`}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] text-gray-400 capitalize truncate">{user.role}</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected 
                        ? "bg-teal-500 border-teal-500 text-white" 
                        : isDark ? 'border-gray-700' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-center py-4 text-xs text-gray-400">No contacts found.</p>
            )}
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer mt-4"
        >
          Create Group
        </button>
      </div>
    </ModalWrapper>
  );
};

// 3. NEW BROADCAST CHANNEL MODAL
interface NewBroadcastModalProps extends ModalProps {
  currentUser: MockUser | null;
  onBroadcastCreated: (channelName: string, description: string, targetRole: UserRole) => void;
}

export const NewBroadcastModal: React.FC<NewBroadcastModalProps> = ({ isOpen, onClose, currentUser, onBroadcastCreated }) => {
  const { isDark, borderColor, inputClasses, textSecondary } = useThemeClasses();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetRole, setTargetRole] = useState<UserRole>("dmo");
  const [error, setError] = useState("");

  const isEligible = currentUser && ["superadmin", "admin"].includes(currentUser.role);

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
    return (
      <ModalWrapper isOpen={isOpen} onClose={onClose} title="Access Restricted">
        <div className="text-center py-6 space-y-4">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
          <p className={`text-sm ${textSecondary}`}>
            Only SUPERADMIN and ADMIN roles are authorized to create broadcast channels.
          </p>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="New Broadcast Channel">
      <div className="space-y-4 text-left">
        {error && (
          <div className={`p-3 text-xs ${isDark ? 'bg-red-950/20 text-red-400 border-red-900' : 'bg-red-50 text-red-600 border-red-200'} rounded-lg`}>
            {error}
          </div>
        )}

        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>
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
            className={`w-full px-3 py-2 ${inputClasses} rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500`}
          />
        </div>

        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>
            Target Audience Role
          </label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value as UserRole)}
            className={`w-full px-3 py-2 border ${borderColor} ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer`}
          >
            <option value="dmo">DMO (Destination Marketing Organization)</option>
            <option value="authority">AUTHORITY (Local Authority)</option>
            <option value="traveller">TRAVELLER (Business Owner/End-user)</option>
          </select>
        </div>

        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>
            Description (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="What announcements this channel broadcasts..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-3 py-2 ${inputClasses} rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 resize-none`}
          />
        </div>

        <button
          onClick={handleCreate}
          className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer mt-4"
        >
          Create Broadcast Channel
        </button>
      </div>
    </ModalWrapper>
  );
};

// 4. SILENCE USER MODAL
interface SilenceUserModalProps extends ModalProps {
  onSilence: (userId: string, duration: string, reason: string) => void;
}

export const SilenceUserModal: React.FC<SilenceUserModalProps> = ({ isOpen, onClose, onSilence }) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [duration, setDuration] = useState("24h");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const nonAdmins = MOCK_USERS.filter((u) => !["superadmin", "admin"].includes(u.role));

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

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Silence User Globally">
      <div className="space-y-4 text-left">
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Select User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setError("");
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="">-- Choose User --</option>
            {nonAdmins.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Silence Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="1h">1 Hour</option>
            <option value="24h">24 Hours (1 Day)</option>
            <option value="7d">7 Days (1 Week)</option>
            <option value="permanent">Permanent (Indefinite)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <button
          onClick={handleSilence}
          className="w-full py-2 bg-destructive text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer mt-4"
        >
          Silence User
        </button>
      </div>
    </ModalWrapper>
  );
};

// 5. DELETE MESSAGE MODAL (ADMIN MANDATORY REASON)
interface DeleteMessageModalProps extends ModalProps {
  onConfirm: (reason: string) => void;
}

export const DeleteMessageModal: React.FC<DeleteMessageModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("A deletion reason is required for moderation records.");
      return;
    }
    onConfirm(reason.trim());
    setReason("");
    setError("");
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Delete Message Moderation">
      <div className="space-y-4 text-left">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          As an Admin, deleting messages replaces the content globally and logs the action in the audit log. A deletion reason is mandatory.
        </p>
        
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Reason for Deletion *
          </label>
          <input
            type="text"
            placeholder="e.g. Offensive content or spam"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-semibold bg-destructive text-white rounded-lg hover:bg-destructive/95 cursor-pointer"
          >
            Delete message
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
