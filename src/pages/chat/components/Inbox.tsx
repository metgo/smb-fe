import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Users, Megaphone, Search, Volume2, VolumeX, Mail } from "lucide-react";
import type { Conversation, Message } from "../types";
import { MockChatDatabase } from "../mockDb";
import type { MockUser } from "../mockDb";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface InboxProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string, highlightMessageId?: string) => void;
  currentUser: MockUser | null;
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
  onOpenNewDm,
  onOpenNewGroup,
  onOpenNewBroadcast,
  collapsed = false,
}) => {
  const { isDark, textPrimary, textSecondary, borderColor, inputClasses } = useThemeClasses();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ message: Message; conversation: Conversation }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle right-click context menu for muting conversations
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; convId: string } | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Debounced search logic for global search (Story 8)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      const allMsgs = MockChatDatabase.getAllMessages();
      const results: { message: Message; conversation: Conversation }[] = [];

      // Filter messages containing the query (excluding system and deleted ones)
      allMsgs.forEach((msg) => {
        if (msg.isSystem || msg.isDeleted) return;

        const matchesText = msg.text.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Search file attachments names (Story 8: "Searching for a file name finds messages with matching attachments.")
        const matchesFile = msg.attachments?.some((att) => 
          att.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (matchesText || matchesFile) {
          // Find which conversation this message belongs to
          const convId = (msg as any).conversationId;
          const conv = conversations.find((c) => c.id === convId);
          // Only return message if current user is a member of that conversation
          if (conv && currentUser && conv.members.includes(currentUser.id)) {
            results.push({ message: msg, conversation: conv });
          }
        }
      });

      setSearchResults(results);
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, conversations, currentUser]);

  const handleRightClick = (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      convId,
    });
  };

  const handleToggleMute = (convId: string) => {
    if (!currentUser) return;
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    const currentMuted = conv.mutedBy || [];
    let nextMuted: string[];
    if (currentMuted.includes(currentUser.id)) {
      nextMuted = currentMuted.filter((id) => id !== currentUser.id);
    } else {
      nextMuted = [...currentMuted, currentUser.id];
    }

    const updatedConvs = conversations.map((c) => 
      c.id === convId ? { ...c, mutedBy: nextMuted } : c
    );
    MockChatDatabase.saveConversations(updatedConvs);
    // Force trigger render via local storage update event
    window.dispatchEvent(new Event("metgo_chat_settings_changed"));
    setContextMenu(null);
  };

  const isMuted = (conv: Conversation) => {
    return currentUser && conv.mutedBy?.includes(currentUser.id);
  };

  // Helper to format timestamps nicely
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Calculate unread count for a conversation
  const getUnreadCount = (conv: Conversation): number => {
    if (!currentUser) return 0;
    const msgs = MockChatDatabase.getMessagesForConversation(conv.id);
    // Count messages where sender is not current user and readBy does not contain current user
    return msgs.filter((m) => !m.isSystem && m.senderId !== currentUser.id && !m.readBy.includes(currentUser.id)).length;
  };

  // Determine permissions for buttons
  const isSuperOrAdmin = currentUser && ["superadmin", "admin"].includes(currentUser.role);
  const canCreateGroup = currentUser && ["superadmin", "admin", "dmo", "authority", "authorityAdmin"].includes(currentUser.role);

  return (
    <div className={`border-r ${borderColor} ${isDark ? 'bg-gray-900' : 'bg-white'} flex flex-col h-full shrink-0 relative select-none transition-all duration-300 ${collapsed ? 'w-16' : 'w-full md:w-80'}`}>
      {collapsed ? (
        /* Collapsed state - show only icons */
        <div className="flex flex-col items-center py-4 gap-4">
          <button
            onClick={onOpenNewDm}
            title="New DM"
            className={`p-2 ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} rounded-lg cursor-pointer`}
          >
            <Mail className="w-5 h-5" />
          </button>
          {canCreateGroup && (
            <button
              onClick={onOpenNewGroup}
              title="New Group Chat"
              className={`p-2 ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} rounded-lg cursor-pointer`}
            >
              <Users className="w-5 h-5" />
            </button>
          )}
          {isSuperOrAdmin && (
            <button
              onClick={onOpenNewBroadcast}
              title="Create Broadcast Channel"
              className={`p-2 ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} rounded-lg cursor-pointer`}
            >
              <Megaphone className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        /* Expanded state - show full interface */
        <>
          {/* Top search & title */}
          <div className={`p-4 border-b ${borderColor} space-y-3`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Chats
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenNewDm}
                  title="New DM"
                  className={`p-1.5 ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} rounded-lg cursor-pointer`}
                >
                  <Mail className="w-4 h-4" />
                </button>
                {canCreateGroup && (
                  <button
                    onClick={onOpenNewGroup}
                    title="New Group Chat"
                    className={`p-1.5 ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} rounded-lg cursor-pointer`}
                  >
                    <Users className="w-4 h-4" />
                  </button>
                )}
                {isSuperOrAdmin && (
                  <button
                    onClick={onOpenNewBroadcast}
                    title="Create Broadcast Channel"
                    className={`p-1.5 ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} rounded-lg cursor-pointer`}
                  >
                    <Megaphone className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages or files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-1.5 text-sm ${inputClasses} rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500`}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
        {searchQuery.trim().length >= 2 ? (
          // Global Search Results View
          <div className="p-2 space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
              Message Search Results ({searchResults.length})
            </p>
            {isSearching && searchResults.length === 0 ? (
              <p className="text-xs text-center py-4 text-gray-400">Searching...</p>
            ) : searchResults.length > 0 ? (
              searchResults.map(({ message, conversation }) => (
                <button
                  key={message.id}
                  onClick={() => {
                    onSelectConversation(conversation.id, message.id);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors flex flex-col gap-1 border ${isDark ? 'border-gray-800' : 'border-gray-100'} cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${textSecondary} truncate`}>
                      {conversation.name}
                    </span>
                    <span className="text-[9px] text-gray-400 shrink-0">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className={`text-[11px] font-semibold text-teal-600 ${isDark ? 'dark:text-teal-400' : ''}`}>
                    {message.senderName}:
                  </p>
                  <p className={`text-xs ${textSecondary} line-clamp-2`}>
                    {message.text}
                  </p>
                  {message.attachments && message.attachments.length > 0 && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      📎 {message.attachments.map((a) => a.name).join(", ")}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <p className="text-xs text-center py-4 text-gray-400">No results. Try at least 2 characters.</p>
            )}
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((conv) => {
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

            // Visual Icons for groups/broadcasts
            const IconComponent = isBroadcast ? (
              <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-blue-950 text-blue-400' : 'bg-blue-100 text-blue-600'} flex items-center justify-center shrink-0`}>
                <Megaphone className="w-5 h-5" />
              </div>
            ) : conv.type === "group" ? (
              <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-teal-950 text-teal-400' : 'bg-teal-100 text-teal-600'} flex items-center justify-center shrink-0`}>
                <Users className="w-5 h-5" />
              </div>
            ) : (
              <img
                src={conv.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${conv.name}`}
                alt={conv.name}
                className={`w-10 h-10 rounded-full border ${isDark ? 'border-gray-800 bg-gray-800' : 'border-gray-250 bg-gray-50'} shrink-0 object-cover`}
              />
            );

            return (
              <div
                key={conv.id}
                onContextMenu={(e) => handleRightClick(e, conv.id)}
                className={`relative px-4 py-3 flex items-center gap-3 transition-colors select-none ${
                  active
                    ? `${isDark ? 'bg-teal-950/20 text-teal-100' : 'bg-teal-50 text-teal-950'} border-l-4 border-teal-500`
                    : `${isDark ? 'hover:bg-gray-850' : 'hover:bg-gray-50'} cursor-pointer`
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                {IconComponent}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${textPrimary} truncate flex items-center gap-1.5`}>
                      {conv.name}
                      {isBroadcast && (
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'} border border-blue-200/50`}>
                          Broadcast
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {conv.lastMessage ? formatTime(conv.lastMessage.timestamp) : ""}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-0.5 gap-2">
                    <p className={`text-xs truncate flex-1 ${unreadCount > 0 ? `font-bold ${textPrimary}` : textSecondary}`}>
                      {previewText || <span className="italic text-gray-400">No messages yet</span>}
                    </p>
                    <div className="flex items-center gap-1">
                      {isConvMuted && <VolumeX className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
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
            <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
            <p className={`text-sm ${textSecondary} font-medium`}>No conversations yet.</p>
            <button
              onClick={onOpenNewDm}
              className="mt-3 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Start Conversation
            </button>
          </div>
        )}
      </div>

      {/* Right-click Mute/Unmute Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className={`fixed z-50 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${borderColor} rounded-lg shadow-lg py-1 min-w-[120px]`}
        >
          <button
            onClick={() => handleToggleMute(contextMenu.convId)}
            className={`w-full text-left px-3 py-1.5 text-xs ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center gap-2 cursor-pointer`}
          >
            {conversations.find((c) => c.id === contextMenu.convId)?.mutedBy?.includes(currentUser?.id || "") ? (
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
