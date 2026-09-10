import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Edit, Trash } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface MessageContextMenuProps {
  msgContextMenu: { x: number; y: number; message: IMessage };
  currentUser: IChatUser | null;
  handleEditMessage: (msg: IMessage) => void;
  handleDeleteMessage: (msg: IMessage) => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  msgContextMenu,
  currentUser,
  handleEditMessage,
  handleDeleteMessage,
}) => {
  const { t } = useTranslation("chat");
  const { isDark, bgPrimary, textSecondary, borderColor, hoverBg } =
    useThemeClasses();

  return (
    <div
      style={{ top: msgContextMenu.y, left: msgContextMenu.x }}
      className={clsx(
        "fixed z-50 border rounded-lg shadow-lg py-1 min-w-30",
        bgPrimary,
        borderColor,
      )}
    >
      {msgContextMenu.message.senderId === currentUser?._id && (
        <button
          onClick={() => handleEditMessage(msgContextMenu.message)}
          className={clsx(
            "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors",
            textSecondary,
            hoverBg,
          )}
        >
          <Edit className="w-3.5 h-3.5" />
          {t("edit")}
        </button>
      )}
      <button
        onClick={() => handleDeleteMessage(msgContextMenu.message)}
        className={clsx(
          "w-full text-left px-3 py-1.5 text-xs text-destructive flex items-center gap-2 cursor-pointer font-semibold transition-colors",
          isDark ? "hover:bg-red-950/20" : "hover:bg-red-50",
        )}
      >
        <Trash className="w-3.5 h-3.5" />
        {t("delete")}
      </button>
    </div>
  );
};
