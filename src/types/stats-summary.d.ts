interface IAuthorityStats {
  authorityId: string | null;
  authorityName: string;
  total: number;
  prevTotal: number;
}

interface IDMOStats {
  dmoId: string | null;
  total: number;
  prevTotal: number;
  authorities: IAuthorityStats[];
}

interface IStatusCount {
  name: string;
  total: number;
  prevTotal: number;
}

interface IWebsiteStats {
  websiteId: string | null;
  total: number;
  prevTotal: number;
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
  topGrowthDMO: {
    name: string;
    growth: number;
  } | null;
  topGrowthWebsite: {
    name: string;
    growth: number;
  } | null;
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
  prevTotal: number;
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

// ========== Points Stats ==========
interface IPoiStats {
  _id: string;
  item: string;
  total: number;
  prevTotal: number;
  data: {
    dmos: IDMOStats[];
    websites: IWebsiteStats[];
    status: IStatusCount[];
    deleted: IStatusCount[];
  }[];
  insights: IInsights;
  summaryDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface IPoiStatsRes {
  datas: IPoiStats;
  message: string;
  statusCode: number;
}
