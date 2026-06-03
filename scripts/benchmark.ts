import { createWriteStream } from "fs";
import { join } from "path";
import {
  createCampaign,
  createVouchersBatch,
  deleteCampaign,
  streamVoucherCodes,
} from "../lib/campaigns";

const COUNT = 100_000;

async function exportToFile(campaignId: number, filePath: string): Promise<number> {
  const file = createWriteStream(filePath);
  let lines = 0;
  file.write("code\n");
  lines += 1;
  for await (const codes of streamVoucherCodes(campaignId)) {
    for (const code of codes) {
      file.write(`${code}\n`);
      lines += 1;
    }
  }
  await new Promise<void>((resolve, reject) => {
    file.end(() => resolve());
    file.on("error", reject);
  });
  return lines;
}

async function main() {
  const prefix = `BENCH${Date.now().toString(36).toUpperCase().slice(-4)}`;
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const validTo = nextYear.toISOString().slice(0, 10);

  console.log(`Creating benchmark campaign (prefix: ${prefix})...`);
  const campaign = await createCampaign({
    prefix,
    amount: 10,
    currency: "EUR",
    valid_from: today,
    valid_to: validTo,
  });

  console.log(`Generating ${COUNT.toLocaleString()} vouchers...`);
  const createStart = performance.now();
  const { created } = await createVouchersBatch(campaign.id, COUNT);
  const createMs = performance.now() - createStart;
  console.log(
    `Created ${created.toLocaleString()} vouchers in ${(createMs / 1000).toFixed(2)}s (${Math.round(created / (createMs / 1000)).toLocaleString()}/s)`,
  );

  const csvPath = join(process.cwd(), `benchmark-vouchers-${campaign.id}.csv`);
  console.log(`Exporting CSV to ${csvPath}...`);
  const exportStart = performance.now();
  const lineCount = await exportToFile(campaign.id, csvPath);
  const exportMs = performance.now() - exportStart;
  console.log(
    `Exported ${lineCount.toLocaleString()} lines in ${(exportMs / 1000).toFixed(2)}s`,
  );

  const totalMs = createMs + exportMs;
  console.log(`Total: ${(totalMs / 1000).toFixed(2)}s`);
  const ok = created === COUNT && lineCount === COUNT + 1;
  console.log(ok ? "PASS" : "FAIL");

  console.log("Cleaning up benchmark campaign...");
  await deleteCampaign(campaign.id);
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
