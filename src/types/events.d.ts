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