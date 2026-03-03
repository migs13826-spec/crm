import { NextRequest, NextResponse } from "next/server";
import { getLists, createList } from "@/lib/store";

export async function GET() {
  const lists = getLists();
  return NextResponse.json({ lists });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const list = createList({ name, description });
    return NextResponse.json({ list }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create list" }, { status: 500 });
  }
}
