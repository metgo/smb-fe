type TCampaignStatus = "ACTIVE" | "INACTIVE";

interface ICompanyInfo {
  name: string;
  contactPerson: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
}

interface IMiniSite {
  title: string; // HTML string
  subTitle: string; // HTML string
  greeting: string; // HTML string
  deliveryAddress: string;
  isDeliveredToHome: boolean;
  amount: number;
  quantity: number;
}

interface ICampaign {
  _id: string;
  name: string;
  status: TCampaignStatus;
  code: string;
  logoPath: string;
  footerImage: string;
  backgroundImage: string;
  externalApiId: string;

  companyInfo: ICompanyInfo;
  miniSite: IMiniSite;

  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
}

interface ICampaignsRes extends IPagination {
  data: ICampaign[];
}

interface IMiniSiteStatsRes {
  totalMiniSites: number;
  activeMiniSites: number;
  totalRevenue: number;
  totalVouchers: number;
  usedVouchers: number;
  conversionRate: number;
}

interface IMinisiteDetailsRes extends IAuditInfo {
  _id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED" | "PAUSED" | "COMPLETED";
  code: string;
  logoPath: string;
  backgroundImage: string;
  footerImage: string;
  externalApiId: string;
  startDate: string;
  endDate: string;
  productIds: {
    _id: string;
    name?: string;
    shortDescription: string;
    image: string;
    price: number;
  }[];
  companyInfo: {
    name: string;
    contactPerson: string;
    phoneNumber: string;
    email: string;
  };
  miniSite: {
    title: string;
    subTitle: string;
    greeting: string;
    deliveryAddress: string;
    isDeliveredToHome: boolean;
    quantity: number;
    amount: number;
  };
}

// Minisite Voucher upload
interface IMinisiteVoucherUploadPayload {
  campaignId: string;
  languagePreference: string;
  purchaserCountryCode: string;
  purchaserEmail: string;
  purchaserName: string;
  purchaserPhone: string;
  vouchers: {
    assigneeName: string;
    assigneeEmail: string;
    assigneeCountryCode: string;
    assigneePhone: string;
  }[];
}

interface IMinisiteVoucherUploadRes {
  _id: string;
  assigneeInfo: {
    name: string;
    countryCode: string;
    phone: string;
    email: string;
    assignedAt: string;
  };
  smsReceived: "FAILED" | "SUCCESS";
  emailSent: "FAILED" | "SUCCESS";
}
