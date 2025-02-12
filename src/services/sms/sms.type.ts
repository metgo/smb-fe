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
  Message: string;
  Recipients: Recipient[];
  Settings: SmsSettings;
}

export interface SmsResponse {
  success: boolean;
  data?: any;
  error?: any;
}
