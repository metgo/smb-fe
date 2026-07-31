interface IAuthorityStats {
  authorityId: string | null;
  authorityName: string;
  total: number;
}

interface IDMOStats {
  dmoId: string | null;
  total: number;
  authorities: IAuthorityStats[];
}

interface IStatusCount {
  name: string;
  total: number;
}

interface IWebsiteStats {
  websiteId: string | null;
  total: number;
  status: IStatusCount[];
}

interface IStatusChange {
  [key: string]: any;
}

interface IInsights {
  totalChange: number;
  totalChangePercent: number;
  newBusinesses: number;
  statusChanges: IStatusChange[];
  topGrowthDMO: string | null;
  topGrowthWebsite: string | null;
}

interface IStatsSummaryData {
  dmos: IDMOStats[];
  websites: IWebsiteStats[];
  status: IStatusCount[];
  deleted: IStatusCount[];
  has_product: IStatusCount[];
}

interface IBusinessStatsRes {
  _id: string;
  item: string;
  total: number;
  data: IStatsSummaryData[];
  insights: IInsights;
  summaryDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface IBusinessSummaryStatsRes {
  datas: IBusinessStatsRes;
  message: string;
  statusCode: number;
}
