// Email validation utilities
// In production, this would integrate with a service like ZeroBounce, Hunter.io, or Brevo's own validation

export interface EmailValidationResult {
  email: string;
  valid: boolean;
  reason: string;
  suggestion?: string;
  riskLevel: "low" | "medium" | "high" | "unknown";
}

// Basic format validation
function isValidFormat(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Check for common disposable email domains
const disposableDomains = new Set([
  "tempmail.com",
  "throwaway.email",
  "guerrillamail.com",
  "mailinator.com",
  "yopmail.com",
  "sharklasers.com",
  "guerrillamailblock.com",
  "grr.la",
  "dispostable.com",
  "trashmail.com",
  "10minutemail.com",
  "temp-mail.org",
  "fakeinbox.com",
  "tempail.com",
  "maildrop.cc",
]);

// Check for common typos in popular domains
const domainSuggestions: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmaill.com": "gmail.com",
  "gnail.com": "gmail.com",
  "hotmal.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "outloo.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
};

// Check for role-based emails (less likely to be real people)
const roleAddresses = new Set([
  "admin",
  "info",
  "support",
  "sales",
  "contact",
  "hello",
  "help",
  "noreply",
  "no-reply",
  "postmaster",
  "webmaster",
  "abuse",
  "billing",
  "security",
  "team",
  "office",
  "marketing",
  "hr",
  "careers",
  "feedback",
  "press",
  "media",
]);

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();

  // Check format
  if (!isValidFormat(trimmed)) {
    return {
      email: trimmed,
      valid: false,
      reason: "Invalid email format",
      riskLevel: "high",
    };
  }

  const [localPart, domain] = trimmed.split("@");

  // Check for empty parts
  if (!localPart || !domain) {
    return {
      email: trimmed,
      valid: false,
      reason: "Missing local part or domain",
      riskLevel: "high",
    };
  }

  // Check for disposable email
  if (disposableDomains.has(domain)) {
    return {
      email: trimmed,
      valid: false,
      reason: "Disposable/temporary email address",
      riskLevel: "high",
    };
  }

  // Check for domain typos
  const suggestion = domainSuggestions[domain];
  if (suggestion) {
    return {
      email: trimmed,
      valid: false,
      reason: `Possible typo in domain (did you mean @${suggestion}?)`,
      suggestion: `${localPart}@${suggestion}`,
      riskLevel: "medium",
    };
  }

  // Check for role-based addresses
  if (roleAddresses.has(localPart)) {
    return {
      email: trimmed,
      valid: true,
      reason: "Role-based email address (may have lower engagement)",
      riskLevel: "medium",
    };
  }

  // Check for suspicious patterns
  if (localPart.length < 2) {
    return {
      email: trimmed,
      valid: true,
      reason: "Very short local part",
      riskLevel: "medium",
    };
  }

  // Check for excessive numbers or random-looking strings
  const numberRatio = (localPart.match(/\d/g) || []).length / localPart.length;
  if (numberRatio > 0.7 && localPart.length > 8) {
    return {
      email: trimmed,
      valid: true,
      reason: "Appears to be auto-generated",
      riskLevel: "medium",
    };
  }

  // Check domain has valid TLD
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) {
    return {
      email: trimmed,
      valid: false,
      reason: "Invalid top-level domain",
      riskLevel: "high",
    };
  }

  // Passed all checks
  return {
    email: trimmed,
    valid: true,
    reason: "Valid email address",
    riskLevel: "low",
  };
}

export function validateEmails(emails: string[]): {
  results: EmailValidationResult[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    risky: number;
  };
} {
  const results = emails.map(validateEmail);
  const valid = results.filter((r) => r.valid && r.riskLevel === "low").length;
  const invalid = results.filter((r) => !r.valid).length;
  const risky = results.filter((r) => r.valid && r.riskLevel !== "low").length;

  return {
    results,
    summary: {
      total: results.length,
      valid,
      invalid,
      risky,
    },
  };
}
