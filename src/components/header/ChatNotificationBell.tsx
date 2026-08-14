import clsx from "clsx";
import { MessageCircle, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getInitials, timeAgo } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useSocket } from "@/providers/SocketProvider";
import { routes } from "@/lib/routes";
import {
  useChatConversationsQuery,
  useChatUnreadCountQuery,
  useLazyChatUnreadCountQuery,
} from "@/store/api/chatSystemApi";

const DROPDOWN_LIMIT = 5;

const ChatNotificationBell = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const popupRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const { isRTL, isDark, textPrimary, textSecondary, textTertiary } =
    useThemeClasses();

  const {
    data: unreadData,
    // refetch: refetchUnreadCount
  } = useChatUnreadCountQuery();
  const [fetchUnreadCount] = useLazyChatUnreadCountQuery();
  const unreadCount = unreadData?.count ?? 0;

  const { data: conversationsRes, refetch: refetchConversations } =
    useChatConversationsQuery({ page: 1, limit: DROPDOWN_LIMIT });
  const conversations = conversationsRes?.data ?? [];

  useEffect(() => {
    soundRef.current = new Audio("/assets/audio/message-ring.mp3");
  }, []);

  // Refetch the badge on load, on any incoming message, and after a
  // conversation is marked read — never increment/decrement it locally,
  // since the count is per-conversation (see Chat Icon FE Guide).
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      soundRef.current?.play().catch(() => {});
      fetchUnreadCount();
      if (isOpen) refetchConversations();
    };

    const handleRead = () => {
      fetchUnreadCount();
      if (isOpen) refetchConversations();
    };

    socket.on("chat:message", handleNewMessage);
    socket.on("chat:read", handleRead);

    return () => {
      socket.off("chat:message", handleNewMessage);
      socket.off("chat:read", handleRead);
    };
  }, [socket, fetchUnreadCount, refetchConversations, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !backdropRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((o) => {
      if (!o) refetchConversations();
      return !o;
    });
  };

  const handleSelectConversation = () => {
    setIsOpen(false);
    navigate(routes.chat);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate(routes.chat);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        aria-label="Chat notifications"
        className={clsx(
          "relative p-2 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40",
          isDark
            ? "border-gray-700 hover:bg-gray-800 bg-gray-900"
            : "border-gray-200 hover:bg-gray-100 bg-white shadow-sm",
        )}
      >
        <MessageCircle className={clsx("w-5 h-5", textPrimary)} />

        {unreadCount > 0 && (
          <span
            className={clsx(
              "absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1",
              "rounded-full bg-red-500 text-white text-[10px] font-bold",
              "flex items-center justify-center leading-none",
              "ring-2",
              isDark ? "ring-gray-900" : "ring-white",
              "animate-pulse-once",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            ref={backdropRef}
            className="fixed inset-0 bg-black/70 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            ref={popupRef}
            className={clsx(
              "flex flex-col overflow-hidden shadow-2xl border z-50 animate-fade-in",
              "fixed bottom-0 left-0 right-0 rounded-t-2xl max-h-[85dvh]",
              "md:absolute md:bottom-auto md:rounded-2xl md:mt-2.5 md:w-90 md:max-h-125",
              isRTL ? "md:left-0 md:right-auto" : "md:right-0 md:left-auto",
              isDark
                ? "bg-gray-900 border-gray-700/80 shadow-black/40"
                : "bg-white border-gray-200 shadow-gray-200/80",
            )}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="flex justify-center pt-2.5 pb-1 md:hidden shrink-0 w-full"
              aria-label="Close chat notifications"
            >
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </button>

            <div
              className={clsx(
                "flex items-center justify-between px-5 py-4 border-b shrink-0",
                isDark ? "border-gray-700/80" : "border-gray-100",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className={clsx("text-sm font-semibold", textPrimary)}>
                  Chats
                </span>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>

            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <span
                  className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    isDark ? "bg-gray-800" : "bg-gray-100",
                  )}
                >
                  <MessageCircle
                    className={clsx(
                      "w-5 h-5",
                      isDark ? "text-gray-600" : "text-gray-400",
                    )}
                  />
                </span>
                <p className="text-sm text-gray-400 font-medium">
                  No messages yet
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                {conversations.map((conv) => {
                  const isUnread = conv.unreadCount > 0;
                  const name =
                    conv.type === "dm"
                      ? conv.otherParticipant?.name || "User"
                      : conv.name || "Group";

                  return (
                    <button
                      key={conv._id}
                      onClick={handleSelectConversation}
                      className={clsx(
                        "w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors duration-150",
                        isDark ? "hover:bg-gray-800/60" : "hover:bg-gray-50",
                        isUnread &&
                          (isDark ? "bg-blue-500/5" : "bg-blue-50/60"),
                      )}
                    >
                      <span
                        className={clsx(
                          "shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold",
                          isDark
                            ? "bg-gray-700 text-gray-200"
                            : "bg-teal-100 text-teal-700",
                        )}
                      >
                        {getInitials(name)}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={clsx(
                              "text-sm leading-snug truncate",
                              isUnread
                                ? `font-semibold ${textPrimary}`
                                : `font-medium ${textSecondary}`,
                            )}
                          >
                            {name}
                          </h4>
                          {isUnread && (
                            <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p
                          className={clsx(
                            "text-xs mt-0.5 leading-relaxed line-clamp-1",
                            textSecondary,
                          )}
                        >
                          {conv.lastMessagePreview}
                        </p>
                        <p
                          className={clsx(
                            "text-[11px] mt-1 font-medium",
                            textTertiary,
                          )}
                        >
                          {timeAgo(conv.lastMessageAt)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className={clsx(
                "px-5 py-3 border-t shrink-0",
                isDark
                  ? "border-gray-700/80 bg-gray-900"
                  : "border-gray-100 bg-gray-50/80",
              )}
            >
              <button
                onClick={handleViewAll}
                className={clsx(
                  "w-full flex items-center justify-center gap-2",
                  "text-sm font-semibold text-blue-600 dark:text-blue-400",
                  "hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
                )}
              >
                See all
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatNotificationBell;
