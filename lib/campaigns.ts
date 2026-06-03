import { col, fn, Op } from "sequelize";
import { generateUniqueCodes } from "./voucher-codes";
import { CampaignModel, VoucherModel } from "./models";
import type { Campaign, CreateCampaignInput, Voucher } from "./types";

const INSERT_CHUNK = 5000;

export async function listCampaigns(): Promise<Campaign[]> {
  const rows = await CampaignModel.findAll({
    attributes: {
      include: [[fn("COUNT", col("vouchers.id")), "voucher_count"]],
    },
    include: [{ model: VoucherModel, as: "vouchers", attributes: [] }],
    group: ["CampaignModel.id"],
    order: [["created_at", "DESC"]],
    subQuery: false,
  });

  return rows.map((row) => toCampaign(row));
}

export async function createCampaign(
  input: CreateCampaignInput,
): Promise<Campaign> {
  const row = await CampaignModel.create({
    prefix: input.prefix.toUpperCase(),
    amount: String(input.amount),
    currency: input.currency.toUpperCase(),
    valid_from: input.valid_from,
    valid_to: input.valid_to,
  });

  const campaign = await getCampaign(row.id);
  if (!campaign) throw new Error("Failed to load created campaign");
  return campaign;
}

export async function deleteCampaign(id: number): Promise<boolean> {
  const deleted = await CampaignModel.destroy({ where: { id } });
  return deleted > 0;
}

export async function getCampaign(id: number): Promise<Campaign | null> {
  const row = await CampaignModel.findOne({
    where: { id },
    attributes: {
      include: [[fn("COUNT", col("vouchers.id")), "voucher_count"]],
    },
    include: [{ model: VoucherModel, as: "vouchers", attributes: [] }],
    group: ["CampaignModel.id"],
    subQuery: false,
  });
  return row ? toCampaign(row) : null;
}

export async function listVouchers(
  campaignId: number,
  limit = 100,
  offset = 0,
): Promise<{ vouchers: Voucher[]; total: number }> {
  const { count, rows } = await VoucherModel.findAndCountAll({
    where: { campaign_id: campaignId },
    order: [["id", "DESC"]],
    limit,
    offset,
  });

  return {
    total: count,
    vouchers: rows.map((row) => toVoucher(row)),
  };
}

export async function createVouchersBatch(
  campaignId: number,
  count: number,
): Promise<{ created: number }> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error("Campaign not found");

  const codes = generateUniqueCodes(campaign.prefix, count);
  let created = 0;

  for (let i = 0; i < codes.length; i += INSERT_CHUNK) {
    const chunk = codes.slice(i, i + INSERT_CHUNK);
    const inserted = await VoucherModel.bulkCreate(
      chunk.map((code) => ({ campaign_id: campaignId, code })),
      { ignoreDuplicates: true },
    );
    created += inserted.length;
  }

  return { created };
}

export async function* streamVoucherCodes(
  campaignId: number,
  batchSize = 5000,
): AsyncGenerator<string[]> {
  let lastId = 0;
  while (true) {
    const rows = await VoucherModel.findAll({
      where: { campaign_id: campaignId, id: { [Op.gt]: lastId } },
      attributes: ["id", "code"],
      order: [["id", "ASC"]],
      limit: batchSize,
    });

    if (rows.length === 0) break;
    lastId = Number(rows[rows.length - 1]!.id);
    yield rows.map((row) => row.code);
  }
}

function toCampaign(row: CampaignModel): Campaign {
  const voucherCount = row.get("voucher_count");
  return {
    id: row.id,
    prefix: row.prefix,
    amount: String(row.amount),
    currency: row.currency,
    valid_from: formatDate(row.valid_from),
    valid_to: formatDate(row.valid_to),
    created_at: formatDateTime(row.created_at),
    voucher_count: Number(voucherCount ?? 0),
  };
}

function toVoucher(row: VoucherModel): Voucher {
  return {
    id: Number(row.id),
    campaign_id: row.campaign_id,
    code: row.code,
    created_at: formatDateTime(row.created_at),
  };
}

function formatDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function formatDateTime(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
