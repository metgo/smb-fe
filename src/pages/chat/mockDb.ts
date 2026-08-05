import type { UserRole } from "@/enums/user.types";
import type {
  Message,
  Conversation,
  Attachment,
  SilenceState,
  ModerationLogEntry,
} from "./types";

// Predefined mock users for demonstrating the permission matrix & hierarchy restrictions
export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  dmoId?: string;
  authorityId?: string;
  managerId?: string; // direct manager
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "user-superadmin",
    firstName: "Karma",
    lastName: "Lama",
    email: "karma.superadmin@metgo.com",
    role: "superadmin",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Karma",
  },
  {
    id: "user-admin-1",
    firstName: "Alex",
    lastName: "Admin",
    email: "alex.admin@metgo.com",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
  },
  {
    id: "user-dmo-1",
    firstName: "Dave",
    lastName: "Dmo",
    email: "dave.dmo@metgo.com",
    role: "dmo",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Dave",
    dmoId: "dmo-east",
    managerId: "user-admin-1",
  },
  {
    id: "user-dmo-2",
    firstName: "Dan",
    lastName: "Dmo",
    email: "dan.dmo@metgo.com",
    role: "dmo",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Dan",
    dmoId: "dmo-west",
    managerId: "user-admin-1", // same admin, so they can DM each other!
  },
  {
    id: "user-dmo-3",
    firstName: "Diana",
    lastName: "Dmo",
    email: "diana.dmo@metgo.com",
    role: "dmo",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Diana",
    dmoId: "dmo-north",
    managerId: "user-admin-2", // different admin
  },
  {
    id: "user-authority-1",
    firstName: "Arthur",
    lastName: "Authority",
    email: "arthur.authority@metgo.com",
    role: "authority",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Arthur",
    dmoId: "dmo-east",
    authorityId: "auth-central",
    managerId: "user-dmo-1", // managed by Dave
  },
  {
    id: "user-authority-2",
    firstName: "Audrey",
    lastName: "Authority",
    email: "audrey.authority@metgo.com",
    role: "authority",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Audrey",
    dmoId: "dmo-west",
    authorityId: "auth-coast",
    managerId: "user-dmo-2", // managed by Dan
  },
  {
    id: "user-traveller-1",
    firstName: "Tim",
    lastName: "Traveller",
    email: "tim.traveller@gmail.com",
    role: "traveller",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Tim",
    authorityId: "auth-central", // assigned to Arthur
  },
  {
    id: "user-traveller-2",
    firstName: "Tina",
    lastName: "Traveller",
    email: "tina.traveller@gmail.com",
    role: "traveller",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Tina",
    authorityId: "auth-central", // assigned to Arthur
  },
  {
    id: "user-traveller-3",
    firstName: "Tom",
    lastName: "Traveller",
    email: "tom.traveller@gmail.com",
    role: "traveller",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Tom",
    authorityId: "auth-coast", // assigned to Audrey
  },
];

