import { NextResponse } from "next/server";
import { createCampaign, listCampaigns } from "@/lib/campaigns";
import type { CreateCampaignInput } from "@/lib/types";

export async function GET() {
  try {
    const campaigns = await listCampaigns();
    console.log('campaigns---->', campaigns);
    return NextResponse.json(campaigns);
  } catch (err) {
    console.error('error---->', err);
    return NextResponse.json(
      { error: "Failed to list campaigns" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCampaignInput;
    if (
      !body.prefix?.trim() ||
      body.amount == null ||
      !body.currency?.trim() ||
      !body.valid_from ||
      !body.valid_to
    ) {
      return NextResponse.json(
        { error: "prefix, amount, currency, valid_from, valid_to are required" },
        { status: 400 },
      );
    }
    if (new Date(body.valid_from) > new Date(body.valid_to)) {
      return NextResponse.json(
        { error: "valid_from must be before valid_to" },
        { status: 400 },
      );
    }
    const campaign = await createCampaign({
      prefix: body.prefix.trim(),
      amount: Number(body.amount),
      currency: body.currency.trim(),
      valid_from: body.valid_from,
      valid_to: body.valid_to,
    });
    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 },
    );
  }
}
