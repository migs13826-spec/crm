import { NextRequest, NextResponse } from "next/server";
import { getCampaigns, createCampaign } from "@/lib/store";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || undefined;
  const campaigns = getCampaigns(status);
  return NextResponse.json({ campaigns, total: campaigns.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const campaign = createCampaign(body);
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
