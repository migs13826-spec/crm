import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_ORG_ID = "demo-org";

export async function GET() {
  try {
    // Get unique list names from contacts
    const contacts = await prisma.contactCache.findMany({
      where: { organizationId: DEFAULT_ORG_ID },
      select: { listIds: true },
    });

    const listCounts = new Map<string, number>();
    for (const c of contacts) {
      const lists = (c.listIds as string[]) || [];
      for (const l of lists) {
        listCounts.set(l, (listCounts.get(l) || 0) + 1);
      }
    }

    const lists = Array.from(listCounts.entries()).map(([name, count], i) => ({
      id: `list-${i}`,
      name,
      contactCount: count,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({ lists });
  } catch (error) {
    console.error("Failed to fetch lists:", error);
    return NextResponse.json({ lists: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    // Lists are implicit from contact listIds, just return success
    return NextResponse.json({ list: { id: `list-${Date.now()}`, name, contactCount: 0 } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create list" }, { status: 500 });
  }
}
