type EmailActivityStatus =
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "rejected"
  | "deferred"
  | "spam"
  | "unsub";

interface IEmailActivity {
  _id: string;
  mandrillMessageId: string;
  eventKey: string;
  templateName: string;
  email: string;
  subject: string;
  status: EmailActivityStatus;
  rejectReason?: string;
  bounceDescription?: string;
  opens?: number;
  clicks?: number;
  tsSent: string;
  lastEventAt: string;
  rawPayload?: unknown;
}

interface IEmailActivityListParams {
  search?: string;
  status?: EmailActivityStatus | "";
  eventKey?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

interface IEmailActivityListMeta {
  page: number;
  limit: number;
  data: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface IEmailActivityListResult {
  data: IEmailActivity[];
  totalData: number;
  meta: IEmailActivityListMeta;
}

interface IEmailActivityLiveSearchParams {
  search?: string;
  status?: EmailActivityStatus | "";
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

interface IEmailActivityLiveSearchResult {
  data: IEmailActivity[];
  totalData: number;
}

interface IEmailActivityLiveStatsParams {
  search?: string;
  fromDate?: string;
  toDate?: string;
}

interface IEmailActivityLiveStatsResult {
  total: number;
  statusCounts: Record<string, number>;
}

interface IEmailActivityContentResult {
  html: string;
  subject: string;
}

interface IEmailActivityResendResult {
  message: string;
}
