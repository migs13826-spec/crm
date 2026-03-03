import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_ORG_ID = "demo-org";

export async function GET() {
  try {
    const totalContacts = await prisma.contactCache.count({
      where: { organizationId: DEFAULT_ORG_ID },
    });

    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: DEFAULT_ORG_ID },
      include: { stats: true },
      orderBy: { createdAt: "desc" },
    });

    const sentCampaigns = campaigns.filter((c) => c.status === "sent");
    const campaignsSent = sentCampaigns.length;

    const statsWithRates = sentCampaigns
      .filter((c) => c.stats)
      .map((c) => ({
        openRate: c.stats!.openRate || 0,
        clickRate: c.stats!.clickRate || 0,
      }));

    const avgOpenRate = statsWithRates.length > 0
      ? Math.round((statsWithRates.reduce((s, c) => s + c.openRate, 0) / statsWithRates.length) * 10) / 10
      : 0;
    const avgClickRate = statsWithRates.length > 0
      ? Math.round((statsWithRates.reduce((s, c) => s + c.clickRate, 0) / statsWithRates.length) * 10) / 10
      : 0;

    const recentCampaigns = campaigns.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      openRate: c.stats?.openRate ?? null,
      sentAt: c.sentAt?.toISOString() || null,
      estimatedRecipients: c.estimatedRecipients || 0,
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      totalContacts,
      campaignsSent,
      avgOpenRate,
      avgClickRate,
      recentCampaigns,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({
      totalContacts: 0,
      campaignsSent: 0,
      avgOpenRate: 0,
      avgClickRate: 0,
      recentCampaigns: [],
    });
  }
}
