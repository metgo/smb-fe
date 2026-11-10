import { useEffect, useMemo, useState } from "react";

import { useSocket } from "@/providers/SocketProvider";
import { useChatPresenceQuery } from "@/store/api/chatSystemApi";

// Tracks online/offline + lastActiveAt for a set of DM peer user ids.
// Fetches the initial snapshot via GET /chats/presence, then stays live
// via the chat:presence socket event — no polling needed.
export const useChatPresence = (userIds: string[]) => {
  const socket = useSocket();
  const [presence, setPresence] = useState<Record<string, IPresenceEntry>>({});

  const uniqueUserIds = useMemo(
    () => Array.from(new Set(userIds.filter(Boolean))),
    [userIds],
  );

  const { data } = useChatPresenceQuery(
    { userIds: uniqueUserIds },
    { skip: uniqueUserIds.length === 0 },
  );

  useEffect(() => {
    if (data) setPresence((prev) => ({ ...prev, ...data }));
  }, [data]);

  useEffect(() => {
    if (!socket) return;

    const handlePresence = (payload: IChatSocketPresencePayload) => {
      setPresence((prev) => ({
        ...prev,
        [payload.userId]: {
          isOnline: payload.isOnline,
          lastActiveAt: payload.lastActiveAt,
        },
      }));
    };

    socket.on("chat:presence", handlePresence);
    return () => {
      socket.off("chat:presence", handlePresence);
    };
  }, [socket]);

  return presence;
};
