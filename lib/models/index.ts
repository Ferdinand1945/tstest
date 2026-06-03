import { CampaignModel } from "./Campaign";
import { VoucherModel } from "./Voucher";

CampaignModel.hasMany(VoucherModel, {
  foreignKey: "campaign_id",
  as: "vouchers",
});
VoucherModel.belongsTo(CampaignModel, {
  foreignKey: "campaign_id",
  as: "campaign",
});

export { CampaignModel, VoucherModel };
