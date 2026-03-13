
interface INotifListRes {
  data: INotification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface INotification {
  _id: string;
  content: {
    en: IContent,
    he: IContent,
    ar: IContent,
  };
  status: TItemStatus;
  itemId: string;
  notifType: TNotifType
  itemType: TItemType;
  isRead: boolean;
  isUrgent: boolean;
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