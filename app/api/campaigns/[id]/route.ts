import { NextResponse } from "next/server";
import { deleteCampaign } from "@/lib/campaigns";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const campaignId = Number(id);
    console.log('campaign ID ---->', campaignId);
    // 
    if (!Number.isFinite(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign id" }, { status: 400 });
    }
    const deleted = await deleteCampaign(campaignId);
    if (!deleted) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("error",err);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 },
    );
  }
}
