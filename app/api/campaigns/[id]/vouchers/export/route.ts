import { getCampaign, streamVoucherCodes } from "@/lib/campaigns";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const campaignId = Number(id);
    if (!Number.isFinite(campaignId)) {
      return new Response("Invalid campaign id", { status: 400 });
    }
    const campaign = await getCampaign(campaignId);
    if (!campaign) {
      console.log('no campaungs');
      return new Response("Campaign not found", { status: 404 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode("code\n"));
        for await (const codes of streamVoucherCodes(campaignId)) {
          for (const code of codes) {
            controller.enqueue(encoder.encode(`${code}\n`));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="vouchers-${campaign.prefix}-${campaignId}.csv"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Failed to export vouchers", { status: 500 });
  }
}
