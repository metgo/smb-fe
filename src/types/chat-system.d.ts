interface IChatUser {
  _id: string;
  name: string;
  email: string;
  role: TUserRole;
  dmoId?: string;
  authorityId?: string;
}

interface IChatUsersRes extends IPagination {
  data: IChatUser[];
}

type TChatConversationType = "dm" | "group" | "broadcast";

interface IChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string | null; // null if deleted
  type: "text" | "system";
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
}

interface ISendMessageRes {
  conversationId: string;
  message: IChatMessage;
}

interface IChatConversationOtherParticipant {
  _id: string;
  name: string;
  email: string;
  role: TUserRole;
}

interface IChatConversation {
  _id: string;
  type: TChatConversationType;
  name?: string;
  avatar?: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  isMuted: boolean;
  isArchived: boolean;
  unreadCount: number;
  otherParticipant?: IChatConversationOtherParticipant;
}

interface IChatConversationsRes extends IPagination {
  data: IChatConversation[];
}

interface IChatUnreadCountRes {
  count: number;
}

interface IChatMessagesRes {
  data: IChatMessage[];
  hasMore: boolean;
}

interface IChatReadRes {
  conversationId: string;
  lastReadAt: string;
}

interface IChatSettingsRes {
  conversationId: string;
  isMuted: boolean;
  isArchived: boolean;
}

// Socket.IO payloads
interface IChatSocketMessagePayload {
  conversationId: string;
  message: IChatMessage;
}

interface IChatSocketMessageEditedPayload {
  conversationId: string;
  messageId: string;
  content: string;
  isEdited: boolean;
  updatedAt: string;
}

interface IChatSocketMessageDeletedPayload {
  conversationId: string;
  messageId: string;
  deletedAt: string;
}

interface IChatSocketReadPayload {
  conversationId: string;
  userId: string;
  lastReadAt: string;
}

interface IChatSocketPresencePayload {
  userId: string;
  isOnline: boolean;
  lastActiveAt: string | null;
}

interface IPresenceEntry {
  isOnline: boolean;
  lastActiveAt: string | null;
}

type IChatPresenceRes = Record<string, IPresenceEntry>;

//
interface IAttachment {
  id: string;
  name: string;
  type: string; // mime type
  size: number; // in bytes
  url: string;
  uploadStatus: "uploading" | "success" | "failed";
  progress?: number; // 0 to 100
}

interface IMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  text: string;
  timestamp: string; // ISO string
  attachments?: IAttachment[];
  readBy: string[]; // List of user IDs who read it
  reactions?: {
    [emoji: string]: string[]; // emoji key mapped to user IDs
  };
  isSystem?: boolean; // system message like "X added Y"
  isDeleted?: boolean;
  deletedReason?: string;
  deletedBy?: string;
  edited?: boolean;
  editedAt?: string; // ISO string when message was last edited
  isRichText?: boolean; // true when text contains CKEditor-authored HTML
}

interface IConversation {
  id: string;
  type: "dm" | "group" | "broadcast";
  name: string;
  avatar?: string;
  description?: string;
  members: string[]; // user IDs
  otherParticipant?: IChatConversationOtherParticipant; // for DMs
  creatorId?: string;
  adminId?: string; // Group Admin
  targetRole?: TUserRole; // for broadcasts
  mutedBy?: string[]; // user IDs who muted
  archivedBy?: string[]; // user IDs who archived
  lastMessage?: IMessage;
  unreadCount?: number;
}

interface ISilenceState {
  userId: string;
  silencedBy: string;
  reason: string;
  expiresAt: string; // ISO string or 'permanent'
}

interface IModerationLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  targetId: string;
  targetName: string;
  action: "delete_message" | "silence_user" | "unsilence_user";
  reason: string;
  timestamp: string;
}
