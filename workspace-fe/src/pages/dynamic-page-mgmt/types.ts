export type FileSlot = "primary" | "secondary";

export interface IUploadedFile {
  id: number;
  file?: File;
  name: string;
  size?: number;
  gcsUrl?: string;
  docType?: string;
  docSize?: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
}

export interface PageFormData {
  title: string;
  subTitle: string;
  content: string;
  status?: "DRAFT" | "APPROVED";
}

export type TabId =
  | "terms_and_condition"
  | "privacy"
  | "about_us"
  | "business_regulation"
  | "document_upload";
