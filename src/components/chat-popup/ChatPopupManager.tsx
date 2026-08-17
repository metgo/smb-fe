import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  closeAllChatPopups,
  closeChatPopup,
  setChatPopupMinimized,
} from "@/features/chatPopupSlice";
import { useChatPresence } from "@/hooks/useChatPresence";
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
  const location = useLocation();
  const popups = useAppSelector((state) => state.chatPopup.popups);

  // Popups are opened from a specific page (e.g. a "message this user"
  // button) and shouldn't follow the user around the app, so close them
  // whenever the route changes.
  useEffect(() => {
    dispatch(closeAllChatPopups());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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

  const presenceUserIds = useMemo(
    () => popups.map((popup) => popup.receiver._id),
    [popups],
  );
  const presence = useChatPresence(presenceUserIds);

  if (!currentUser || popups.length === 0) return null;

  return (
    <>
      {popups.map((popup, index) => (
        <ChatPopup
          key={popup.receiver._id}
          receiver={popup.receiver}
          currentUser={currentUser}
          minimized={popup.minimized}
          presence={presence[popup.receiver._id]}
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
