type TMonthlyType = "SPECIFIC_DATE" | "RELATIVE_DAY"

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
  status: 'upcoming' | 'past' | 'canceled';
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

interface IEventResponse{
  
}

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
  paymentStatus: 'paid' | 'pending' | 'refunded';
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
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox';
  required: boolean;
  options?: string[];
}

interface TicketData {
  _id?: string;
  name: string;
  description: string;
  type: 'free' | 'paid' | 'vip' | 'donation';
  markedPrice: number;
  sellingPrice: number;
  quantity: number;
  perUserLimit: number;
  saleStart: string;
  saleEnd: string;
  visibility: 'public' | 'hidden' | 'promo';
  assignedDays: string[];
}

interface NotificationData {
  id: string;
  hoursBeforeEvent: number;
  channels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  language: 'en' | 'he' | 'ar';
  template: string;
  subject: string;
  message: string;
  enabled: boolean;
}

type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom'
type MonthlyOrdinal = '1st' | '2nd' | '3rd' | '4th' | 'last'
type RecurrenceEndType = 'never' | 'date' | 'count'


// Event Creation Payload

interface EventBasicInfoPayload {
  name: string;
  description: string;
  shortDescription: string;
  authorityId?: string;
  dmoId?: string;
  status: string
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

interface EventMediaPayload {

}


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

interface IEventImage {
  image: string;
  caption?: string;
  alt?: string;
  isPrimary: boolean;
  subCoordinates?: SubCoordinates;
}
type TEventImages = IEventImage[];


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


interface ITicketPayload {
  _id?: string;
  name: string;
  description: string;
  eventId: string;
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
  },
  imageUrl?: string;
  images?: [{ image: string }]
  status: string;
  type: string;
}


type IUploadStatus = "idle" | "uploading" | "success" | "error";

interface IEventImageUpload {
  id: number;
  file?: File;
  previewUrl: string;
  signedUrl?: string;
  gcsURL?: string;
  progress: number;
  status: UploadStatus;
  isPrimary: boolean;
}
