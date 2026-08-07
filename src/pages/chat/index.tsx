import clsx from "clsx";
import {
  ShieldAlert,
  Eye,
  Shield,
  UserX,
  AlertTriangle,
  FileText,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { Inbox } from "./components/Inbox";
import { ChatWindow } from "./components/ChatWindow";
import {
  NewDmModal,
  NewGroupModal,
  NewBroadcastModal,
  SilenceUserModal,
} from "./components/modals";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { Conversation, ModerationLogEntry, SilenceState } from "./types";
import { useChatUsersQuery } from "@/store/api/chatSystemApi";

export default function ChatPage() {
  const {
    bgSecondary,
    bgPrimary,
    bgTertiary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
    isDark,
  } = useThemeClasses();

  const {
    data: chatUsers,
    isLoading,
    isFetching,
  } = useChatUsersQuery({ page: 1, limit: 200 });
  const chatUsersList = Array.isArray(chatUsers)
    ? chatUsers
    : chatUsers?.data || [];
  console.log("🚀 ~ ChatPage ~ chatUsers:", chatUsers);

  // Debug active profile selection (for visual testing)
  const [activeDebugProfile, setActiveDebugProfile] =
    useState<string>("user-superadmin");
  const [currentUser, setCurrentUser] = useState<IChatUser | null>(null);

  // Core Chat State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  // Navigation for mobile responsive view
  const [showInbox, setShowInbox] = useState(true);

  // Desktop sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Search Highlight Message (Story 8)
  const [highlightMessageId, setHighlightMessageId] = useState<
    string | undefined
  >(undefined);

  // Modals Visibility
  const [modalOpen, setModalOpen] = useState<{
    newDm: boolean;
    newGroup: boolean;
    newBroadcast: boolean;
    silence: boolean;
    settings: boolean;
  }>({
    newDm: false,
    newGroup: false,
    newBroadcast: false,
    silence: false,
    settings: false,
  });

  // Admin and Moderation Tabs
  const [activeSubTab, setActiveSubTab] = useState<
    "chat" | "admin_view" | "mod_logs" | "settings"
  >("chat");
  const [silences, setSilences] = useState<SilenceState[]>([]);
  const [logs, setLogs] = useState<ModerationLogEntry[]>([]);

  // Set active user profile based on debug selection
  useEffect(() => {
    const user =
      chatUsersList.find((u: IChatUser) => u._id === activeDebugProfile) ||
      null;
    setCurrentUser(user);
    setActiveConversationId(null);
    setShowInbox(true);
  }, [activeDebugProfile, chatUsersList]);

  // Load chat records
  const loadChatRecords = useCallback(() => {
    if (!currentUser) return;

    // Treat each user as a DM conversation for now
    const mappedConvs = chatUsersList.map((u: IChatUser) => ({
      id: u._id,
      type: "direct" as const,
      name: u.name || "User",
      avatar: undefined,
      members: [currentUser._id, u._id],
      lastMessage: undefined,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    }));
    setConversations(mappedConvs);

    // Clear admin components since DB is removed
    setSilences([]);
    setLogs([]);
  }, [currentUser, chatUsersList]);

  useEffect(() => {
    loadChatRecords();

    // Listeners for updates
    const handleUpdate = () => {
      loadChatRecords();
    };

    window.addEventListener("metgo_chat_conversation_created", handleUpdate);
    window.addEventListener("metgo_chat_message_received", handleUpdate);
    window.addEventListener("metgo_chat_message_updated", handleUpdate);
    window.addEventListener("metgo_chat_user_silenced", handleUpdate);
    window.addEventListener("metgo_chat_user_unsilenced", handleUpdate);
    window.addEventListener("metgo_chat_settings_changed", handleUpdate);

    return () => {
      window.removeEventListener(
        "metgo_chat_conversation_created",
        handleUpdate,
      );
      window.removeEventListener("metgo_chat_message_received", handleUpdate);
      window.removeEventListener("metgo_chat_message_updated", handleUpdate);
      window.removeEventListener("metgo_chat_user_silenced", handleUpdate);
      window.removeEventListener("metgo_chat_user_unsilenced", handleUpdate);
      window.removeEventListener("metgo_chat_settings_changed", handleUpdate);
    };
  }, [currentUser, loadChatRecords]);

  // Handle select conversation
  const handleSelectConversation = (id: string, highlightMsgId?: string) => {
    setActiveConversationId(id);
    setHighlightMessageId(highlightMsgId);
    setShowInbox(false); // hide inbox on mobile view to show chat window
    setActiveSubTab("chat");
  };

  // Start direct message thread
  const handleStartDm = (recipientId: string) => {
    handleSelectConversation(recipientId);
  };

  // Create group chat
  const handleGroupCreated = () => {
    // No-op for now
  };

  // Create broadcast channel
  const handleBroadcastCreated = () => {
    // No-op for now
  };

  // Silence user globally
  const handleSilenceUser = () => {
    // No-op for now
  };

  // Unsilence user
  const handleUnsilenceUser = () => {
    // No-op for now
  };

  // Trigger export chat history to JSON file (Story 10)
  const handleExportHistory = () => {
    // No-op for now
  };

  // Determine role levels
  const isSuperadmin = currentUser?.role === "superadmin";
  const isAdmin = currentUser?.role === "admin";
  const canSeeModerationTab = isSuperadmin || isAdmin;

  // Render Admin View of all conversations
  const allConversations = conversations;

  return (
    <div className={clsx("flex flex-col h-[80vh] select-none", bgSecondary)}>
      {/* WhatsApp-style Header */}
      <div
        className={clsx(
          bgPrimary,
          borderColor,
          "px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between gap-2 md:gap-4 z-20 shrink-0 shadow-sm",
        )}
      >
        <div className="flex items-center gap-3 md:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setShowInbox(!showInbox)}
            className={clsx(
              "md:hidden p-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
              hoverBg,
            )}
            aria-label="Toggle inbox"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar collapse button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={clsx(
              "hidden md:flex p-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
              hoverBg,
            )}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>

          <div className="hidden sm:block">
            <h1
              className={clsx(
                textPrimary,
                "text-lg md:text-xl font-bold tracking-tight flex items-center gap-2",
              )}
            >
              Chat
            </h1>
          </div>
        </div>

        {/* Debug Panel / Interactive Role Switcher */}
        <div
          className={clsx(
            bgTertiary,
            borderColor,
            "flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-xl border shadow-sm",
          )}
        >
          <span
            className={clsx(
              textTertiary,
              "text-[10px] md:text-xs font-bold uppercase px-2 tracking-wider hidden sm:block",
            )}
          >
            Role:
          </span>
          <select
            value={activeDebugProfile}
            onChange={(e) => setActiveDebugProfile(e.target.value)}
            className={clsx(
              bgPrimary,
              borderColor,
              textSecondary,
              "text-xs md:text-sm font-semibold border px-3 md:px-4 py-2 rounded-lg cursor-pointer outline-hidden focus:ring-2 focus:ring-teal-500 transition-all duration-200",
            )}
          >
            <option value="user-superadmin">Superadmin</option>
            <option value="user-admin-1">Admin</option>
            <option value="user-dmo-1">DMO East</option>
            <option value="user-dmo-2">DMO West</option>
            <option value="user-dmo-3">DMO North</option>
            <option value="user-authority-1">Authority</option>
            <option value="user-traveller-1">Traveller Central</option>
            <option value="user-traveller-3">Traveller Coast</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Inbox Navigation Pane */}
        <div
          className={`${showInbox ? "flex" : "hidden md:flex"} h-full shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-0 md:w-16" : "w-full md:w-80 lg:w-96"} overflow-hidden`}
        >
          <Inbox
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            currentUser={currentUser}
            onOpenNewDm={() => setModalOpen({ ...modalOpen, newDm: true })}
            onOpenNewGroup={() =>
              setModalOpen({ ...modalOpen, newGroup: true })
            }
            onOpenNewBroadcast={() =>
              setModalOpen({ ...modalOpen, newBroadcast: true })
            }
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Dynamic Workspace Panel (Chat window / Admin Views / Settings) */}
        <div
          className={`flex-1 flex flex-col h-full ${showInbox ? "hidden md:flex" : "flex"} transition-all duration-300`}
        >
          {/* Sub tabs bar for Admins or settings */}
          <div
            className={clsx(
              bgPrimary,
              borderColor,
              "border-b px-3 md:px-5 py-3 flex items-center gap-2 md:gap-3 overflow-x-auto shrink-0",
            )}
          >
            <button
              onClick={() => setActiveSubTab("chat")}
              className={clsx(
                "px-3 md:px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95",
                activeSubTab === "chat"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-500/25"
                  : clsx(textTertiary, hoverBg),
              )}
            >
              Chat
            </button>
            {canSeeModerationTab && (
              <>
                {isSuperadmin && (
                  <button
                    onClick={() => setActiveSubTab("admin_view")}
                    className={clsx(
                      "px-3 md:px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95",
                      activeSubTab === "admin_view"
                        ? "bg-teal-600 text-white shadow-md shadow-teal-500/25"
                        : clsx(textTertiary, hoverBg),
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">All Chats</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveSubTab("mod_logs")}
                  className={clsx(
                    "px-3 md:px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95",
                    activeSubTab === "mod_logs"
                      ? "bg-teal-600 text-white shadow-md shadow-teal-500/25"
                      : clsx(textTertiary, hoverBg),
                  )}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden sm:inline">Moderation</span>
                </button>
              </>
            )}
          </div>

          {/* Active Pane Render */}
          <div className="flex-1 min-h-0 relative">
            {activeSubTab === "chat" ? (
              activeConversationId ? (
                <ChatWindow
                  conversationId={activeConversationId}
                  currentUser={currentUser}
                  highlightMessageId={highlightMessageId}
                  onBack={() => setShowInbox(true)}
                  chatUsers={chatUsersList}
                  conversation={conversations.find(
                    (c) => c.id === activeConversationId,
                  )}
                />
              ) : (
                <div
                  className={clsx(
                    "flex flex-col items-center justify-center h-full p-6 text-center select-none",
                    bgSecondary,
                  )}
                >
                  <AlertTriangle className="w-12 h-12 text-teal-500 mb-4" />
                  <h3 className={clsx("text-base font-semibold", textPrimary)}>
                    No Chat Selected
                  </h3>
                  <p className={clsx("text-xs max-w-sm mt-1", textTertiary)}>
                    Select a conversation from the inbox panel or trigger a
                    direct message from the action bar.
                  </p>
                </div>
              )
            ) : activeSubTab === "admin_view" ? (
              /* PLATFORM ADMIN VIEW (Story 10) */
              <div
                className={clsx(
                  "p-6 space-y-6 overflow-y-auto h-full",
                  bgSecondary,
                )}
              >
                <div
                  className={clsx(
                    "rounded-xl p-4 border space-y-4",
                    bgPrimary,
                    borderColor,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-teal-600" />
                    <h2 className={clsx("text-sm font-bold", textPrimary)}>
                      All Platform Chats (Superadmin view)
                    </h2>
                  </div>

                  <div
                    className={clsx(
                      "divide-y",
                      isDark ? "divide-gray-800" : "divide-gray-100",
                    )}
                  >
                    {allConversations.map((c) => (
                      <div
                        key={c.id}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              c.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`
                            }
                            className="w-9 h-9 rounded-full bg-gray-50 border"
                            alt=""
                          />
                          <div>
                            <p
                              className={clsx("text-xs font-bold", textPrimary)}
                            >
                              {c.name}
                            </p>
                            <p
                              className={clsx(
                                "text-[10px] uppercase tracking-wide",
                                textTertiary,
                              )}
                            >
                              {c.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSelectConversation(c.id)}
                            className={clsx(
                              "px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors",
                              isDark
                                ? "bg-teal-950/30 hover:bg-teal-950/50 text-teal-400"
                                : "bg-teal-50 hover:bg-teal-100 text-teal-700",
                            )}
                          >
                            Inspect Thread
                          </button>
                          <button
                            onClick={() => handleExportHistory()}
                            className={clsx(
                              "px-2.5 py-1 border rounded-md text-xs font-semibold cursor-pointer transition-colors",
                              borderColor,
                              textSecondary,
                              hoverBg,
                            )}
                          >
                            Export History
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              activeSubTab === "mod_logs" && (
                /* MODERATION LOGS AND SILENCE CONTROLS (Story 10) */
                <div
                  className={clsx(
                    "p-6 space-y-6 overflow-y-auto h-full text-left",
                    bgSecondary,
                  )}
                >
                  {/* Silence actions tool */}
                  <div
                    className={clsx(
                      "rounded-xl p-4 border flex justify-between items-center gap-4",
                      bgPrimary,
                      borderColor,
                    )}
                  >
                    <div className="space-y-1">
                      <h3
                        className={clsx(
                          "text-sm font-bold flex items-center gap-1.5",
                          textPrimary,
                        )}
                      >
                        <UserX className="w-4 h-4 text-destructive" />
                        Silenced Users Directory
                      </h3>
                      <p className={clsx("text-xs", textTertiary)}>
                        Silence users platform-wide from sending new messages.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setModalOpen({ ...modalOpen, silence: true })
                      }
                      className="px-3 py-1.5 bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Silence User
                    </button>
                  </div>

                  {/* Active Silences list */}
                  {silences.length > 0 && (
                    <div
                      className={clsx(
                        "rounded-xl p-4 border space-y-3",
                        bgPrimary,
                        borderColor,
                      )}
                    >
                      <h4 className={clsx("text-xs font-bold", textPrimary)}>
                        Active Silenced Accounts
                      </h4>
                      <div className="space-y-2">
                        {silences.map((s) => {
                          const user = chatUsersList.find(
                            (u: any) => u.id === s.userId,
                          );
                          return (
                            <div
                              key={s.userId}
                              className={clsx(
                                "flex justify-between items-center p-2.5 rounded-lg border",
                                bgTertiary,
                                borderColor,
                              )}
                            >
                              <div>
                                <p
                                  className={clsx(
                                    "text-xs font-bold",
                                    textPrimary,
                                  )}
                                >
                                  {user
                                    ? user.name ||
                                      `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                    : s.userId}
                                </p>
                                <p
                                  className={clsx("text-[10px]", textTertiary)}
                                >
                                  Reason: {s.reason}
                                </p>
                                <p className={clsx("text-[9px]", textTertiary)}>
                                  Expires:{" "}
                                  {s.expiresAt === "permanent"
                                    ? "Indefinite"
                                    : new Date(s.expiresAt).toLocaleString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleUnsilenceUser()}
                                className={clsx(
                                  "px-2 py-1 bg-teal-500/20 hover:bg-teal-500/35 text-[10px] font-bold rounded cursor-pointer transition-colors",
                                  isDark ? "text-teal-400" : "text-teal-700",
                                )}
                              >
                                Lift Silence
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action logs */}
                  <div
                    className={clsx(
                      "rounded-xl p-4 border space-y-4",
                      bgPrimary,
                      borderColor,
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <FileText className={clsx("w-4 h-4", textTertiary)} />
                      <h3 className={clsx("text-sm font-bold", textPrimary)}>
                        Audit Log Actions
                      </h3>
                    </div>

                    {logs.length > 0 ? (
                      <div
                        className={clsx(
                          "space-y-3 divide-y",
                          isDark ? "divide-gray-800" : "divide-gray-100",
                        )}
                      >
                        {logs.map((log) => (
                          <div key={log.id} className="pt-3 text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className={clsx("font-bold", textPrimary)}>
                                {log.actorName}
                              </span>
                              <span
                                className={clsx("text-[10px]", textTertiary)}
                              >
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className={textSecondary}>
                              Action:{" "}
                              <span
                                className={clsx(
                                  "font-semibold capitalize",
                                  isDark ? "text-teal-400" : "text-teal-700",
                                )}
                              >
                                {log.action.replace("_", " ")}
                              </span>
                            </p>
                            <p className={clsx("italic", textTertiary)}>
                              Target: {log.targetName}
                            </p>
                            <p className={textTertiary}>Reason: {log.reason}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        className={clsx(
                          "text-xs text-center py-6",
                          textTertiary,
                        )}
                      >
                        No moderation actions logged in this session.
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modals injection */}
      <NewDmModal
        isOpen={modalOpen.newDm}
        onClose={() => setModalOpen({ ...modalOpen, newDm: false })}
        currentUser={currentUser}
        onStartChat={handleStartDm}
        chatUsers={chatUsersList}
      />
      <NewGroupModal
        isOpen={modalOpen.newGroup}
        onClose={() => setModalOpen({ ...modalOpen, newGroup: false })}
        currentUser={currentUser}
        onGroupCreated={handleGroupCreated}
        chatUsers={chatUsersList}
      />
      <NewBroadcastModal
        isOpen={modalOpen.newBroadcast}
        onClose={() => setModalOpen({ ...modalOpen, newBroadcast: false })}
        currentUser={currentUser}
        onBroadcastCreated={handleBroadcastCreated}
      />
      <SilenceUserModal
        isOpen={modalOpen.silence}
        onClose={() => setModalOpen({ ...modalOpen, silence: false })}
        onSilence={handleSilenceUser}
        chatUsers={chatUsersList}
      />
    </div>
  );
}
