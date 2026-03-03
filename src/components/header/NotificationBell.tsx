import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Theme } from "../App";
import { useLanguage } from "../contexts/LanguageContext";
import NotificationsDropdown from "./NotificationsDropdown";

interface Notification {
  id: string;
  type: "info" | "action" | "warning" | "error";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationBellProps {
  theme: Theme;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
}

export default function NotificationBell({
  theme,
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
}: NotificationBellProps) {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Animation trigger after 5 seconds if unread notifications exist
  useEffect(() => {
    if (unreadCount > 0) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
        // Stop animation after 3 seconds
        setTimeout(() => setShouldAnimate(false), 3000);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    setShouldAnimate(false); // Stop animation when bell is clicked
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleBellClick}
        className={`relative p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          shouldAnimate ? "animate-bell-ring" : ""
        }`}
        aria-label={t.notifications || "Notifications"}
        title={t.notifications || "Notifications"}
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 ${isRTL ? "-left-1" : "-right-1"} min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div ref={dropdownRef}>
          <NotificationsDropdown
            theme={theme}
            notifications={notifications.slice(0, 10)} // Show max 10 notifications
            onNotificationClick={(notification) => {
              onNotificationClick(notification);
              setIsOpen(false);
            }}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onViewAll={() => {
              onViewAll();
              setIsOpen(false);
            }}
            isRTL={isRTL}
          />
        </div>
      )}

      {/* Animation Keyframes */}
      <style>{`
        @keyframes bell-ring {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        
        .animate-bell-ring {
          animation: bell-ring 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}