// Helper to filter users according to the hierarchy restrictions
export function getPermittedUsersToMessage(
  currentUser: MockUser | null,
): MockUser[] {
  if (!currentUser) return [];

  // SUPERADMIN can see and message everyone except themselves
  if (currentUser.role === "superadmin") {
    return MOCK_USERS.filter((u) => u.id !== currentUser.id);
  }

  // ADMIN can message any admin, dmo, authority, or traveller
  if (currentUser.role === "admin") {
    return MOCK_USERS.filter(
      (u) => u.id !== currentUser.id && u.role !== "superadmin",
    );
  }

  // DMO: role level 3 and below (DMO, AUTHORITY, TRAVELLER), plus their manager (ADMIN)
  if (currentUser.role === "dmo") {
    return MOCK_USERS.filter((u) => {
      if (u.id === currentUser.id) return false;
      // can see direct manager (ADMIN)
      if (u.id === currentUser.managerId) return true;
      // DMOs under the same admin can see each other
      if (u.role === "dmo" && u.managerId === currentUser.managerId)
        return true;
      // Else they must be DMO, AUTHORITY, or TRAVELLER
      return ["dmo", "authority", "traveller"].includes(u.role);
    });
  }

  // AUTHORITY: role level 4 and below (AUTHORITY, TRAVELLER), plus their manager (DMO)
  if (
    currentUser.role === "authority" ||
    currentUser.role === "authorityAdmin"
  ) {
    return MOCK_USERS.filter((u) => {
      if (u.id === currentUser.id) return false;
      // can see direct manager (DMO)
      if (u.id === currentUser.managerId) return true;
      // or level 4 and below
      return ["authority", "authorityAdmin", "traveller"].includes(u.role);
    });
  }

  // TRAVELLER: can only message their assigned AUTHORITY and other TRAVELLERs within the same authority's scope.
  if (currentUser.role === "traveller") {
    return MOCK_USERS.filter((u) => {
      if (u.id === currentUser.id) return false;
      // assigned authority
      if (u.role === "authority" && u.authorityId === currentUser.authorityId)
        return true;
      // other travellers in same authority scope
      if (u.role === "traveller" && u.authorityId === currentUser.authorityId)
        return true;
      return false;
    });
  }

  return [];
}

const STORAGE_KEYS = {
  CONVERSATIONS: "metgo_chat_conversations",
  MESSAGES: "metgo_chat_messages",
  SILENCES: "metgo_chat_silences",
  LOGS: "metgo_chat_moderation_logs",
  USER_READ_RECEIPTS: "metgo_chat_read_receipts_disabled",
};

// Initial base seed messages if storage is empty
const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    type: "dm",
    name: "Arthur Authority",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Arthur",
    members: ["user-superadmin", "user-authority-1"],
  },
  {
    id: "conv-2",
    type: "group",
    name: "Regional Team",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RT",
    description: "Coordination for local event operations",
    members: ["user-admin-1", "user-dmo-1", "user-authority-1"],
    creatorId: "user-admin-1",
    adminId: "user-admin-1",
  },
  {
    id: "conv-3",
    type: "broadcast",
    name: "DMO Announcement Channel",
    description:
      "Broadcast policy updates to all Destination Marketing Organizations",
    members: ["user-admin-1", "user-dmo-1", "user-dmo-2", "user-dmo-3"],
    creatorId: "user-admin-1",
    targetRole: "dmo",
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1-1",
    senderId: "user-authority-1",
    senderName: "Arthur Authority",
    senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Arthur",
    senderRole: "authority",
    text: "Hello Karma, I have completed the business approval review for MetGo East. Can you take a look?",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    readBy: ["user-superadmin", "user-authority-1"],
  },
  {
    id: "msg-1-2",
    senderId: "user-superadmin",
    senderName: "Karma Lama",
    senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Karma",
    senderRole: "superadmin",
    text: "Thanks Arthur. It looks clean, let's schedule the activation.",
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), // 1.5 hours ago
    readBy: ["user-superadmin", "user-authority-1"],
  },
  {
    id: "msg-2-1",
    senderId: "user-admin-1",
    senderName: "Alex Admin",
    senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
    senderRole: "admin",
    text: "Welcome to the regional team thread. Let's list pending approvals.",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    readBy: ["user-admin-1", "user-dmo-1", "user-authority-1"],
  },
  {
    id: "msg-2-2",
    senderId: "user-dmo-1",
    senderName: "Dave Dmo",
    senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Dave",
    senderRole: "dmo",
    text: "Sure Alex. I will upload the local partner sheet here in a bit.",
    timestamp: new Date(Date.now() - 3600000 * 23).toISOString(), // 23 hours ago
    readBy: ["user-admin-1", "user-dmo-1", "user-authority-1"],
  },
  {
    id: "msg-2-3",
    senderId: "user-admin-1",
    senderName: "Alex Admin",
    senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
    senderRole: "admin",
    isSystem: true,
    text: "Alex Admin added Arthur Authority",
    timestamp: new Date(Date.now() - 3600000 * 22.5).toISOString(), // 22.5 hours ago
    readBy: ["user-admin-1", "user-dmo-1", "user-authority-1"],
  },
  {
    id: "msg-3-1",
    senderId: "user-admin-1",
    senderName: "Alex Admin",
    senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
    senderRole: "admin",
    text: "Important: All DMOs must submit their summer campaign reports by Monday evening. Thank you.",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), // 48 hours ago
    readBy: ["user-admin-1", "user-dmo-1", "user-dmo-2", "user-dmo-3"],
    reactions: { "👍": ["user-dmo-1", "user-dmo-2"] },
  },
];

