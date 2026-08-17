import clsx from "clsx";
import { Mail, Users, Megaphone } from "lucide-react";

import { getInitials } from "@/helpers";

interface ChatUsersCollapsedSidebarProps {
  currentUser: IChatUser | null;
  canCreateGroup: boolean;
  canManageBroadcasts: boolean;
  onOpenNewDm: () => void;
  onOpenNewGroup: () => void;
  onOpenNewBroadcast: () => void;
  onOpenProfile: (email: string) => void;
  t: (key: string) => string;
  isDark: boolean;
  borderColor: string;
  hoverBg: string;
}

export const ChatUsersCollapsedSidebar: React.FC<
  ChatUsersCollapsedSidebarProps
> = ({
  currentUser,
  canCreateGroup,
  canManageBroadcasts,
  onOpenNewDm,
  onOpenNewGroup,
  onOpenNewBroadcast,
  onOpenProfile,
  t,
  isDark,
  borderColor,
  hoverBg,
}) => (
  <div className="flex flex-col items-center h-full py-4 gap-4">
    <button
      onClick={onOpenNewDm}
      title={t("new_dm")}
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
        title={t("new_group_chat")}
        className={clsx(
          "p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
          hoverBg,
        )}
      >
        <Users className="w-5 h-5" />
      </button>
    )}
    {canManageBroadcasts && (
      <button
        onClick={onOpenNewBroadcast}
        title={t("new_broadcast_list")}
        className={clsx(
          "p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
          hoverBg,
        )}
      >
        <Megaphone className="w-5 h-5" />
      </button>
    )}

    {currentUser && (
      <button
        type="button"
        onClick={() => onOpenProfile(currentUser.email)}
        title={currentUser.name}
        className={clsx(
          "mt-auto w-10 h-10 rounded-full border shrink-0 flex items-center justify-center font-bold text-sm cursor-pointer",
          borderColor,
          isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-600",
        )}
      >
        {getInitials(currentUser.name)}
      </button>
    )}
  </div>
);
