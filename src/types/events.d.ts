type TMonthlyType = "SPECIFIC_DATE" | "RELATIVE_DAY";
type TTicketOpMode = "CREATE" | "DUPLICATE" | "UPDATE";

interface Event {
  _id: string;
  name: string;
  website: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  price: number;
  isFree: boolean;
  registrationRequired: boolean;
  status: "upcoming" | "past" | "canceled";
  totalRegistrations: number;
  capacity: number;
  revenue: number;
  refunds: number;
  isMultiDay: boolean;
  category: string;
  location: string;
  image?: string;
  dailyMetrics?: {
    date: string;
    registrations: number;
    attendance: number;
    revenue: number;
  }[];
}

interface IEventResponse {}

interface SignedUrlPayload {
  originalName: string;
  mimeType: string;
}

interface GcsFileUpload {
  signedUrl: string;
  gcsURL: string;
}

interface Registrant {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  quantity: number;
  ticketType: string;
  totalPrice: number;
  paymentStatus: "paid" | "pending" | "refunded";
  registrationDate: string;
  sourceWebsite: string;
  attendingDays?: string[];
}

interface EventDay {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "dropdown" | "checkbox";
  required: boolean;
  options?: string[];
}

interface TicketData {
  _id?: string;
  name: string;
  description: string;
  type: "free" | "paid" | "vip" | "donation";
  markedPrice: number;
  sellingPrice: number;
  quantity: number;
  perUserLimit: number;
  saleStart: string;
  saleEnd: string;
  visibility: "public" | "hidden" | "promo";
  assignedDays: string[];
}

interface NotificationData {
  _id?: string;
  index: number;
  hoursBeforeEvent: number;
  channels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  language: "en" | "he" | "ar";
  template: string;
  subject: string;
  message: string;
  enabled: boolean;
}

type RecurrencePattern = "daily" | "weekly" | "monthly" | "custom";
type MonthlyOrdinal = "1st" | "2nd" | "3rd" | "4th" | "last";
type RecurrenceEndType = "never" | "date" | "count";

type EventStatus = "PENDING" | "APPROVED" | "CLOSED" | "REJECTED" | "DRAFT";

// Event Creation Payload

interface EventBasicInfoPayload {
  name: string;
  description: string;
  shortDescription: string;
  authorityId?: string;
  dmoId?: string;
  status: string;
  internalNotes?: string;
  groupTypesId?: string[];
  accessibilitiesId?: string[];
  subCategoriesId?: string[];
}

interface EventDateTimePayload {
  dayDescription?: DayDescription[];
  eventType: string;
  address?: Address;
  onlineLink?: string;
  recurringEventRule?: RecurringEventRule;
}

interface EventRegPayload {
  registration?: Registration;
}

interface EventMsgSchedulePayload {
  scheduledNotifications?: ScheduledNotifications[];
}

interface EventMediaPayload {}

interface DayDescription {
  date: string;
  startTime: string;
  endTime: string;
}

interface Address {
  country: string;
  city: string;
  location: string;
  additional_information?: string;
}

interface Registration {
  isRegistration: boolean;
  noOfPeople: number;
  isUnlimited: boolean;
}

// interface CustomQuestion {
//   question: string;
//   answerType: "TEXT" | "MULTIPLE_CHOICE" | "CHECKBOX";
//   required: boolean;
//   commonQuestionOptions?: QuestionOption[];
// }

interface QuestionOption {
  value: string;
  label: string;
}

interface SubCoordinates {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  name?: string;
}

interface GeoLocation {
  lat: string;
  long: string;
}

interface RecurringEventRule {
  pattern: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
  daysOfWeek?: string[]; // e.g., ["Monday", "Wednesday"]
  monthlyType?: "SPECIFIC_DATE" | "RELATIVE";
  specificDate?: number;
  relativeDate?: number;
  relativeDay?: string; // e.g., "Tuesday"
  customInterval?: number;
  customUnit?: "DAY" | "WEEK" | "MONTH" | "YEAR";
  endType?: "END_DATE" | "OCCURRENCE_LIMIT";
  occurrenceLimit?: number;
  endDate?: string;
}

interface ScheduledNotifications {
  sendHoursBefore: number;
  channels: ("EMAIL" | "SMS" | "WHATSAPP")[];
  language: string;
  template: string;
  customTemplate?: CustomTemplate;
}

interface CustomTemplate {
  subject: string;
  body: string;
}

interface ITicketDateTime {
  _id?: number;
  date: string;
  startTime: string;
  endTime: string;
}

// ── Sessions ─────────────────────────────────────────────────────────────────

interface SessionSlot {
  id: string;
  time: string;
  capacity: number;
}

interface SessionDate {
  id: string;
  date: string;
  slots: SessionSlot[];
}

interface SessionInstructor {
  name: string;
  role: string;
}

interface EventSession {
  id: string;
  name: string;
  tagline: string;
  description: string;
  images: string[];
  roomLabel: string;
  rooms: string[];
  instructors: SessionInstructor[];
  dates: SessionDate[];
}

interface CreateSessionPayload {
  eventId: string;
  name: string;
  tagline?: string;
  description?: string;
  images?: string[];
  roomLabel?: string;
  rooms?: string[];
  instructors?: SessionInstructor[];
  dates: SessionDate[];
}

type UpdateSessionPayload = Partial<Omit<CreateSessionPayload, "eventId">>;

// ─────────────────────────────────────────────────────────────────────────────

interface ITicketPayload {
  _id?: string;
  name: string;
  description: string;
  eventId: string;
  dayDescription: ITicketDateTime[];
  price: {
    markedPrice: number;
    discountAmount: number;
    discountPercent: number;
    sellingPrice: number;
  };
  quantity: {
    initial: number;
    sold: number;
    remaining: number;
    isUnlimited: boolean;
    perUserLimit: number;
  };
  imageUrl?: string;
  images?: [{ image: string }];
  status: string;
  type: string;
  wrapperId?: string;
}

interface IEventListRes {
  _id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  nameHe: string;
  nameAr: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  image: string;
  slug: string;
  dayDescription: IEventDayDescription[];
  hasExternalTicket: boolean;
  ticketBuyLink: string;
  ticketCount: number;
  wrapperCount: number;
  business: IEventBusiness;
  address: {
    country: string;
    city: string;
    location: string;
    additional_information: string;
  };
  pricing: {
    price: {
      sellingPrice: number;
    };
    type: string;
  }[];
}

interface IEventDayDescription {
  date: string;
  startTime: string;
  endTime: string;
}

interface IEventBusiness {
  _id: string;
  name: string;
  logoUrl: string;
}
