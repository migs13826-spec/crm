import { NextRequest, NextResponse } from "next/server";
import { validateEmails } from "@/lib/email-validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Please provide an array of emails to validate" },
        { status: 400 }
      );
    }

    if (emails.length > 10000) {
      return NextResponse.json(
        { error: "Maximum 10,000 emails per validation request" },
        { status: 400 }
      );
    }

    const { results, summary } = validateEmails(emails);

    return NextResponse.json({ results, summary });
  } catch (error) {
    console.error("Email validation error:", error);
    return NextResponse.json(
      { error: "An error occurred during validation" },
      { status: 500 }
    );
  }
}
