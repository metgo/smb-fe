import  { useState, useEffect, useCallback } from "react";
import { Inbox } from "./components/Inbox";
import { ChatWindow } from "./components/ChatWindow";
import { 
  NewDmModal, NewGroupModal, NewBroadcastModal, SilenceUserModal 
} from "./components/Modals";
import { 
  MockChatDatabase, MOCK_USERS 
} from "./mockDb";
import type { MockUser } from "./mockDb";
import type { Conversation, ModerationLogEntry, SilenceState } from "./types";
import { 
  ShieldAlert, Settings, Eye, Shield, UserX, AlertTriangle, FileText, CheckCircle 
} from "lucide-react";

export default function ChatPage() {
  // Debug active profile selection (for visual testing)
  const [activeDebugProfile, setActiveDebugProfile] = useState<string>("user-superadmin");
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);

  // Core Chat State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Navigation for mobile responsive view
  const [showInbox, setShowInbox] = useState(true);

  // Search Highlight Message (Story 8)
  const [highlightMessageId, setHighlightMessageId] = useState<string | undefined>(undefined);

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
  const [activeSubTab, setActiveSubTab] = useState<"chat" | "admin_view" | "mod_logs" | "settings">("chat");
  const [silences, setSilences] = useState<SilenceState[]>([]);
  const [logs, setLogs] = useState<ModerationLogEntry[]>([]);
  const [readReceiptsDisabled, setReadReceiptsDisabled] = useState(false);

  // Set active user profile based on debug selection
  useEffect(() => {
    const user = MOCK_USERS.find((u) => u.id === activeDebugProfile) || null;
    setCurrentUser(user);
    if (user) {
      // Mock session storage login to sync components
      sessionStorage.setItem("user_info", JSON.stringify({ user }));
      sessionStorage.setItem("access_token", `mock-token-${user.id}`);
      window.dispatchEvent(new Event("session:updated"));
      
      // Load settings
      setReadReceiptsDisabled(MockChatDatabase.isReadReceiptsDisabled(user.id));
    }
    setActiveConversationId(null);
    setShowInbox(true);
  }, [activeDebugProfile]);

  // Load chat records
  const loadChatRecords = useCallback(() => {
    if (!currentUser) return;
    
    // Fetch conversations where current user is a member
    const list = MockChatDatabase.getConversations();
    const userConvs = list.filter((c) => c.members.includes(currentUser.id));
    setConversations(userConvs);

    // Load admin components
    setSilences(MockChatDatabase.getSilencedUsers());
    setLogs(MockChatDatabase.getModerationLogs());
  }, [currentUser]);

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
      window.removeEventListener("metgo_chat_conversation_created", handleUpdate);
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
    if (!currentUser) return;
    const newConv = MockChatDatabase.startDirectChat(currentUser.id, recipientId);
    handleSelectConversation(newConv.id);
  };

  // Create group chat
  const handleGroupCreated = (name: string, description: string, memberIds: string[]) => {
    if (!currentUser) return;
    const newConv = MockChatDatabase.createGroupChat(name, description, currentUser.id, memberIds);
    handleSelectConversation(newConv.id);
  };

  // Create broadcast channel
  const handleBroadcastCreated = (name: string, description: string, targetRole: any) => {
    if (!currentUser) return;
    const newConv = MockChatDatabase.createBroadcastChannel(name, description, currentUser.id, targetRole);
    handleSelectConversation(newConv.id);
  };

  // Silence user globally
  const handleSilenceUser = (userId: string, duration: string, reason: string) => {
    if (!currentUser) return;
    MockChatDatabase.silenceUser(userId, duration, reason, currentUser.id);
    loadChatRecords();
  };

  // Unsilence user
  const handleUnsilenceUser = (userId: string) => {
    if (!currentUser) return;
    MockChatDatabase.unsilenceUser(userId, currentUser.id);
    loadChatRecords();
  };

  // Toggle read receipts
  const handleToggleReadReceipts = () => {
    if (!currentUser) return;
    const nextVal = !readReceiptsDisabled;
    setReadReceiptsDisabled(nextVal);
    MockChatDatabase.setReadReceiptsDisabled(currentUser.id, nextVal);
  };

  // Trigger export chat history to JSON file (Story 10)
  const handleExportHistory = (convId: string) => {
    const msgs = MockChatDatabase.getMessagesForConversation(convId);
    const blob = new Blob([JSON.stringify(msgs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-history-${convId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Determine role levels
  const isSuperadmin = currentUser?.role === "superadmin";
  const isAdmin = currentUser?.role === "admin";
  const canSeeModerationTab = isSuperadmin || isAdmin;

  // Render Admin View of all conversations
  const allConversations = MockChatDatabase.getConversations();

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Dynamic Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-wrap items-center justify-between gap-4 z-20">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            In-App Chat System
          </h1>
          <p className="text-xs text-gray-500">Real-time messaging coordination workspace</p>
        </div>

        {/* Debug Panel / Interactive Role Switcher */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-[10px] font-bold text-gray-500 uppercase px-1">Testing Role:</span>
          <select
            value={activeDebugProfile}
            onChange={(e) => setActiveDebugProfile(e.target.value)}
            className="text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-teal-600 dark:text-teal-400 px-2 py-1 rounded-md cursor-pointer outline-hidden"
          >
            <option value="user-superadmin">Karma Lama (SUPERADMIN)</option>
            <option value="user-admin-1">Alex Admin (ADMIN)</option>
            <option value="user-dmo-1">Dave Dmo (DMO East)</option>
            <option value="user-dmo-2">Dan Dmo (DMO West)</option>
            <option value="user-dmo-3">Diana Dmo (DMO North)</option>
            <option value="user-authority-1">Arthur Authority (Central)</option>
            <option value="user-traveller-1">Tim Traveller (Central Scope)</option>
            <option value="user-traveller-3">Tom Traveller (Coast Scope)</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Inbox Navigation Pane */}
        <div className={`${showInbox ? "flex" : "hidden md:flex"} h-full`}>
          <Inbox
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            currentUser={currentUser}
            onOpenNewDm={() => setModalOpen({ ...modalOpen, newDm: true })}
            onOpenNewGroup={() => setModalOpen({ ...modalOpen, newGroup: true })}
            onOpenNewBroadcast={() => setModalOpen({ ...modalOpen, newBroadcast: true })}
          />
        </div>

        {/* Dynamic Workspace Panel (Chat window / Admin Views / Settings) */}
        <div className={`flex-1 flex flex-col h-full ${showInbox ? "hidden md:flex" : "flex"}`}>
          {/* Sub tabs bar for Admins or settings */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab("chat")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeSubTab === "chat" 
                  ? "bg-teal-500 text-white" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Active Chat
            </button>
            {canSeeModerationTab && (
              <>
                {isSuperadmin && (
                  <button
                    onClick={() => setActiveSubTab("admin_view")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeSubTab === "admin_view" 
                        ? "bg-teal-500 text-white" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    All Platform Chats (Admin)
                  </button>
                )}
                <button
                  onClick={() => setActiveSubTab("mod_logs")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeSubTab === "mod_logs" 
                      ? "bg-teal-500 text-white" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Moderation Logs
                </button>
              </>
            )}
            <button
              onClick={() => setActiveSubTab("settings")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ml-auto cursor-pointer ${
                activeSubTab === "settings" 
                  ? "bg-teal-500 text-white" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
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
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center select-none bg-slate-50 dark:bg-gray-950">
                  <AlertTriangle className="w-12 h-12 text-teal-500 mb-4 animate-pulse" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">No Chat Selected</h3>
                  <p className="text-xs text-gray-500 max-w-sm mt-1">
                    Select a conversation from the inbox panel or trigger a direct message from the action bar.
                  </p>
                </div>
              )
            ) : activeSubTab === "admin_view" ? (
              /* PLATFORM ADMIN VIEW (Story 10) */
              <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-50 dark:bg-gray-950">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-250 dark:border-gray-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-teal-600" />
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">All Platform Chats (Superadmin view)</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {allConversations.map((c) => (
                      <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} className="w-9 h-9 rounded-full bg-gray-50 border" alt="" />
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{c.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{c.type}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSelectConversation(c.id)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded text-xs font-semibold cursor-pointer"
                          >
                            Inspect Thread
                          </button>
                          <button
                            onClick={() => handleExportHistory(c.id)}
                            className="px-2.5 py-1 border border-gray-300 hover:bg-gray-50 dark:border-gray-850 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 rounded text-xs font-semibold cursor-pointer"
                          >
                            Export History
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeSubTab === "mod_logs" ? (
              /* MODERATION LOGS AND SILENCE CONTROLS (Story 10) */
              <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-50 dark:bg-gray-950 text-left">
                {/* Silence actions tool */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-250 dark:border-gray-800 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <UserX className="w-4 h-4 text-destructive" />
                      Silenced Users Directory
                    </h3>
                    <p className="text-xs text-gray-500">Silence users platform-wide from sending new messages.</p>
                  </div>
                  <button
                    onClick={() => setModalOpen({ ...modalOpen, silence: true })}
                    className="px-3 py-1.5 bg-destructive hover:bg-destructive/95 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Silence User
                  </button>
                </div>

                {/* Active Silences list */}
                {silences.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-250 dark:border-gray-800 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Active Silenced Accounts</h4>
                    <div className="space-y-2">
                      {silences.map((s) => {
                        const user = MOCK_USERS.find((u) => u.id === s.userId);
                        return (
                          <div key={s.userId} className="flex justify-between items-center bg-gray-50 dark:bg-gray-850 p-2.5 rounded-lg border border-gray-150 dark:border-gray-800">
                            <div>
                              <p className="text-xs font-bold text-gray-950 dark:text-white">
                                {user ? `${user.firstName} ${user.lastName}` : s.userId}
                              </p>
                              <p className="text-[10px] text-gray-500">Reason: {s.reason}</p>
                              <p className="text-[9px] text-gray-400">
                                Expires: {s.expiresAt === "permanent" ? "Indefinite" : new Date(s.expiresAt).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleUnsilenceUser(s.userId)}
                              className="px-2 py-1 bg-teal-500/20 hover:bg-teal-500/35 text-teal-600 dark:text-teal-400 text-[10px] font-bold rounded cursor-pointer"
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
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-250 dark:border-gray-800 space-y-4">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Audit Log Actions</h3>
                  </div>
                  
                  {logs.length > 0 ? (
                    <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
                      {logs.map((log) => (
                        <div key={log.id} className="pt-3 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-900 dark:text-white">{log.actorName}</span>
                            <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Action: <span className="font-semibold text-teal-600 dark:text-teal-400 capitalize">{log.action.replace("_", " ")}</span>
                          </p>
                          <p className="text-gray-500 italic">Target: {log.targetName}</p>
                          <p className="text-gray-500">Reason: {log.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center py-6 text-gray-400">No moderation actions logged in this session.</p>
                  )}
                </div>
              </div>
            ) : (
              /* SETTINGS TAB */
              <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-50 dark:bg-gray-950 text-left">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-250 dark:border-gray-800 space-y-4 max-w-md">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Chat settings</h3>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-850 rounded-lg border">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Read Receipts</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        If disabled, you will not send receipts and cannot see others' blue ticks.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={!readReceiptsDisabled} 
                        onChange={handleToggleReadReceipts}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 dark:bg-gray-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold p-2">
                    <CheckCircle className="w-4 h-4" />
                    Settings applied successfully.
                  </div>
                </div>
              </div>
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
      />
      <NewGroupModal
        isOpen={modalOpen.newGroup}
        onClose={() => setModalOpen({ ...modalOpen, newGroup: false })}
        currentUser={currentUser}
        onGroupCreated={handleGroupCreated}
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
      />
    </div>
  );
}
