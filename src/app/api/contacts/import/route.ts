import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_ORG_ID = "demo-org";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contacts, listName, tags, updateExisting } = body;

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: "contacts array is required" }, { status: 400 });
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const data of contacts) {
      if (!data.email) { skipped++; continue; }

      const existing = await prisma.contactCache.findFirst({
        where: {
          organizationId: DEFAULT_ORG_ID,
          email: { equals: data.email, mode: "insensitive" },
        },
      });

      if (existing) {
        if (updateExisting) {
          const currentLists = (existing.listIds as string[]) || [];
          const currentTags = (existing.tags as string[]) || [];
          await prisma.contactCache.update({
            where: { id: existing.id },
            data: {
              ...(data.firstName && { firstName: data.firstName }),
              ...(data.lastName && { lastName: data.lastName }),
              ...(data.phone && { phone: data.phone }),
              ...(data.company && { company: data.company }),
              listIds: listName && !currentLists.includes(listName)
                ? [...currentLists, listName]
                : currentLists,
              tags: tags
                ? [...new Set([...currentTags, ...tags])]
                : currentTags,
            },
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await prisma.contactCache.create({
          data: {
            organizationId: DEFAULT_ORG_ID,
            email: data.email,
            firstName: data.firstName || null,
            lastName: data.lastName || null,
            phone: data.phone || null,
            company: data.company || null,
            listIds: listName ? [listName] : [],
            tags: tags || [],
            status: "subscribed",
            createdAtBrevo: new Date(),
          },
        });
        imported++;
      }
    }

    return NextResponse.json({ imported, updated, skipped });
  } catch (error) {
    console.error("Import failed:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
