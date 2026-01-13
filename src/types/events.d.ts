interface Event {
  id: string;
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
  id: string;
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
type MonthlyType = 'date' | 'day'
type MonthlyOrdinal = '1st' | '2nd' | '3rd' | '4th' | 'last'
type RecurrenceEndType = 'never' | 'date' | 'count'


// Event Creation Payload
interface EventPayload {
  name: string;
  description: string;
  shortDescription: string;
  authorityId?: string;
  dmoId?: string;
  status: string// adjust according to your possible statuses
  internalNotes?: string;
  groupTypesId?: string[];
  accessibilitiesId?: string[];
  subCategoriesId?: string[];
  dayDescription?: DayDescription[];
  eventType: string;
  address?: Address;
  onlineLink?: string;
  registration?: Registration;
  customQuestions?: CustomQuestion[];
  images?: EventImage[];
  rejected_reason?: string;
  geoLocation?: GeoLocation;
  recurringEventRule?: RecurringEventRule;
  scheduledNotifications?: ScheduledNotifications;
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

interface EventImage {
  image: string;
  caption?: string;
  alt?: string;
  isPrimary: boolean;
  subCoordinates?: SubCoordinates;
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
  pattern: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
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
  channels: ("EMAIL" | "SMS")[];
  language: string;
  template: string;
  customTemplate?: CustomTemplate;
}

interface CustomTemplate {
  subject: string;
  body: string;
}
