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
  ticketIds: string[];
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

interface IEventSessionListResponse extends IPagination {
  data: IEventSessionListItem[];
}

//  Event session ticktets
interface ITicketResponse {
  success: boolean;
  data: TicketData;
}

interface TicketData {
  eventId: string;
  wrapperId: string;
  wrapperName: string;
  tickets: ITicket[];
  totalTickets: number;
  totalSessionWrappers: number;
  assignedTickets: number;
  availableTickets: number;
}

interface ITicket {
  ticketId: string;
  name: string;
  description: string;
  type: "FREE" | "PAID";
  price: TicketPrice;
  quantity: TicketQuantity;
  status: "active" | "inactive";
  dayDescription: ITicketDayTime[];
  images: { image: string }[];
}

interface ITicketDayTime {
  date: string;
  startTime: string;
  endTime: string;
}

interface ITicketDayTimeForSession {
  ticketId: string;
  ticketName: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface TicketPrice {
  markedPrice: number;
  discountAmount: number;
  discountPercent: number;
  sellingPrice: number;
}

interface TicketQuantity {
  initial: number;
  sold: number;
  remaining: number;
  isUnlimited: boolean;
  perUserLimit: number;
}

interface ISessionSummaryResponse {
  success: boolean;
  data: ISessionSummaryData;
}

interface ISessionSummaryData {
  summary: ISessionSummary;
  details: ISessionDetail[];
  generatedAt: string; // ISO timestamp
}

interface ISessionSummary {
  totalCapacity: number;
  totalRegistered: number;
  totalHeld: number;
  totalAttended: number;
  totalRemaining: number;
  totalOccupancy: number;
}

interface ISessionDetail {
  session: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  room: string;
  capacity: number;
  registered: number;
  held: number;
  attended: number;
  remaining: number;
  occupancy: number;
}

interface IRegistrationsResponse {
  success: boolean;
  data: IRegistrationsData;
}

interface IRegistrationsData extends IPagination {
  wrapperId: string;
  wrapperName: string;
  registrations: IRegistration[];
  totalRegistrations: number;
  confirmed: number;
  attended: number;
}

interface IRegistration {
  bookingId: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  sessionName: string;
  slotDate: string; // YYYY-MM-DD
  slotTime: string; // HH:mm
  room: string;
  status: RegistrationStatus;
  confirmedAt: string; // ISO timestamp
  createdAt: string; // ISO timestamp
}

type RegistrationStatus =
  "CONFIRMED" | "ATTENDED" | "CANCELLED" | "HELD" | "PENDING";

interface ITargetAudienceResponse {
  success: boolean;
  data: ITargetAudienceData;
}

interface ITargetAudienceData extends IPagination {
  wrapperId: string;
  wrapperName: string;
  users: ITargetAudience[];
}

interface ITargetAudience {
  name: string;
  email: string;
  phone: string;
  registrationCount: number;
  firstRegistration: string; // ISO timestamp
  lastRegistration: string; // ISO timestamp
}

// Send notification payload
interface ISendNotificationPayload {
  type: "email" | "sms";
  recipientType: "all" | "custom";
  subject?: string;
  message: string;
  recipients?: string[];
}

interface INotificationHistoryResponse {
  data: INotificationHistoryItem[];
}

interface INotificationHistoryItem {
  _id: string;
  type: "email" | "sms";
  recipientType: string;
  subject?: string;
  message: string;
  status: "SENT" | "FAILED" | "PENDING";
  successCount: number;
  failureCount: number;
  recipientCount: number;
  sentAt: string;
}

interface INotificationDetailResponse {
  _id: string;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  deletedAt: string | null;
  isDeleted: boolean;
  wrapperId: string;
  type: "email" | "sms";
  recipientType: string;
  recipients: INotificationRecipient[];
  subject?: string;
  message: string;
  language: string;
  status: "SENT" | "FAILED" | "PENDING";
  sentBy: string;
  successCount: number;
  failureCount: number;
  __v: number;
  errorSummary?: string;
  sentAt: string;
}

interface INotificationRecipient {
  email?: string;
  phone?: string;
  status: "sent" | "failed" | "pending";
  error?: string;
}
