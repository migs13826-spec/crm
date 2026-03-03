import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Default org ID for demo (created during seed)
const DEFAULT_ORG_ID = "demo-org";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || "";
    
    const where = search
      ? {
          organizationId: DEFAULT_ORG_ID,
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : { organizationId: DEFAULT_ORG_ID };

    const contacts = await prisma.contactCache.findMany({
      where,
      orderBy: { lastSyncedAt: "desc" },
      take: 100,
    });

    // Transform to frontend format
    const transformed = contacts.map((c) => ({
      id: c.id,
      email: c.email,
      firstName: c.firstName || "",
      lastName: c.lastName || "",
      phone: c.phone || "",
      company: c.company || "",
      lists: (c.listIds as string[]) || [],
      tags: (c.tags as string[]) || [],
      status: c.status || "subscribed",
      addedAt: c.createdAtBrevo?.toISOString() || c.lastSyncedAt.toISOString(),
      lastActivity: "Active",
    }));

    return NextResponse.json({ contacts: transformed, total: transformed.length });
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return NextResponse.json({ contacts: [], total: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, phone, company, lists, tags, status } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const contact = await prisma.contactCache.create({
      data: {
        organizationId: DEFAULT_ORG_ID,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        company: company || null,
        listIds: lists || [],
        tags: tags || [],
        status: status || "subscribed",
        createdAtBrevo: new Date(),
      },
    });

    return NextResponse.json({
      contact: {
        id: contact.id,
        email: contact.email,
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        phone: contact.phone || "",
        company: contact.company || "",
        lists: (contact.listIds as string[]) || [],
        tags: (contact.tags as string[]) || [],
        status: contact.status || "subscribed",
        addedAt: contact.createdAtBrevo?.toISOString() || new Date().toISOString(),
        lastActivity: "Created - just now",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create contact:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
