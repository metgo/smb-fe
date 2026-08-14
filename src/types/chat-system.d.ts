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
  systemMessageKey?: TSystemMessageKey;
  systemMessageParams?: Record<string, string>;
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

// Group chat
interface IGroupParticipant {
  userId: string;
  role: "admin" | "member";
  joinedAt: string;
}

interface IChatGroupConversation {
  _id: string;
  type: "group";
  name: string;
  description: string | null;
  avatar: string | null;
  participants: IGroupParticipant[];
  createdById: string;
  lastMessageId: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
}

interface IGroupRosterParticipant {
  _id: string;
  name: string;
  email: string;
  role: TUserRole;
  dmoId: string | null;
  authorityId: string | null;
  groupRole: "admin" | "member";
  joinedAt: string;
}

interface IChatGroupDetails {
  _id: string;
  type: "group";
  name: string;
  description: string | null;
  avatar: string | null;
  participants: IGroupRosterParticipant[];
  createdById: string;
}

interface ICreateGroupReq {
  name: string;
  description?: string;
  memberIds: string[];
}

interface IUpdateGroupReq {
  conversationId: string;
  name?: string;
  description?: string;
  avatar?: string;
}

interface IRemoveGroupMemberRes {
  conversationId: string;
  removedUserId: string;
}

interface ILeaveGroupRes {
  conversationId: string;
}

// Broadcast lists — saved recipient lists that fan a send out into
// independent 1-on-1 DMs (see FE integration guide). Unrelated to
// TChatConversationType's "broadcast" value, which is reserved/unused.
interface IChatBroadcastList {
  _id: string;
  name: string;
  description: string | null;
  memberIds: string[];
  createdById: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
}

interface IChatBroadcastListSummary {
  _id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  memberCount: number;
}

interface IChatBroadcastRosterMember {
  _id: string;
  name: string;
  email: string;
  role: TUserRole;
  dmoId: string | null;
  authorityId: string | null;
}

interface IChatBroadcastListDetails {
  _id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  memberCount: number;
  members: IChatBroadcastRosterMember[];
}

interface ICreateBroadcastListReq {
  name: string;
  description?: string;
  memberIds: string[];
}

interface IUpdateBroadcastListReq {
  broadcastListId: string;
  name?: string;
  description?: string;
}

interface IRemoveBroadcastMemberRes {
  broadcastListId: string;
  removedUserId: string;
  memberCount: number;
}

interface IDeleteBroadcastListRes {
  _id: string;
  isDeleted: true;
}

interface ISendBroadcastReq {
  broadcastListId: string;
  content: string;
}

interface ISendBroadcastRes {
  broadcastListId: string;
  broadcastMessageId: string;
  sent: string[];
  failed: Array<{ userId: string; reason: string }>;
  sentCount: number;
  failedCount: number;
}

interface IChatBroadcastListsRes extends IPagination {
  data: IChatBroadcastListSummary[];
}

interface IChatBroadcastSentMessage {
  _id: string;
  content: string;
  createdAt: string;
  sentCount: number;
  failedCount: number;
}

interface IChatBroadcastMessagesRes extends IPagination {
  data: IChatBroadcastSentMessage[];
}

// System messages
type TSystemMessageKey =
  | "chat.system.memberAdded"
  | "chat.system.memberRemoved"
  | "chat.system.memberLeft"
  | "chat.system.adminPromoted"
  | "chat.system.groupNameUpdated";

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

interface IChatSocketConversationUpdatedPayload {
  conversationId: string;
}

interface IChatSocketRemovedFromGroupPayload {
  conversationId: string;
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
