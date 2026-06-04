import { col, fn, Op } from "sequelize";
import { generateUniqueCodes } from "./voucher-codes";
import { CampaignModel, VoucherModel } from "./models";
import type {
  Campaign,
  CreateCampaignInput,
  CreateVouchersBatchResult,
  Voucher,
} from "./types";

const INSERT_CHUNK = 5000;
/** Max top-up rounds when DB rejects codes that collide with existing rows */
const MAX_BATCH_ROUNDS = 50;

export async function listCampaigns(): Promise<Campaign[]> {
  const rows = await CampaignModel.findAll({
    attributes: {
      include: [[fn("COUNT", col("vouchers.id")), "voucher_count"]],
    },
    include: [{ model: VoucherModel, as: "vouchers", attributes: [] }],
    group: [col("campaign.id")],
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
    group: [col("campaign.id")],
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
): Promise<CreateVouchersBatchResult> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error("Campaign not found");

  let created = 0;
  let rounds = 0;

  while (created < count && rounds < MAX_BATCH_ROUNDS) {
    rounds += 1;
    const remaining = count - created;
    const codes = generateUniqueCodes(campaign.prefix, remaining);
    const inserted = await insertVoucherCodes(campaignId, codes);
    created += inserted;

    if (inserted === 0) {
      throw new Error(
        `Could not create more unique codes for prefix "${campaign.prefix}". ` +
          `Created ${created} of ${count} requested (code space may be exhausted).`,
      );
    }
  }

  if (created < count) {
    throw new Error(
      `Created ${created} of ${count} requested vouchers after ${MAX_BATCH_ROUNDS} top-up rounds.`,
    );
  }

  return { created, requested: count, complete: true };
}

async function insertVoucherCodes(
  campaignId: number,
  codes: string[],
): Promise<number> {
  let inserted = 0;
  for (let i = 0; i < codes.length; i += INSERT_CHUNK) {
    const chunk = codes.slice(i, i + INSERT_CHUNK);
    const rows = await VoucherModel.bulkCreate(
      chunk.map((code) => ({ campaign_id: campaignId, code })),
      { ignoreDuplicates: true },
    );
    inserted += rows.length;
  }
  return inserted;
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
