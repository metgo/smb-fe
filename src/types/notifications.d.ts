interface INotifListRes {
  data: INotification[];
  totalData: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    data: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

interface INotification {
  _id: string;
  content: {
    en: IContent;
    he: IContent;
    ar: IContent;
  };
  status: TItemStatus;
  itemId: string;
  notifType: TNotifType;
  itemType: TItemType;
  isRead: boolean;
  isUrgent: boolean;
  actionData?: {
    suggestedCategory?: string;
  };
  creatorInfo: {
    _id: string;
    name: string;
  };
  createdAt: string;
  __v: number;
}

interface IContent {
  title: string;
  message: string;
}

interface INotificationStats {
  total: number;
  unread: number;
  info: number;
  action: number;
  warning: number;
  error: number;
  urgent: number;
}
