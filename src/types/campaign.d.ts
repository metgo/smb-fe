interface ICampaignPayload {
  // Step 1
  name: string;
  code: string;
  description?: string;
  slogan?: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  type: "CASH_IN" | "CASH_BACK";
  startDate: string;
  endDate: string;

  // step 2
  imagePath?: string;

  // step 3
  dmoIds: string[];

  // step 4
  rewardAmount?: number;
  rewardVoucherLimit?: number;
}
