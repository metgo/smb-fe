import { MessageCircle } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { openChatPopup } from "@/features/chatPopupSlice";
import { ChatCreatorBubble } from "./ChatCreatorBubble";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface RawCreator {
  _id?: string;
  name?: string;
  email?: string;
  role?: TUserRole;
}

interface ChatWithCreatorProps {
  /** The `creator` object returned alongside a business/product/event/trip/POI. */
  creator?: RawCreator | null;
}

export const ChatWithCreator: React.FC<ChatWithCreatorProps> = ({
  creator,
}) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const { isRTL } = useThemeClasses();

  if (!creator?._id || creator.role === "superadmin") return null;

  const chatUser: IChatUser = {
    _id: creator._id,
    name: creator.name ?? "",
    email: creator.email ?? "",
    role: creator.role as TUserRole,
  };

  const isCreatorViewing =
    authUser?.role !== "superadmin" &&
    !!authUser?.email &&
    authUser.email === chatUser.email;

  if (isCreatorViewing) {
    return <ChatCreatorBubble creator={chatUser} />;
  }

  return (
    <button
      onClick={() => dispatch(openChatPopup(chatUser))}
      title={`Message ${chatUser.name}`}
      className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-40 animate-pulse w-12 h-12 rounded-full bg-[#ff6634] text-white shadow-lg shadow-teal-500/30 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95`}
    >
      <MessageCircle className="w-6 h-6 animate-bounce" />
    </button>
  );
};
