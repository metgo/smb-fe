interface IEventSlot {
  time: string;
  capacity: number;
}

interface IEventDate {
  date: string;
  slots: IEventSlot[];
}

interface IEventSession {
  name: string;
  tagline?: string;
  description?: string;
  images?: IImage[];
  imagesLables: string[];
  roomLabel?: string;
  rooms?: string[];
  instructors?: { name: string; role: string }[];
  dates: IEventDate[];
  isActive: boolean;
}

interface IAdminConfig {
  eventId: string;
  brand: string;
  themeId: string;
  headline: string;
  subhead: string;
  images: IImage[];
  isActive: boolean;
  selectionMode: "radio" | "checkbox";
  liveEventIds: string[];
  sessions: IEventSession[];
}

interface IBookingRecord {
  ref: string;
  status: "ATTENDED" | "REGISTERED";
  name: string;
  email: string;
  phone: string;
  eventName: string;
  eventId: string;
  dateId: string;
  slotId: string;
  room?: string;
  date: string;
  time: string;
}

type TBookings = Record<string, number>;
type THolds = unknown[];

interface ISlotRow {
  eventId: string;
  eventName: string;
  date: string;
  time: string;
  room: string;
  capacity: number;
  key: string;
}

type TTabId =
  | "content"
  | "landing"
  | "theme"
  | "capacity"
  | "analytics"
  | "notify"
  | "regs";

interface IEventSessionListItem {
  _id: string;
  createdAt: string;
  updatedAt: string;
  eventId: string;
  brand: string;
  themeId: string;
  headline: string;
  subhead: string;
  images: IImage[];
  selectionMode: "radio" | "checkbox";
  isActive: boolean;
  sessionCount: number;
}

interface IEventSessionListResponse {
  data: IEventSessionListItem[];
  totalData: number;
  meta: {
    page: number;
    limit: number;
    data: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
