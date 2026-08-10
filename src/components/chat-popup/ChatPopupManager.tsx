import { useMemo } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  closeChatPopup,
  setChatPopupMinimized,
} from "@/features/chatPopupSlice";
import { ChatPopup } from "./ChatPopup";

const POPUP_WIDTH = 320;
const POPUP_GAP = 16;

/**
 * Renders all currently-open chat popups, stacked side by side above the
 * bottom-right corner. Mount this once near the app root; open popups via
 * `dispatch(openChatPopup(user))` from anywhere in the app.
 */
export const ChatPopupManager = () => {
  const dispatch = useAppDispatch();
  const popups = useAppSelector((state) => state.chatPopup.popups);

  const authUser = useAppSelector((state) => state.auth.user);
  const currentUser: IChatUser | null = useMemo(() => {
    if (!authUser) return null;
    return {
      _id: authUser.id,
      name: `${authUser.firstName} ${authUser.lastName}`.trim(),
      email: authUser.email,
      role: authUser.role as TUserRole,
      dmoId: authUser.dmo?.id,
      authorityId: authUser.authority?.id,
    };
  }, [authUser]);

  if (!currentUser || popups.length === 0) return null;

  return (
    <>
      {popups.map((popup, index) => (
        <ChatPopup
          key={popup.receiver._id}
          receiver={popup.receiver}
          currentUser={currentUser}
          minimized={popup.minimized}
          rightOffset={index * (POPUP_WIDTH + POPUP_GAP)}
          onToggleMinimize={() =>
            dispatch(
              setChatPopupMinimized({
                userId: popup.receiver._id,
                minimized: !popup.minimized,
              }),
            )
          }
          onClose={() => dispatch(closeChatPopup(popup.receiver._id))}
        />
      ))}
    </>
  );
};
