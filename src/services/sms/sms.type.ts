export interface Recipient {
  FirstName: string;
  LastName?: string;
  Phone: string;
}

export interface SmsSettings {
  Sender: string;
  CampaignName: string;
  TimeToSend: string;
  DelayInSeconds?: number;
  CustomerMessageID?: string;
  ExpireDate?: string;
  Priority?: number;
  MaxSegments?: number;
}

export interface SmsPayload {
  firstName: string;
  lastName: string;
  phone: string;
  message: string;
  sender: string;
  subject: string;
}

export interface SmsResponse {
  success: boolean;
  data?: any;
  error?: any;
}
