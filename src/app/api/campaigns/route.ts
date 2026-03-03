import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_ORG_ID = "demo-org";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");

    const campaigns = await prisma.campaign.findMany({
      where: {
        organizationId: DEFAULT_ORG_ID,
        ...(status && status !== "all" ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { stats: true },
    });

    const transformed = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status,
      senderName: c.senderName || "",
      senderEmail: c.senderEmail || "",
      subject: c.subject || "",
      previewText: c.previewText || "",
      recipientType: c.recipientType || "",
      selectedLists: (c.listIds as string[]) || [],
      estimatedRecipients: c.estimatedRecipients || 0,
      scheduledAt: c.scheduledAt?.toISOString() || null,
      sentAt: c.sentAt?.toISOString() || null,
      openRate: c.stats?.openRate ?? null,
      clickRate: c.stats?.clickRate ?? null,
      unsubRate: c.stats ? (c.stats.unsubscribes / Math.max(c.stats.delivered, 1)) * 100 : null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ campaigns: transformed, total: transformed.length });
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return NextResponse.json({ campaigns: [], total: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const campaign = await prisma.campaign.create({
      data: {
        organizationId: DEFAULT_ORG_ID,
        name: body.name || "Untitled Campaign",
        type: body.type || "regular",
        status: body.status || "draft",
        senderName: body.senderName || null,
        senderEmail: body.senderEmail || null,
        replyTo: body.replyTo || null,
        subject: body.subject || null,
        previewText: body.previewText || null,
        htmlContent: body.htmlContent || null,
        recipientType: body.recipientType || null,
        listIds: body.selectedLists || [],
        estimatedRecipients: body.estimatedRecipients || 0,
        sentAt: body.sentAt ? new Date(body.sentAt) : null,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        tags: body.tags || [],
      },
    });

    // Create stats if sent
    if (body.status === "sent") {
      await prisma.campaignStats.create({
        data: {
          campaignId: campaign.id,
          organizationId: DEFAULT_ORG_ID,
          sent: body.estimatedRecipients || 0,
          delivered: Math.floor((body.estimatedRecipients || 0) * 0.985),
        },
      });
    }

    return NextResponse.json({ campaign: { id: campaign.id, name: campaign.name, status: campaign.status } }, { status: 201 });
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
