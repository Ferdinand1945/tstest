import { NextResponse } from "next/server";
import { createVouchersBatch, listVouchers } from "@/lib/campaigns";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const campaignId = Number(id);
    if (!Number.isFinite(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign id" }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    //console.log('searchParams  >', searchParams);
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);
    const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);
    const result = await listVouchers(campaignId, limit, offset);
    console.log('result ---->', result);
    return NextResponse.json(result);

  } catch (err) {
    console.error('error---->', err);
    return NextResponse.json(
      { error: "Failed to list vouchers" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const campaignId = Number(id);
    if (!Number.isFinite(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign id" }, { status: 400 });
    }
    const body = (await request.json()) as { count?: number };
    // const countRaw = body.count;
    const count = Number(body.count);
 
    if (!Number.isFinite(count) || count < 1 || count > 200_000) {
      return NextResponse.json(
        { error: "count must be between 1 and 200000" },
        { status: 400 },
      );
    }

    const result = await createVouchersBatch(campaignId, count);
    console.log('create vouchersresult ---->', result);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);

    const message = err instanceof Error ? err.message : "Failed to create vouchers";
    const status = message === "Campaign not found" ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
