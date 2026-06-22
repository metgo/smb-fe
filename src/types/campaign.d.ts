interface ICampaignPayload {
  name: string;
  code: string;
  description: string;
  slogan: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  startDate: string;
  endDate: string;

  dmoIds: string[];

  rewardAmount: number;
  rewardVoucherLimit: number;
}
