import { NextRequest, NextResponse } from "next/server";
import { getContacts, createContact } from "@/lib/store";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || undefined;
  const contacts = getContacts(search);
  return NextResponse.json({ contacts, total: contacts.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, phone, company, lists, tags, status } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const contact = createContact({
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      phone: phone || "",
      company: company || "",
      lists: lists || [],
      tags: tags || [],
      status: status || "subscribed",
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
