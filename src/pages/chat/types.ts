import type { UserRole } from "@/enums/user.types";

export interface Attachment {
  id: string;
  name: string;
  type: string; // mime type
  size: number; // in bytes
  url: string;
  uploadStatus: "uploading" | "success" | "failed";
  progress?: number; // 0 to 100
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  text: string;
  timestamp: string; // ISO string
  attachments?: Attachment[];
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

export interface Conversation {
  id: string;
  type: "dm" | "group" | "broadcast";
  name: string;
  avatar?: string;
  description?: string;
  members: string[]; // user IDs
  creatorId?: string;
  adminId?: string; // Group Admin
  targetRole?: UserRole; // for broadcasts
  mutedBy?: string[]; // user IDs who muted
  archivedBy?: string[]; // user IDs who archived
  lastMessage?: Message;
}

export interface SilenceState {
  userId: string;
  silencedBy: string;
  reason: string;
  expiresAt: string; // ISO string or 'permanent'
}

export interface ModerationLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  targetId: string;
  targetName: string;
  action: "delete_message" | "silence_user" | "unsilence_user";
  reason: string;
  timestamp: string;
}
