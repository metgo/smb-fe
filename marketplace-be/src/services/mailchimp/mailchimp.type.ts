export interface sendEmail {
  to: string;
  templatedId: string;
  mergeVars: any;
  text?: string;
  subject?: string;
  from_email?: string;
  from_name?: string;
}
