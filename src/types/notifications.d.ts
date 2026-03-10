export enum ItemType {
  BUSINESS = "BUSINESS",
  PRODUCT = "PRODUCT",
  EVENT = "EVENT",
  FUNDAY = "FUNDAY",
  TRIP = "TRIP",
}

export enum NotificationType {
  INFO = "INFO",
  WARNING = "WARNING",
  ACTION = "ACTION",
  ERROR = "ERROR",
}
interface Notification {
  _id: string;
  title: string;
  message: string;
  status: string;
  item: {
    itemType: ItemType;
    notifType: NotificationType;
    message: string;
    status: string;
    title: string;
    _id: string;
  };
  isRead: boolean;
  authority: {
    _id: string;
    name: string;
  };
  dmo?: {
    _id: string;
    name: string;
  };
  actionedBy: {
    _id: string;
    name: string;
    email: string;
  };
  actionedAt: string; // ISO date string
}
interface NotificationState {
  notifications: Notification[];
}
