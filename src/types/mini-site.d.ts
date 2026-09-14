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
}

interface ICampaign {
  _id: string;
  name: string;
  status: TCampaignStatus;
  code: string;
  logoPath: string;
  externalApiId: string;

  companyInfo: ICompanyInfo;
  miniSite: IMiniSite;

  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
}

interface ICampaignsRes extends IPagination {
  data: ICampaign[];
}
