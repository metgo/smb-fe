import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  Paperclip, Download, Trash, AlertCircle, RefreshCw, CornerDownLeft, 
  Search, ArrowDown, ShieldAlert, Check, CheckCheck
} from "lucide-react";
import type { Message, Attachment } from "../types";
import { MockChatDatabase, MOCK_USERS } from "../mockDb";
import type { MockUser } from "../mockDb";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ChatWindowProps {
  conversationId: string;
  currentUser: MockUser | null;
  highlightMessageId?: string; // used for global search navigation
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUser,
  highlightMessageId,
  onBack,
}) => {
  const { isDark, bgSecondary, textPrimary, borderColor, inputClasses } = useThemeClasses();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [text, setText] = useState("");
  
  // Attachments State
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Searching within the open conversation (Story 8)
  const [showSearch, setShowSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localSearchResults, setLocalSearchResults] = useState<string[]>([]); // message IDs that match
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

  // Scroll variables
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBanner, setShowScrollBanner] = useState(false);
  const [showJumpButton, setShowJumpButton] = useState(false);
  
  // Context menus for message actions
  const [msgContextMenu, setMsgContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);
  const [deleteTargetMessage, setDeleteTargetMessage] = useState<Message | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  const [reportTargetMessage, setReportTargetMessage] = useState<Message | null>(null);
  const [reportReason, setReportReason] = useState("Spam");

  // Typing indicators state
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Fetch Conversation info
  const conversation = useMemo(() => {
    return MockChatDatabase.getConversation(conversationId);
  }, [conversationId]);

  // Load message history
  const loadMessages = useCallback(() => {
    const thread = MockChatDatabase.getMessagesForConversation(conversationId);
    setMessages(thread);

    // Mark messages as read by current user (Read receipts)
    if (currentUser) {
      let updated = false;
      thread.forEach((msg) => {
        if (!msg.isSystem && msg.senderId !== currentUser.id && !msg.readBy.includes(currentUser.id)) {
          msg.readBy.push(currentUser.id);
          MockChatDatabase.updateMessage(msg);
          updated = true;
        }
      });
      if (updated) {
        // Redraw list
        setMessages(MockChatDatabase.getMessagesForConversation(conversationId));
      }
    }
  }, [conversationId, currentUser]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBanner(false);
  };

  useEffect(() => {
    loadMessages();
    setVisibleCount(30);
    setAttachments([]);
    setShowSearch(false);
    setLocalSearchQuery("");

    // Setup listener for real-time messages
    const handleNewMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.convId === conversationId) {
        setMessages((prev) => [...prev, detail.message]);
        
        // Auto scroll helper
        if (containerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
          if (isNearBottom) {
            setTimeout(scrollToBottom, 50);
          } else {
            setShowScrollBanner(true);
          }
        }
      }
    };

    window.addEventListener("metgo_chat_message_received", handleNewMessage);
    window.addEventListener("metgo_chat_message_updated", loadMessages);

    return () => {
      window.removeEventListener("metgo_chat_message_received", handleNewMessage);
      window.removeEventListener("metgo_chat_message_updated", loadMessages);
    };
  }, [conversationId, currentUser, loadMessages]);

  // Highlight message from search result (Story 8)
  useEffect(() => {
    if (highlightMessageId && messages.length > 0) {
      const el = document.getElementById(`msg-${highlightMessageId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-teal-500/10", "dark:bg-teal-400/10", "border-teal-500/30");
        setTimeout(() => {
          el.classList.remove("bg-teal-500/10", "dark:bg-teal-400/10", "border-teal-500/30");
        }, 3000);
      }
    } else {
      scrollToBottom();
    }
  }, [highlightMessageId, messages.length]);

  // Handle typing simulation
  useEffect(() => {
    if (!conversation || !currentUser) return;
    
    // Simulate other users typing when we open a conversation, to make the app alive
    const eligibleOthers = conversation.members.filter((id) => id !== currentUser.id);
    if (eligibleOthers.length === 0) return;

    const timer = setTimeout(() => {
      // Pick a random participant
      const randomUser = MOCK_USERS.find((u) => u.id === eligibleOthers[Math.floor(Math.random() * eligibleOthers.length)]);
      if (randomUser) {
        setTypingUsers([`${randomUser.firstName} ${randomUser.lastName}`]);
        
        // Disappear after 3 seconds of inactivity
        setTimeout(() => {
          setTypingUsers([]);
        }, 3000);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [conversation, currentUser]);


  // Monitor scrolling for infinite scroll & jump button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Jump button visibility (if scrolled up more than 400px)
    setShowJumpButton(scrollHeight - scrollTop - clientHeight > 400);

    // Infinite scroll upward (lazy-load next 30)
    if (scrollTop === 0 && messages.length > visibleCount) {
      const prevHeight = scrollHeight;
      setVisibleCount((prev) => prev + 30);
      // Adjust scroll to maintain position after loading older messages
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight - prevHeight;
        }
      }, 50);
    }
  };

  // Local Search Highlight logic (Story 8)
  useEffect(() => {
    if (localSearchQuery.trim().length < 2) {
      setLocalSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const matchedIds = messages
      .filter((m) => !m.isSystem && !m.isDeleted && (
        m.text.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        m.attachments?.some((a) => a.name.toLowerCase().includes(localSearchQuery.toLowerCase()))
      ))
      .map((m) => m.id);

    setLocalSearchResults(matchedIds);
    if (matchedIds.length > 0) {
      setCurrentSearchIndex(matchedIds.length - 1);
      // scroll to it
      const el = document.getElementById(`msg-${matchedIds[matchedIds.length - 1]}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setCurrentSearchIndex(-1);
    }
  }, [localSearchQuery, messages]);

  const handleSearchNext = (dir: "prev" | "next") => {
    if (localSearchResults.length === 0) return;
    let nextIdx = currentSearchIndex;
    if (dir === "next") {
      nextIdx = (currentSearchIndex + 1) % localSearchResults.length;
    } else {
      nextIdx = (currentSearchIndex - 1 + localSearchResults.length) % localSearchResults.length;
    }
    setCurrentSearchIndex(nextIdx);
    const el = document.getElementById(`msg-${localSearchResults[nextIdx]}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Send Message logic
  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;
    if (!currentUser || !conversation) return;

    // Check if silenced
    const silence = MockChatDatabase.getSilenceState(currentUser.id);
    if (silence) return;

    // Create Message object
    const newMsg: Message = {
      id: `msg-${conversationId}-${Date.now()}`,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      readBy: [currentUser.id],
    };

    MockChatDatabase.addMessage(conversationId, newMsg);
    setText("");
    setAttachments([]);
    setTimeout(scrollToBottom, 50);

    // Simulate real-time mock responses to DMs to make the app interactive (Wow factor!)
    if (conversation.type === "dm") {
      const otherUser = MOCK_USERS.find((u) => u.id !== currentUser.id && conversation.members.includes(u.id));
      if (otherUser) {
        setTimeout(() => {
          // Trigger typing indicator
          setTypingUsers([`${otherUser.firstName} ${otherUser.lastName}`]);
          
          setTimeout(() => {
            setTypingUsers([]);
            // Add automated mock reply
            const replyMsg: Message = {
              id: `msg-${conversationId}-${Date.now() + 1}`,
              senderId: otherUser.id,
              senderName: `${otherUser.firstName} ${otherUser.lastName}`,
              senderAvatar: otherUser.avatar,
              senderRole: otherUser.role,
              text: `Thanks for messaging. I got your request regarding: "${newMsg.text.slice(0, 30)}". Let's coordinate!`,
              timestamp: new Date().toISOString(),
              readBy: [otherUser.id],
            };
            MockChatDatabase.addMessage(conversationId, replyMsg);
          }, 2000);
        }, 1500);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Attachment upload simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 files
    if (attachments.length + files.length > 5) {
      alert("Maximum 5 attachments per message (Story 6).");
      return;
    }

    Array.from(files).forEach((f) => {
      // Size check (10MB)
      if (f.size > 10 * 1024 * 1024) {
        alert(`File ${f.name} exceeds the 10MB limit.`);
        return;
      }

      const id = `att-${Date.now()}-${Math.random().toString(36).substring(5)}`;
      const reader = new FileReader();
      
      const newAtt: Attachment = {
        id,
        name: f.name,
        type: f.type,
        size: f.size,
        url: "",
        uploadStatus: "uploading",
        progress: 0,
      };
      
      setAttachments((prev) => [...prev, newAtt]);

      reader.onload = (event) => {
        // Mocking Upload Progress over 1.5 seconds
        let progressVal = 0;
        const interval = setInterval(() => {
          progressVal += 20;
          setAttachments((prev) => 
            prev.map((a) => {
              if (a.id === id) {
                if (progressVal >= 100) {
                  clearInterval(interval);
                  return {
                    ...a,
                    url: event.target?.result as string,
                    uploadStatus: "success",
                    progress: 100,
                  };
                }
                return { ...a, progress: progressVal };
              }
              return a;
            })
          );
        }, 150);
      };

      reader.readAsDataURL(f);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  // Lightbox Image Viewer
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Message Right Click context menu
  const handleMessageContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    if (msg.isSystem) return;
    setMsgContextMenu({
      x: e.clientX,
      y: e.clientY,
      message: msg,
    });
  };

  // Silenced status check
  const silence = currentUser ? MockChatDatabase.getSilenceState(currentUser.id) : undefined;
  const isComposerDisabled = !!silence || (conversation?.type === "broadcast" && conversation.creatorId !== currentUser?.id && currentUser?.role !== "superadmin");

  // Deletion logic (Story 10)
  const handleDeleteMessage = (msg: Message) => {
    const isOwner = currentUser?.id === msg.senderId;
    const isAdmin = currentUser && ["superadmin", "admin"].includes(currentUser.role);

    if (isAdmin) {
      // Prompt modal reason
      setDeleteTargetMessage(msg);
      setDeleteReason("");
    } else if (isOwner) {
      if (confirm("Are you sure you want to delete your own message?")) {
        const updated = {
          ...msg,
          isDeleted: true,
          deletedReason: "Deleted by owner",
        };
        MockChatDatabase.updateMessage(updated);
      }
    }
    setMsgContextMenu(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetMessage || !currentUser) return;
    const updated = {
      ...deleteTargetMessage,
      isDeleted: true,
      deletedReason: deleteReason.trim(),
      deletedBy: currentUser.id,
    };
    MockChatDatabase.updateMessage(updated);
    
    // Log moderation action
    const sender = MOCK_USERS.find((u) => u.id === deleteTargetMessage.senderId);
    MockChatDatabase.addModerationLog({
      id: `log-${Date.now()}`,
      actorId: currentUser.id,
      actorName: `${currentUser.firstName} ${currentUser.lastName}`,
      targetId: deleteTargetMessage.senderId,
      targetName: sender ? `${sender.firstName} ${sender.lastName}` : deleteTargetMessage.senderId,
      action: "delete_message",
      reason: deleteReason.trim(),
      timestamp: new Date().toISOString(),
    });

    setDeleteTargetMessage(null);
  };

  // Report message logic (Story 10/12)
  const handleReportMessage = (msg: Message) => {
    setReportTargetMessage(msg);
    setMsgContextMenu(null);
  };

  const handleConfirmReport = () => {
    if (!reportTargetMessage || !currentUser) return;
    
    // Log reporting action
    const sender = MOCK_USERS.find((u) => u.id === reportTargetMessage.senderId);
    MockChatDatabase.addModerationLog({
      id: `log-${Date.now()}`,
      actorId: currentUser.id,
      actorName: `${currentUser.firstName} ${currentUser.lastName}`,
      targetId: reportTargetMessage.id, // message reported
      targetName: `Reported message: "${reportTargetMessage.text.slice(0, 30)}" by ${sender?.firstName || "Unknown"}`,
      action: "delete_message", // reports can route in moderation logs
      reason: `REPORT: ${reportReason}`,
      timestamp: new Date().toISOString(),
    });

    alert("Message reported to administrator queue successfully.");
    setReportTargetMessage(null);
  };

  // Group date separators (Story 11)
  const renderMessageList = () => {
    const list: React.ReactNode[] = [];
    let lastDateStr = "";

    // Paginate messages
    const sliced = messages.slice(-visibleCount);

    sliced.forEach((msg) => {
      // Date Separator calculation
      const msgDate = new Date(msg.timestamp);
      const dateStr = msgDate.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      
      if (dateStr !== lastDateStr) {
        list.push(
          <div key={`sep-${msg.id}`} className="flex justify-center my-4">
            <span className={`px-3 py-1 text-[10px] font-bold ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-150 text-gray-500'} rounded-full border ${isDark ? 'border-gray-700/40' : 'border-gray-200/40'}`}>
              {dateStr}
            </span>
          </div>
        );
        lastDateStr = dateStr;
      }

      // Check if message matches query
      const isSearchResult = localSearchResults.includes(msg.id);
      const isCurrentSearchHighlight = isSearchResult && localSearchResults[currentSearchIndex] === msg.id;

      if (msg.isSystem) {
        list.push(
          <div key={msg.id} className="flex justify-center my-2">
            <span className="text-[11px] font-medium text-gray-400 italic">
              {msg.text}
            </span>
          </div>
        );
        return;
      }

      const isMe = msg.senderId === currentUser?.id;

      // Double blue ticks check (Receipt rules)
      const receiptsDisabled = currentUser && (MockChatDatabase.isReadReceiptsDisabled(currentUser.id) || 
        (conversation?.type === "dm" && conversation.members.some((mId) => MockChatDatabase.isReadReceiptsDisabled(mId))));
      
      const allRead = conversation?.members.every((mId) => mId === msg.senderId || msg.readBy.includes(mId));

      list.push(
        <div
          id={`msg-${msg.id}`}
          key={msg.id}
          onContextMenu={(e) => handleMessageContextMenu(e, msg)}
          className={`flex flex-col mb-4 group/row ${isMe ? "items-end" : "items-start"}`}
        >
          <div className={`flex gap-2 max-w-[70%] items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}>
            {!isMe && (
              <img
                src={msg.senderAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${msg.senderName}`}
                className={`w-8 h-8 rounded-full border ${isDark ? 'border-gray-800' : 'border-gray-250'} ${isDark ? 'bg-gray-800' : 'bg-gray-50'} shrink-0 self-start mt-0.5 object-cover`}
                alt=""
              />
            )}
            
            <div className="flex flex-col">
              {!isMe && conversation?.type !== "dm" && (
                <span className={`text-[10px] font-bold text-teal-600 ${isDark ? 'dark:text-teal-400' : ''} ml-1 mb-0.5`}>
                  {msg.senderName} ({msg.senderRole})
                </span>
              )}

              <div
                className={`p-3 rounded-2xl relative border ${
                  msg.isDeleted
                    ? "bg-gray-50 text-gray-400 border-gray-200 italic"
                    : isMe
                      ? "bg-teal-600 text-white border-teal-700 rounded-tr-none"
                      : `${isDark ? 'bg-gray-800 text-gray-150' : 'bg-gray-100 text-gray-850'} ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-tl-none`
                } ${
                  isCurrentSearchHighlight 
                    ? "ring-3 ring-amber-500/50" 
                    : isSearchResult 
                      ? "ring-2 ring-amber-500/20" 
                      : ""
                }`}
              >
                {/* Text Content */}
                {msg.isDeleted ? (
                  <span className="flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    This message was removed by an admin.
                  </span>
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                )}

                {/* Attachments rendering */}
                {!msg.isDeleted && msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((att) => {
                      const isImg = att.type.startsWith("image/");
                      if (isImg) {
                        return (
                          <div key={att.id} className={`relative rounded-lg overflow-hidden border ${isDark ? 'border-white/10' : 'border-black/10'} max-w-[200px]`}>
                            <img
                              src={att.url}
                              alt=""
                              onClick={() => setLightboxUrl(att.url)}
                              className="w-full object-cover max-h-[140px] cursor-zoom-in hover:opacity-90"
                            />
                          </div>
                        );
                      } else {
                        return (
                          <a
                            key={att.id}
                            href={att.url}
                            download={att.name}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs leading-tight transition-colors ${
                              isMe 
                                ? "bg-teal-700 hover:bg-teal-800 border-teal-800 text-white" 
                                : `${isDark ? 'bg-gray-900 hover:bg-gray-850 border-gray-700 text-gray-250' : 'bg-white hover:bg-gray-50 border-gray-250 text-gray-800'}`
                            }`}
                          >
                            <Download className="w-4 h-4 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate">{att.name}</p>
                              <p className="text-[9px] opacity-75">{(att.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </a>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamp & Read Receipt Indicators (Story 7) */}
          {!msg.isSystem && (
            <div className={`flex items-center gap-1.5 mt-1 text-[9px] text-gray-400 px-10 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              <span>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {isMe && !msg.isDeleted && (
                <div 
                  className="cursor-help relative group"
                  title={conversation?.type === "group" && allRead && !receiptsDisabled 
                    ? `Read by all members. Hover for list.` 
                    : undefined}
                >
                  {receiptsDisabled ? (
                    // Gray ticks if receipts disabled
                    <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                  ) : allRead ? (
                    // Double blue ticks if read by all
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  ) : msg.readBy.length > 1 ? (
                    // Double ticks if read by some
                    <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    // Single tick if delivered
                    <Check className="w-3.5 h-3.5 text-gray-400" />
                  )}

                  {/* Group Chat Read Ticks Hoverlist (Story 7) */}
                  {conversation?.type === "group" && !receiptsDisabled && allRead && (
                    <div className={`absolute right-0 bottom-4 z-45 ${isDark ? 'bg-gray-900' : 'bg-gray-900'} text-white text-[9px] p-2 rounded shadow-lg hidden group-hover:block min-w-[120px]`}>
                      <p className="font-semibold border-b border-white/20 pb-0.5 mb-1">Read by:</p>
                      {conversation.members.map((mId) => {
                        const member = MOCK_USERS.find((u) => u.id === mId);
                        if (!member || mId === currentUser?.id) return null;
                        return (
                          <div key={mId} className="flex justify-between gap-2 py-0.5">
                            <span>{member.firstName} {member.lastName}</span>
                            <span className="opacity-70">Read</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    });

    return list;
  };

  return (
    <div className={`flex-1 flex flex-col h-full ${bgSecondary} relative overflow-hidden select-none`}>
      {/* Header */}
      <div className={`p-3 md:p-4 border-b ${borderColor} ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-between z-10 shadow-xs`}>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={onBack} className={`md:hidden p-1.5 rounded ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} cursor-pointer`}>
            ←
          </button>
          <div className="min-w-0">
            <h3 className={`text-sm md:text-base font-bold ${textPrimary} truncate`}>
              {conversation?.name}
            </h3>
            {conversation?.type !== "dm" && (
              <p className="text-[10px] text-gray-500 hidden md:block">
                {conversation?.members.length} members &bull; {conversation?.description}
              </p>
            )}
          </div>
        </div>

        {/* Header Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showSearch ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20' : `${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} text-gray-500`}`}
            title="Search inside chat"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Local Conversation Search Overlay */}
      {showSearch && (
        <div className={`p-2 border-b ${borderColor} ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center gap-2 z-10`}>
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search keywords inside conversation..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className={`flex-1 px-3 py-1 text-xs ${inputClasses} rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500`}
          />
          {localSearchResults.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
              <span>{currentSearchIndex + 1} of {localSearchResults.length}</span>
              <button 
                onClick={() => handleSearchNext("prev")} 
                className={`p-1 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded border ${borderColor} text-[10px] font-bold cursor-pointer`}
              >
                ▲
              </button>
              <button 
                onClick={() => handleSearchNext("next")} 
                className={`p-1 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded border ${borderColor} text-[10px] font-bold cursor-pointer`}
              >
                ▼
              </button>
            </div>
          )}
          <button onClick={() => { setShowSearch(false); setLocalSearchQuery(""); }} className="text-xs text-gray-400 hover:text-gray-600 font-bold shrink-0">
            Cancel
          </button>
        </div>
      )}

      {/* Messages Scroll Panel */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar"
      >
        {renderMessageList()}
        
        {/* Typing Indicators (Story 7) */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex space-x-1 p-2 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-0" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-300" />
            </div>
            <span className="text-[10px] text-gray-400 italic">
              {typingUsers.join(" and ")} is typing...
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Jump buttons and banners */}
      {showScrollBanner && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          New message &darr;
        </button>
      )}

      {showJumpButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold p-2 rounded-full shadow-lg cursor-pointer z-10"
          title="Jump to latest"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Attachments preview list above input */}
      {attachments.length > 0 && (
        <div className={`p-3 ${isDark ? 'bg-gray-900' : 'bg-white'} border-t ${borderColor} flex flex-wrap gap-3 max-h-[140px] overflow-y-auto`}>
          {attachments.map((att) => {
            const isUploading = att.uploadStatus === "uploading";
            const isFailed = att.uploadStatus === "failed";
            
            return (
              <div key={att.id} className={`relative flex items-center gap-2 p-2 border ${borderColor} rounded-lg ${isDark ? 'bg-gray-850' : 'bg-gray-50'} text-xs w-48 overflow-hidden select-none`}>
                {/* Upload Status / Progress (Story 6) */}
                {isUploading && (
                  <div className={`absolute inset-x-0 bottom-0 h-1 ${isDark ? 'bg-gray-850' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-teal-500 transition-all duration-150" 
                      style={{ width: `${att.progress}%` }} 
                    />
                  </div>
                )}
                
                {/* Main Attachment Detail */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{att.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {isUploading ? `Uploading ${att.progress}%` : isFailed ? "Failed" : "Ready"}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {isFailed && (
                    <button className="p-1 text-teal-600 hover:text-teal-700" title="Retry">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button 
                    onClick={() => removeAttachment(att.id)}
                    className={`p-1 text-gray-400 hover:text-gray-600 ${isDark ? 'dark:hover:text-white' : ''} cursor-pointer`}
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Composer Input Area */}
      <div className={`p-3 md:p-4 border-t ${borderColor} ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {isComposerDisabled ? (
          <div className={`flex items-center justify-center p-2 md:p-3 bg-red-50 text-red-700 ${isDark ? 'dark:bg-red-950/20 dark:text-red-400' : ''} border border-red-200 ${isDark ? 'dark:border-red-900/40' : ''} rounded-lg text-[10px] md:text-xs font-semibold select-none text-center`}>
            {silence ? (
              <span className="flex items-center gap-1 md:gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden md:inline">You have been silenced globally. Expires: {silence.expiresAt === "permanent" ? "Indefinite" : new Date(silence.expiresAt).toLocaleString()}. Reason: {silence.reason}</span>
                <span className="md:hidden">Silenced globally</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 md:gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden md:inline">Read-only channel. Only the channel owner can post announcements.</span>
                <span className="md:hidden">Read-only channel</span>
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-end gap-1.5 md:gap-2">
            {/* Attachment paperclip */}
            <div className="relative">
              <input
                type="file"
                id="chat-file-picker"
                multiple
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.docx,.xlsx,.csv,.zip"
                onChange={handleFileChange}
              />
              <button
                onClick={() => document.getElementById("chat-file-picker")?.click()}
                className={`p-1.5 md:p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} cursor-pointer`}
                title="Attach file (JPG, PNG, GIF, PDF, DOCX, XLSX, CSV, ZIP. Max 10MB)"
              >
                <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Input fields */}
            <div className="flex-1 relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type a message..."
                className={`w-full px-3 md:px-4 py-2 ${isDark ? 'bg-gray-850 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 resize-none min-h-[38px] max-h-[120px] custom-scrollbar`}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!text.trim() && attachments.length === 0}
              className="p-1.5 md:p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              <CornerDownLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Viewer Overlay (Story 6) */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <img src={lightboxUrl} className="max-w-full max-h-full rounded shadow-2xl" alt="" />
        </div>
      )}

      {/* Message context options popup menu */}
      {msgContextMenu && (
        <div
          style={{ top: msgContextMenu.y, left: msgContextMenu.x }}
          className={`fixed z-50 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${borderColor} rounded-lg shadow-lg py-1 min-w-[120px]`}
        >
          <button
            onClick={() => handleDeleteMessage(msgContextMenu.message)}
            className={`w-full text-left px-3 py-1.5 text-xs text-destructive ${isDark ? 'hover:bg-red-950/20' : 'hover:bg-red-50'} flex items-center gap-2 cursor-pointer font-semibold`}
          >
            <Trash className="w-3.5 h-3.5" />
            Delete Message
          </button>
          {msgContextMenu.message.senderId !== currentUser?.id && (
            <button
              onClick={() => handleReportMessage(msgContextMenu.message)}
              className={`w-full text-left px-3 py-1.5 text-xs ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center gap-2 cursor-pointer`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Report Message
            </button>
          )}
        </div>
      )}

      {/* Admin Message Delete Reason Modal */}
      {deleteTargetMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className={`w-full max-w-sm ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl p-5 border ${isDark ? 'border-gray-700' : 'border-gray-250'} text-left space-y-4`}>
            <h4 className={`text-sm font-bold ${textPrimary}`}>Reason for deletion</h4>
            <p className="text-xs text-gray-500">
              Admin deletions must be logged. Specify a reason:
            </p>
            <input
              type="text"
              placeholder="Inappropriate content, spam, etc..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className={`w-full px-3 py-2 border ${borderColor} ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden`}
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setDeleteTargetMessage(null)}
                className={`px-3 py-1.5 border ${borderColor} text-xs font-semibold ${isDark ? 'text-gray-300 hover:bg-gray-850 border-gray-750' : 'text-gray-700 hover:bg-gray-50'} cursor-pointer`}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={!deleteReason.trim()}
                className="px-3 py-1.5 bg-destructive disabled:opacity-50 text-xs font-semibold text-white rounded hover:bg-destructive/90 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Report Reason Modal */}
      {reportTargetMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className={`w-full max-w-sm ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl p-5 border ${isDark ? 'border-gray-700' : 'border-gray-250'} text-left space-y-4`}>
            <h4 className={`text-sm font-bold ${textPrimary}`}>Report Message</h4>
            <p className="text-xs text-gray-500">
              Select the reason why you are reporting this message:
            </p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className={`w-full px-3 py-2 border ${borderColor} ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg text-xs cursor-pointer`}
            >
              <option value="Spam">Spam or Advertisements</option>
              <option value="Hate Speech">Hate Speech or Harassment</option>
              <option value="Inappropriate Language">Inappropriate/Offensive Language</option>
              <option value="Other">Other Violation</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setReportTargetMessage(null)}
                className={`px-3 py-1.5 border ${borderColor} text-xs font-semibold ${isDark ? 'text-gray-300 hover:bg-gray-850 border-gray-750' : 'text-gray-700 hover:bg-gray-50'} cursor-pointer`}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmReport}
                className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded hover:bg-teal-700 cursor-pointer"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
