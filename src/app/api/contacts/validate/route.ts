import { NextRequest, NextResponse } from "next/server";
import { validateEmail, validateEmails, validateEmailQuick } from "@/lib/email-validation";
import type { EmailValidationResult } from "@/lib/email-validation";

// In-memory validation cache (persists across requests in the same server process)
declare global {
  // eslint-disable-next-line no-var
  var _validationCache: Map<string, EmailValidationResult> | undefined;
}

function getCache(): Map<string, EmailValidationResult> {
  if (!global._validationCache) {
    global._validationCache = new Map();
  }
  return global._validationCache;
}

function saveResult(result: EmailValidationResult) {
  getCache().set(result.email.toLowerCase(), result);
}

function buildSummary(results: EmailValidationResult[]) {
  return {
    total: results.length,
    valid: results.filter((r) => r.status === "valid").length,
    invalid: results.filter((r) => r.status === "invalid").length,
    catchAll: results.filter((r) => r.status === "catch-all").length,
    unknown: results.filter((r) => r.status === "unknown").length,
    doNotMail: results.filter((r) =>
      r.status === "do_not_mail" || r.status === "spamtrap" || r.status === "abuse"
    ).length,
    risky: results.filter((r) => r.status === "catch-all" || r.status === "unknown").length,
  };
}

// GET /api/contacts/validate?email=... - Get cached validation result
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (email) {
    const cached = getCache().get(email.toLowerCase());
    if (cached) return NextResponse.json(cached);
    return NextResponse.json({ error: "No validation result found" }, { status: 404 });
  }

  // Return all cached results
  const all = Array.from(getCache().values());
  return NextResponse.json({ results: all, total: all.length });
}

// POST /api/contacts/validate
// Supports both single email and bulk validation
// Body: { email: string } for single, { emails: string[] } for bulk
// Query: ?mode=quick for DNS-only (no SMTP), default is full validation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = req.nextUrl.searchParams.get("mode") || "full";

    // Single email validation
    if (body.email && typeof body.email === "string") {
      const result = mode === "quick"
        ? await validateEmailQuick(body.email)
        : await validateEmail(body.email);

      // Persist result
      saveResult(result);

      return NextResponse.json(result);
    }

    // Bulk email validation
    if (body.emails && Array.isArray(body.emails)) {
      if (body.emails.length === 0) {
        return NextResponse.json(
          { error: "Please provide at least one email to validate" },
          { status: 400 }
        );
      }

      if (body.emails.length > 10000) {
        return NextResponse.json(
          { error: "Maximum 10,000 emails per validation request" },
          { status: 400 }
        );
      }

      const concurrency = body.concurrency || 5;

      if (mode === "quick") {
        const results: EmailValidationResult[] = [];
        for (let i = 0; i < body.emails.length; i += concurrency) {
          const batch = body.emails.slice(i, i + concurrency);
          const batchResults = await Promise.all(
            batch.map((email: string) => validateEmailQuick(email))
          );
          results.push(...batchResults);
        }

        // Persist all results
        results.forEach(saveResult);

        return NextResponse.json({ results, summary: buildSummary(results) });
      }

      // Full mode: DNS + SMTP verification
      const { results, summary } = await validateEmails(body.emails, concurrency);

      // Persist all results
      results.forEach(saveResult);

      return NextResponse.json({ results, summary });
    }

    return NextResponse.json(
      { error: "Please provide either 'email' (string) or 'emails' (array) in the request body" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Email validation error:", error);
    return NextResponse.json(
      { error: "An error occurred during validation" },
      { status: 500 }
    );
  }
}
