import clsx from "clsx";
import { MessageSquare } from "lucide-react";

import { ChatConversationRow } from "./ChatConversationRow";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ChatConversationsSectionProps {
  filteredConversations: IConversation[];
  chatUsers: IChatUser[];
  activeConversationId: string | null;
  timeAgo: (iso: string) => string;
  presence: Record<string, IPresenceEntry>;
  onSelectConversation: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, convId: string) => void;
  onOpenProfile: (email: string) => void;
  onOpenNewDm: () => void;
}

export const ChatConversationsSection: React.FC<
  ChatConversationsSectionProps
> = ({
  filteredConversations,
  chatUsers,
  activeConversationId,
  timeAgo,
  presence,
  onSelectConversation,
  onContextMenu,
  onOpenProfile,
  onOpenNewDm,
}) => {
  const { t } = useTranslation("chat");
  const { bgPrimary, textSecondary, textTertiary } = useThemeClasses();

  return (
    <>
      <p
        className={clsx(
          "sticky top-0 z-10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider",
          textTertiary,
          bgPrimary,
        )}
      >
        {t("conversation_count", { count: filteredConversations.length })}
      </p>

      {filteredConversations?.length > 0 ? (
        filteredConversations.map((conv) => {
          const active = conv.id === activeConversationId;
          // Prefer the conversation's own otherParticipant (always present
          // for DMs from the API) over the paginated chatUsers list, which
          // may not include every user the current account has a DM with.
          const dmUser =
            conv.type === "dm"
              ? conv.otherParticipant ||
                chatUsers.find((u) => u._id === conv.members[0])
              : undefined;

          return (
            <ChatConversationRow
              key={conv.id}
              conv={conv}
              active={active}
              dmUser={dmUser}
              timeAgo={timeAgo}
              presence={presence}
              onSelectConversation={onSelectConversation}
              onContextMenu={onContextMenu}
              onOpenProfile={onOpenProfile}
            />
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <MessageSquare className={clsx("w-10 h-10 mb-2", textTertiary)} />
          <p className={clsx("text-sm font-medium", textSecondary)}>
            {t("no_conversations_yet")}
          </p>
          <button
            onClick={onOpenNewDm}
            className="mt-3 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {t("start_conversation")}
          </button>
        </div>
      )}
    </>
  );
};
