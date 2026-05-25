type VoucherStatus =
  | "ACTIVE"
  | "ASSIGNED"
  | "REDEEMED"
  | "EXPIRED"
  | "CANCELED"
  | "UNASSIGNED";

interface CampId {
  _id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  name: string;
  description: string;
  status: string;
  code: string;
  imagePath: string;
  startDate: string;
  endDate: string;
  dmoIds: string[];
  slogan: string;
  type: string;
  categoryIds: string[];
  externalApiId: string;
  link: string;
  category: Category[];
  blacklist: Blacklist;
  whitelist: Whitelist;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  order: number;
}

interface Blacklist {
  event: string[];
  business: string[];
}

interface Whitelist {
  event: string[];
  business: string[];
}

interface PromoDetail {
  promoName: string;
  date: string;
}

interface AssigneeInfo {
  name: string;
  email: string;
  assignedAt: string;
}

interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  email: string;
  language_preference: string;
  password: string;
  isPhoneVerify: boolean;
  isEmailVerify: boolean;
  loginAttempts: number;
  role: string;
  hasBusiness: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  countryCode: string;
  phoneNumber: string;
  languagePreference: string;
  bankAccountId: string;
  address: string;
  isDeleted: boolean;
}

interface CreatorInfo {
  id: UserInfo;
  createdAt: string;
}

interface PurchaserInfo {
  id: UserInfo;
}
interface ParsedData {
  assigneeCountryCode: string;
  assigneeEmail: string;
  assigneeName: string;
  assigneePhone: number;
  noOfVoucher: number;

  AssigneeName?: string;
  NoOfVoucher?: number;
  AssigneeEmail?: string;
  AssigneeCountryCode?: string;
  AssigneePhone?: number;
}

interface IVoucherFormData {
  campaign: string;

  amount: number;
  customAmount: boolean;

  creationType: string;
  bulkCount: number;
  bulkCreateAssigned: boolean;

  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone: string;
  purchaserCountryCode: string;

  assigneeName: string;
  assigneeEmail: string;
  assigneePhone: string;
  assigneeCountryCode: string;

  message: string;
  smsMessage: string;
  sendEmail: boolean;

  expirationDate: string;
  xlsFile: File | null;
}

interface IVoucher {
  _id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  name: string;
  amount: number;
  code: string;
  remainingAmount: number;
  paymentStatus: string;
  status: string;
  waitingUserEmail: string;
  assignedTo: string | null;
  campId: CampId;
  expireDate: string;
  externalApiId: string;
  assignedAt: string;
  reminderCount: number;
  promoDetails: PromoDetail[];
  assigneeInfo: AssigneeInfo;
  creatorInfo: CreatorInfo;
  purchaserInfo: PurchaserInfo;
}

interface IVoucherItem {
  _id: string;

  amount: number;
  remainingAmount: number;

  paymentStatus: "PAID" | "PENDING" | "FAILED";
  status: "ASSIGNED" | "UNASSIGNED" | "EXPIRED" | "USED";

  expireDate: string; // ISO date string

  creatorInfo: {
    id: string;
    createdAt: string; // ISO date string
  };

  assigneeInfo: {
    name: string;
    countryCode: string;
    phone: string;
    email: string;
    assignedAt: string; // ISO date string
  };

  purchaserInfo: {
    id: string;
    name: string;
    countryCode: string;
    phone: string;
    email: string;
  };

  campId: string;
  code: string;
}
