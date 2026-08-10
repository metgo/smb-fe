import clsx from "clsx";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Megaphone,
  Search,
  Volume2,
  VolumeX,
  Mail,
} from "lucide-react";

import { getInitials } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useUpdateConversationSettingsMutation } from "@/store/api/chatSystemApi";

interface InboxProps {
  conversations: IConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string, highlightMessageId?: string) => void;
  currentUser: IChatUser | null;
  chatUsers?: IChatUser[];
  onStartDm?: (recipientId: string) => void;
  onOpenNewDm: () => void;
  onOpenNewGroup: () => void;
  onOpenNewBroadcast: () => void;
  collapsed?: boolean;
}

export const Inbox: React.FC<InboxProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUser,
  chatUsers = [],
  onStartDm,
  onOpenNewDm,
  onOpenNewGroup,
  onOpenNewBroadcast,
  collapsed = false,
}) => {
  const {
    isDark,
    bgPrimary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
    inputClasses,
  } = useThemeClasses();

  const [searchQuery, setSearchQuery] = useState("");

  const [updateConversationSettings] = useUpdateConversationSettingsMutation();

  // Handle right-click context menu for muting conversations
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    convId: string;
  } | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Client-side filter over the already-loaded conversation list (no
  // dedicated message-search endpoint exists in the DM API)
  const filteredConversations = conversations.filter((conv) => {
    if (searchQuery.trim().length < 2) return true;
    const q = searchQuery.toLowerCase();
    return (
      conv.name.toLowerCase().includes(q) ||
      conv.lastMessage?.text.toLowerCase().includes(q)
    );
  });

  // Users who don't yet have a DM conversation with the current user —
  // shown as a "Contacts" list; clicking one starts/opens the DM.
  const dmMemberIds = new Set(
    conversations.filter((c) => c.type === "dm").flatMap((c) => c.members),
  );
  const usersWithoutConversation = chatUsers.filter((u) => {
    if (u._id === currentUser?._id) return false;
    if (dmMemberIds.has(u._id)) return false;
    if (searchQuery.trim().length < 2) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  });

  const handleRightClick = (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      convId,
    });
  };

  const handleToggleMute = async (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    setContextMenu(null);
    if (!conv || convId.startsWith("pending-dm-")) return;

    try {
      await updateConversationSettings({
        conversationId: convId,
        isMuted: !isMuted(conv),
      }).unwrap();
    } catch {
      toast.error("Failed to update conversation settings");
    }
  };

  const isMuted = (conv: IConversation) => {
    return !!currentUser && !!conv.mutedBy?.length;
  };

  // Helper to format timestamps nicely
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getUnreadCount = (conv: IConversation): number => conv.unreadCount || 0;

  // Determine permissions for buttons
  const isSuperOrAdmin =
    currentUser && ["superadmin", "admin"].includes(currentUser.role);
  const canCreateGroup =
    currentUser &&
    ["superadmin", "admin", "dmo", "authority", "authorityAdmin"].includes(
      currentUser.role,
    );

  return (
    <div
      className={clsx(
        "border-r flex flex-col h-full shrink-0 relative select-none transition-all duration-300",
        borderColor,
        bgPrimary,
        collapsed ? "w-16" : "w-full md:w-80 lg:w-96",
      )}
    >
      {collapsed ? (
        /* Collapsed state - show only icons */
        <div className="flex flex-col items-center py-4 gap-4">
          <button
            onClick={onOpenNewDm}
            title="New DM"
            className={clsx(
              "p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
              hoverBg,
            )}
          >
            <Mail className="w-5 h-5" />
          </button>
          {canCreateGroup && (
            <button
              onClick={onOpenNewGroup}
              title="New Group Chat"
              className={clsx(
                "p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                hoverBg,
              )}
            >
              <Users className="w-5 h-5" />
            </button>
          )}
          {isSuperOrAdmin && (
            <button
              onClick={onOpenNewBroadcast}
              title="Create Broadcast Channel"
              className={clsx(
                "p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                hoverBg,
              )}
            >
              <Megaphone className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        /* Expanded state - show full interface */
        <>
          {/* Top search & title */}
          <div className={clsx("p-4 border-b space-y-4", borderColor)}>
            <div className="flex items-center justify-between">
              <h2
                className={clsx(
                  "text-lg font-bold tracking-tight flex items-center gap-2",
                  textPrimary,
                )}
              >
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Chats
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenNewDm}
                  title="New DM"
                  className={clsx(
                    "p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                    hoverBg,
                    textTertiary,
                  )}
                >
                  <Mail className="w-4 h-4" />
                </button>
                {canCreateGroup && (
                  <button
                    onClick={onOpenNewGroup}
                    title="New Group Chat"
                    className={clsx(
                      "p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                      hoverBg,
                      textTertiary,
                    )}
                  >
                    <Users className="w-4 h-4" />
                  </button>
                )}
                {isSuperOrAdmin && (
                  <button
                    onClick={onOpenNewBroadcast}
                    title="Create Broadcast Channel"
                    className={clsx(
                      "p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
                      hoverBg,
                      textTertiary,
                    )}
                  >
                    <Megaphone className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="relative">
              <Search
                className={clsx(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                  textTertiary,
                )}
              />
              <input
                type="text"
                placeholder="Search messages or files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={clsx(
                  "w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all duration-200",
                  inputClasses,
                )}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const active = conv.id === activeConversationId;
                const unreadCount = getUnreadCount(conv);
                const isConvMuted = isMuted(conv);

                let previewText = conv.lastMessage
                  ? conv.lastMessage.isSystem
                    ? conv.lastMessage.text
                    : conv.lastMessage.text
                  : "";

                if (conv.lastMessage?.isDeleted) {
                  previewText = "This message was removed by an admin.";
                }

                // Truncate at 50 characters (Story 1)
                if (previewText.length > 50) {
                  previewText = previewText.substring(0, 50) + "...";
                }

                // Determine correct visual styling for broadcast channel
                const isBroadcast = conv.type === "broadcast";

                return (
                  <div
                    key={conv.id}
                    onContextMenu={(e) => handleRightClick(e, conv.id)}
                    className={clsx(
                      "relative px-4 py-3 flex items-center gap-3 transition-all duration-200 select-none cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                      active
                        ? clsx(
                            isDark
                              ? "bg-teal-950/30 text-teal-100 shadow-md shadow-teal-500/10"
                              : "bg-teal-50 text-teal-950 shadow-md shadow-teal-500/10",
                            "border-l-4 border-teal-500",
                          )
                        : clsx(hoverBg),
                    )}
                    onClick={() => onSelectConversation(conv.id)}
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
                      {getInitials(conv?.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={clsx(
                            "text-sm font-bold truncate flex items-center gap-1.5",
                            textPrimary,
                          )}
                        >
                          {conv.name}
                          {isBroadcast && (
                            <span
                              className={clsx(
                                "px-1.5 py-0.5 text-[9px] font-bold rounded-sm border border-blue-200/50",
                                isDark
                                  ? "bg-blue-900/30 text-blue-400"
                                  : "bg-blue-50 text-blue-700",
                              )}
                            >
                              Broadcast
                            </span>
                          )}
                        </span>
                        <span
                          className={clsx("text-[10px] shrink-0", textTertiary)}
                        >
                          {conv.lastMessage
                            ? formatTime(conv.lastMessage.timestamp)
                            : ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-0.5 gap-2">
                        <p
                          className={clsx(
                            "text-xs truncate flex-1",
                            unreadCount > 0
                              ? clsx("font-bold", textPrimary)
                              : textSecondary,
                          )}
                        >
                          {previewText || (
                            <span className={clsx("italic", textTertiary)}>
                              No messages yet
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-1">
                          {isConvMuted && (
                            <VolumeX
                              className={clsx(
                                "w-3.5 h-3.5 shrink-0",
                                textTertiary,
                              )}
                            />
                          )}
                          {unreadCount > 0 && (
                            <span className="min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-bold">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
                <MessageSquare
                  className={clsx("w-10 h-10 mb-2", textTertiary)}
                />
                <p className={clsx("text-sm font-medium", textSecondary)}>
                  No conversations yet.
                </p>
                <button
                  onClick={onOpenNewDm}
                  className="mt-3 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Start Conversation
                </button>
              </div>
            )}

            {/* Contacts without an existing conversation */}
            {usersWithoutConversation.length > 0 && (
              <div className={clsx("border-t pt-2 pb-1", borderColor)}>
                <p
                  className={clsx(
                    "text-[11px] font-semibold uppercase tracking-wider px-4 pb-1",
                    textTertiary,
                  )}
                >
                  Contacts
                </p>
                {usersWithoutConversation.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => onStartDm?.(user._id)}
                    className={clsx(
                      "w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 select-none cursor-pointer",
                      hoverBg,
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
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          "text-sm font-bold truncate",
                          textPrimary,
                        )}
                      >
                        {user.name}
                      </p>
                      <p className={clsx("text-xs truncate", textSecondary)}>
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right-click Mute/Unmute Context Menu */}
          {contextMenu && (
            <div
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className={clsx(
                "fixed z-50 border rounded-lg shadow-lg py-1 min-w-30",
                bgPrimary,
                borderColor,
              )}
            >
              <button
                onClick={() => handleToggleMute(contextMenu.convId)}
                className={clsx(
                  "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors",
                  textSecondary,
                  hoverBg,
                )}
              >
                {(() => {
                  const menuConv = conversations.find(
                    (c) => c.id === contextMenu.convId,
                  );
                  return menuConv && isMuted(menuConv);
                })() ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                    Unmute Chat
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-destructive" />
                    Mute Chat
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
