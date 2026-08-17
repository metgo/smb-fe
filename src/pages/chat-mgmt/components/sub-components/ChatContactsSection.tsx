import clsx from "clsx";

import { ChatContactRow } from "./ChatContactRow";
import { ChatUserRowSkeleton } from "./chatUsersListShared";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ChatContactsSectionProps {
  visible: boolean;
  isChatUsersFetching: boolean;
  usersWithoutConversation: IChatUser[];
  timeAgo: (iso: string) => string;
  presence: Record<string, IPresenceEntry>;
  onStartDm?: (recipientId: string) => void;
  onOpenProfile: (email: string) => void;
}

export const ChatContactsSection: React.FC<ChatContactsSectionProps> = ({
  visible,
  isChatUsersFetching,
  usersWithoutConversation,
  timeAgo,
  presence,
  onStartDm,
  onOpenProfile,
}) => {
  const { t } = useTranslation("chat");
  const { isDark, textTertiary, borderColor } = useThemeClasses();

  if (!visible) return null;

  if (isChatUsersFetching && usersWithoutConversation.length === 0) {
    return (
      <div className={clsx("border-t pt-2 pb-1", borderColor)}>
        <p
          className={clsx(
            "text-[11px] font-semibold uppercase tracking-wider px-4 pb-1",
            textTertiary,
          )}
        >
          {t("contacts")}
        </p>
        {Array.from({ length: 4 }).map((_, i) => (
          <ChatUserRowSkeleton
            key={i}
            borderColor={borderColor}
            isDark={isDark}
          />
        ))}
      </div>
    );
  }

  if (usersWithoutConversation.length === 0) return null;

  return (
    <div className={clsx("border-t pt-2 pb-1", borderColor)}>
      <p
        className={clsx(
          "sticky top-0 z-10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider",
          textTertiary,
        )}
      >
        {t("contacts_count", { count: usersWithoutConversation.length })}
      </p>
      {usersWithoutConversation.map((user) => (
        <ChatContactRow
          key={user._id}
          user={user}
          timeAgo={timeAgo}
          presence={presence}
          onStartDm={onStartDm}
          onOpenProfile={onOpenProfile}
        />
      ))}
      {isChatUsersFetching && usersWithoutConversation.length > 0 && (
        <p className={clsx("text-center text-xs py-3", textTertiary)}>
          {t("loading")}
        </p>
      )}
    </div>
  );
};
