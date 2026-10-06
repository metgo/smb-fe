type EmailConfigLanguage = "en" | "he";

interface IEmailConfig {
  _id: string;
  eventKey: string;
  label: string;
  category: string;
  language: EmailConfigLanguage;
  mailchimpTemplateName: string;
  subject: string;
  htmlContent: string;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  createdBy?: string;
  updatedBy?: string;
}

interface IEmailConfigListParams {
  search?: string;
  category?: string;
  language?: EmailConfigLanguage | "";
  page?: number;
  limit?: number;
}

interface IEmailConfigListMeta {
  page: number;
  limit: number;
  data: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface IEmailConfigListResult {
  data: IEmailConfig[];
  totalData: number;
  meta: IEmailConfigListMeta;
}

interface IEmailConfigFormPayload {
  eventKey: string;
  label: string;
  category: string;
  language: EmailConfigLanguage;
  mailchimpTemplateName: string;
  subject: string;
  htmlContent: string;
  isActive: boolean;
}

interface IEmailConfigMergeVars {
  [key: string]: string;
}

interface IEmailConfigPreviewResult {
  html: string;
}