export class MockChatDatabase {
  private static getStored<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private static setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }

  // Load Database
  static getConversations(): Conversation[] {
    const convs = this.getStored<Conversation[]>(
      STORAGE_KEYS.CONVERSATIONS,
      INITIAL_CONVERSATIONS,
    );
    const msgs = this.getAllMessages();

    // Map last message to each conversation
    return convs.map((c) => {
      const convMsgs = msgs.filter((m) => {
        // Simple mapping based on ID prefix or ID range
        if (c.id === "conv-1" && m.id.startsWith("msg-1-")) return true;
        if (c.id === "conv-2" && m.id.startsWith("msg-2-")) return true;
        if (c.id === "conv-3" && m.id.startsWith("msg-3-")) return true;
        // Or if message has a targetConversationId property
        return (m as any).conversationId === c.id;
      });
      const sorted = convMsgs.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      return {
        ...c,
        lastMessage: sorted[sorted.length - 1],
      };
    });
  }

  static getConversation(id: string): Conversation | undefined {
    return this.getConversations().find((c) => c.id === id);
  }

  static saveConversations(convs: Conversation[]): void {
    // Strip lastMessage before saving to avoid redundancy
    const cleaned = convs.map(({ lastMessage, ...rest }) => rest);
    this.setStored(STORAGE_KEYS.CONVERSATIONS, cleaned);
  }

  static getAllMessages(): Message[] {
    return this.getStored<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  }

  static getMessagesForConversation(convId: string): Message[] {
    const msgs = this.getAllMessages();
    return msgs
      .filter((m) => {
        if (convId === "conv-1" && m.id.startsWith("msg-1-")) return true;
        if (convId === "conv-2" && m.id.startsWith("msg-2-")) return true;
        if (convId === "conv-3" && m.id.startsWith("msg-3-")) return true;
        return (m as any).conversationId === convId;
      })
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }

  static addMessage(convId: string, message: Message): void {
    const msgs = this.getAllMessages();
    const extendedMessage = {
      ...message,
      conversationId: convId,
    };
    msgs.push(extendedMessage);
    this.setStored(STORAGE_KEYS.MESSAGES, msgs);

    // Trigger custom events so other tabs or observers update
    window.dispatchEvent(
      new CustomEvent("metgo_chat_message_received", {
        detail: { convId, message: extendedMessage },
      }),
    );
  }

  static updateMessage(message: Message): void {
    const msgs = this.getAllMessages();
    const idx = msgs.findIndex((m) => m.id === message.id);
    if (idx !== -1) {
      msgs[idx] = { ...msgs[idx], ...message };
      this.setStored(STORAGE_KEYS.MESSAGES, msgs);
      window.dispatchEvent(
        new CustomEvent("metgo_chat_message_updated", { detail: { message } }),
      );
    }
  }

  // Read Receipts Disabled State
  static isReadReceiptsDisabled(userId: string): boolean {
    const list = this.getStored<string[]>(STORAGE_KEYS.USER_READ_RECEIPTS, []);
    return list.includes(userId);
  }

  static setReadReceiptsDisabled(userId: string, disabled: boolean): void {
    let list = this.getStored<string[]>(STORAGE_KEYS.USER_READ_RECEIPTS, []);
    if (disabled && !list.includes(userId)) {
      list.push(userId);
    } else if (!disabled && list.includes(userId)) {
      list = list.filter((id) => id !== userId);
    }
    this.setStored(STORAGE_KEYS.USER_READ_RECEIPTS, list);
    window.dispatchEvent(new Event("metgo_chat_settings_changed"));
  }

  // Silenced Users Management
  static getSilencedUsers(): SilenceState[] {
    return this.getStored<SilenceState[]>(STORAGE_KEYS.SILENCES, []);
  }

  static getSilenceState(userId: string): SilenceState | undefined {
    const silences = this.getSilencedUsers();
    const entry = silences.find((s) => s.userId === userId);
    if (!entry) return undefined;

    // Check expiration
    if (entry.expiresAt !== "permanent") {
      const expires = new Date(entry.expiresAt).getTime();
      if (Date.now() > expires) {
        // Expired automatically, clear it
        this.unsilenceUser(userId, "system");
        return undefined;
      }
    }
    return entry;
  }

  static silenceUser(
    userId: string,
    duration: string,
    reason: string,
    silencedBy: string,
  ): void {
    const silences = this.getSilencedUsers();
    let expiresAt = "permanent";

    if (duration !== "permanent") {
      const match = duration.match(/^(\d+)([hdw])$/);
      if (match) {
        const amount = parseInt(match[1], 10);
        const unit = match[2];
        const now = new Date();
        if (unit === "h") now.setHours(now.getHours() + amount);
        if (unit === "d") now.setDate(now.getDate() + amount);
        if (unit === "w") now.setDate(now.getDate() + amount * 7);
        expiresAt = now.toISOString();
      } else if (duration === "1h") {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        expiresAt = now.toISOString();
      } else if (duration === "24h") {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        expiresAt = now.toISOString();
      } else if (duration === "7d") {
        const now = new Date();
        now.setDate(now.getDate() + 7);
        expiresAt = now.toISOString();
      }
    }

    const newSilence: SilenceState = { userId, silencedBy, reason, expiresAt };
    const filtered = silences.filter((s) => s.userId !== userId);
    filtered.push(newSilence);
    this.setStored(STORAGE_KEYS.SILENCES, filtered);

    // Log the action
    const targetUser = MOCK_USERS.find((u) => u.id === userId);
    const actorUser = MOCK_USERS.find((u) => u.id === silencedBy);
    this.addModerationLog({
      id: `log-${Date.now()}`,
      actorId: silencedBy,
      actorName: actorUser
        ? `${actorUser.firstName} ${actorUser.lastName}`
        : silencedBy,
      targetId: userId,
      targetName: targetUser
        ? `${targetUser.firstName} ${targetUser.lastName}`
        : userId,
      action: "silence_user",
      reason: `Duration: ${duration}. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
    });

    window.dispatchEvent(
      new CustomEvent("metgo_chat_user_silenced", {
        detail: { userId, silence: newSilence },
      }),
    );
  }

  static unsilenceUser(userId: string, actorId: string): void {
    const silences = this.getSilencedUsers();
    this.setStored(
      STORAGE_KEYS.SILENCES,
      silences.filter((s) => s.userId !== userId),
    );

    const targetUser = MOCK_USERS.find((u) => u.id === userId);
    const actorUser = MOCK_USERS.find((u) => u.id === actorId);
    this.addModerationLog({
      id: `log-${Date.now()}`,
      actorId,
      actorName: actorUser
        ? `${actorUser.firstName} ${actorUser.lastName}`
        : actorId,
      targetId: userId,
      targetName: targetUser
        ? `${targetUser.firstName} ${targetUser.lastName}`
        : userId,
      action: "unsilence_user",
      reason: "Manually unsilenced or expired",
      timestamp: new Date().toISOString(),
    });

    window.dispatchEvent(
      new CustomEvent("metgo_chat_user_unsilenced", { detail: { userId } }),
    );
  }

  // Moderation Audit Logs
  static getModerationLogs(): ModerationLogEntry[] {
    return this.getStored<ModerationLogEntry[]>(STORAGE_KEYS.LOGS, []);
  }

  static addModerationLog(log: ModerationLogEntry): void {
    const logs = this.getModerationLogs();
    logs.unshift(log); // newest first
    this.setStored(STORAGE_KEYS.LOGS, logs);
    window.dispatchEvent(new Event("metgo_chat_logs_updated"));
  }

  // Seed / Helper for starting conversations
  static startDirectChat(userAId: string, userBId: string): Conversation {
    const convs = this.getConversations();
    const existing = convs.find(
      (c) =>
        c.type === "dm" &&
        c.members.includes(userAId) &&
        c.members.includes(userBId),
    );

    if (existing) return existing;

    const userB = MOCK_USERS.find((u) => u.id === userBId);
    const newConv: Conversation = {
      id: `conv-dm-${Date.now()}`,
      type: "dm",
      name: userB ? `${userB.firstName} ${userB.lastName}` : "Direct Message",
      avatar: userB?.avatar,
      members: [userAId, userBId],
    };

    convs.push(newConv);
    this.saveConversations(convs);
    window.dispatchEvent(
      new CustomEvent("metgo_chat_conversation_created", {
        detail: { conversation: newConv },
      }),
    );
    return newConv;
  }

  static createGroupChat(
    name: string,
    description: string,
    creatorId: string,
    memberIds: string[],
    customAvatar?: string,
  ): Conversation {
    const convs = this.getConversations();

    // Auto-generate initials avatar if not customized
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const avatar =
      customAvatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${initials}`;

    const newConv: Conversation = {
      id: `conv-group-${Date.now()}`,
      type: "group",
      name,
      description,
      avatar,
      members: [creatorId, ...memberIds],
      creatorId,
      adminId: creatorId,
    };

    convs.push(newConv);
    this.saveConversations(convs);

    // Create system message
    const creatorUser = MOCK_USERS.find((u) => u.id === creatorId);
    const sysMsg: Message = {
      id: `msg-sys-${Date.now()}`,
      senderId: "system",
      senderName: "System",
      text: `${creatorUser ? creatorUser.firstName + " " + creatorUser.lastName : "Admin"} created the group "${name}"`,
      timestamp: new Date().toISOString(),
      readBy: [creatorId],
      isSystem: true,
    };
    this.addMessage(newConv.id, sysMsg);

    window.dispatchEvent(
      new CustomEvent("metgo_chat_conversation_created", {
        detail: { conversation: newConv },
      }),
    );
    return newConv;
  }

  static createBroadcastChannel(
    name: string,
    description: string,
    creatorId: string,
    targetRole: UserRole,
  ): Conversation {
    const convs = this.getConversations();

    // Subscribe all users of targetRole
    const targetUsers = MOCK_USERS.filter((u) => u.role === targetRole).map(
      (u) => u.id,
    );
    const members = Array.from(new Set([creatorId, ...targetUsers]));

    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=b6e3f4`;

    const newConv: Conversation = {
      id: `conv-bc-${Date.now()}`,
      type: "broadcast",
      name,
      description,
      avatar,
      members,
      creatorId,
      targetRole,
    };

    convs.push(newConv);
    this.saveConversations(convs);

    // System message
    const sysMsg: Message = {
      id: `msg-sys-${Date.now()}`,
      senderId: "system",
      senderName: "System",
      text: `Broadcast channel "${name}" created for role ${targetRole.toUpperCase()}`,
      timestamp: new Date().toISOString(),
      readBy: [creatorId],
      isSystem: true,
    };
    this.addMessage(newConv.id, sysMsg);

    window.dispatchEvent(
      new CustomEvent("metgo_chat_conversation_created", {
        detail: { conversation: newConv },
      }),
    );
    return newConv;
  }
}
