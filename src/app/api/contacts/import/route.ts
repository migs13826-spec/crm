import { NextRequest, NextResponse } from "next/server";
import { importContacts } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contacts, listName, tags, updateExisting } = body;

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: "contacts array is required" }, { status: 400 });
    }

    const result = importContacts(
      contacts,
      listName || undefined,
      tags || undefined,
      updateExisting ?? true
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
