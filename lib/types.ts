export type Campaign = {
  id: number;
  prefix: string;
  amount: string;
  currency: string;
  valid_from: string;
  valid_to: string;
  created_at: string;
  voucher_count: number;
};

export type Voucher = {
  id: number;
  campaign_id: number;
  code: string;
  created_at: string;
};

export type CreateCampaignInput = {
  prefix: string;
  amount: number;
  currency: string;
  valid_from: string;
  valid_to: string;
};

export type CreateVouchersBatchResult = {
  created: number;
  requested: number;
  complete: boolean;
};
