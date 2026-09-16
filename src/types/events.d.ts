type TMonthlyType = "SPECIFIC_DATE" | "RELATIVE_DAY";
type TTicketOpMode = "CREATE" | "DUPLICATE" | "UPDATE";
type TEventFormat = "physical" | "online" | "hybrid";

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

interface IEventDay {
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

interface INotificationData {
  _id?: string;
  index: number;
  channels: string[];
  subject: string;
  message: string;
  body?: string;
  scheduleDateTime?: string;
  scheduleDateTimeLocal?: string;

  // Alternative to scheduleDateTime: send this many hours relative to the
  // event start/end (e.g. 24, 10). Paired with sendTiming to say which side.
  sendHoursOffset?: number;
  sendTiming?: "PRE_EVENT" | "POST_EVENT";
  enabled: boolean;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

type RecurrencePattern = "daily" | "weekly" | "monthly" | "custom";
type MonthlyOrdinal = "1st" | "2nd" | "3rd" | "4th" | "last";
type RecurrenceEndType = "never" | "date" | "count";

type TEventStatus = "PENDING" | "APPROVED" | "CLOSED" | "REJECTED" | "DRAFT";

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
  dayDescription?: IEventDayDescription[];
  eventType: string;
  address?: Address;
  onlineLink?: string;
  recurringEventRule?: IRecurringEventRule;
}

interface EventRegPayload {
  registration?: Registration;
}

interface EventMsgSchedulePayload {
  scheduledNotifications?: ScheduledNotifications[];
}

interface EventMediaPayload {}

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

interface GeoLocation {
  lat: string;
  long: string;
}

interface IRecurringEventRule {
  pattern: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
  daysOfWeek?: string[]; // e.g., ["Monday", "Wednesday"]
  monthlyType?: TMonthlyType;
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
  greeting: string;
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
    // server-owned counters — the backend ignores these on update and
    // re-derives remaining from the live sold count
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
  isHidden?: boolean;
}

interface ITicketReorderPayload {
  eventId: string;
  ticketIds: string[];
}

interface IEventListRes {
  _id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  nameHe: string;
  nameAr: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  image?: string;
  images?: { image: string; isPrimary: boolean }[];
  slug: string;
  dayDescription: IEventDayDescription[];
  hasExternalTicket: boolean;
  ticketBuyLink: string;
  ticketCount: number;
  wrapperCount: number;
  associatedWebsiteIds: string[];
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

interface IEventTicket {
  _id: string;
  createdAt: string;
  vendorId: string;
  status: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string | null;
  paymentMode: string[];
  paymentDate: string | null;
  ticketId: string;
  ticketName: string;
  ticketImage: { image: string }[];
  orderProductId?: string;
  amount?: number;
  quantity?: number;
  paymentStatus?: string;
  attended?: boolean;
  attendedAt?: string | null;
}

interface IEventTicketQuestionAnswer {
  _id: string;
  questionId: string;
  question: string;
  answer: string;
}

interface IEventTicketAnswerRecord {
  _id: string;
  eventInfo: {
    eventId: string;
    ticketIds: string[];
  };
  purchaserInfo: {
    email: string;
    phone: string;
  };
  questionAnswer: IEventTicketQuestionAnswer[];
}

interface IEventTicketAnswersResponse {
  message: string;
  data: IEventTicketAnswerRecord[];
}

interface IEventColumnVisibility {
  image: boolean;
  name: boolean;
  status: boolean;
  dayDescription: boolean;
  ticketCount: boolean;
  wrapperCount: boolean;
  associatedWebsiteIds: boolean;
  address: boolean;
  pricing: boolean;
  hasExternalTicket: boolean;
  ticketBuyLink: boolean;
  updatedAt: boolean;
  createdAt: boolean;
}

interface IEventDetailsRes {
  _id: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  deletedBy: string | null;
  deletedAt: string | null;
  isDeleted: boolean;

  completionPercent: number;

  name: string;

  address: {
    country: string;
    city: string;
    location: string;
    additional_information: string;
  };

  status: TEventStatus;
  eventType: TEventFormat;

  userId: string;
  authorityId: string;
  dmoId: string;

  associatedWebsiteIds: string[];

  businessId: {
    _id: string;
    name: string;
  };

  geoLocation: {
    lat: string;
    long: string;
  };

  images: ITripImage[];

  groupTypesId: string[];
  accessibilitiesId: string[];
  subCategoriesId: string[];

  slug: string;

  hasExternalTicket: boolean;
  ticketBuyLink: string;
  onlineLink: string;

  impact: number;

  scheduledNotificationId: INotificationData[];

  wrapperIds: string[];

  ticketId: string | null;

  customQuestions: {
    question: string;
    isRequired: boolean;
    _id: string;
  }[];

  dayDescription: IEventDay[];

  description: string;
  descriptionAr: string;
  descriptionHe: string;

  internalNotes: string;

  nameAr: string;
  nameHe: string;

  recurringEventRuleId: IRecurringEventRule;

  shortDescription: string;
  shortDescriptionAr: string;
  shortDescriptionHe: string;

  registration: {
    capacity: number;
    isRegistration: boolean;
    noOfPeople: number;
    isUnlimited: boolean;
  };

  ticketCount: number;

  associatedWebsites: {
    _id: string;
    name: string | null;
    url: string;
    logo: string;
  }[];

  creator: {
    _id: string;
    name: string;
    email: string;
    role: TUserRole;
  };
}
