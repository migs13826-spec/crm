// Advanced Email Validation Engine
// Performs real DNS/MX lookups, SMTP mailbox verification, disposable/role detection
// Designed to be more thorough than ZeroBounce for hardbounce prevention

import dns from "dns";
import net from "net";

// ========== Types ==========

export interface EmailValidationResult {
  email: string;
  status: "valid" | "invalid" | "catch-all" | "unknown" | "spamtrap" | "abuse" | "do_not_mail";
  subStatus: string;
  freeEmail: boolean;
  didYouMean: string | null;
  account: string;
  domain: string;
  domainAgeDays: number | null;
  smtpProvider: string | null;
  mxFound: boolean;
  mxRecord: string | null;
  firstName: string | null;
  lastName: string | null;
  score: number; // 0-100 deliverability score
}

export interface BulkValidationResult {
  results: EmailValidationResult[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    catchAll: number;
    unknown: number;
    doNotMail: number;
    risky: number;
  };
}

// ========== Disposable Domain Database ==========

const disposableDomains = new Set([
  "tempmail.com", "throwaway.email", "guerrillamail.com", "mailinator.com",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "dispostable.com", "trashmail.com", "10minutemail.com", "temp-mail.org",
  "fakeinbox.com", "tempail.com", "maildrop.cc", "mailnesia.com",
  "guerrillamail.info", "guerrillamail.net", "guerrillamail.de",
  "guerrillamail.biz", "spam4.me", "binkmail.com", "bobmail.info",
  "chammy.info", "devnullmail.com", "dispostable.com", "emailisvalid.com",
  "emailondeck.com", "emailsensei.com", "getairmail.com", "getnada.com",
  "harakirimail.com", "inboxkitten.com", "jetable.org", "kurzepost.de",
  "mail-temporaire.fr", "mailcatch.com", "mailsac.com", "mintemail.com",
  "mohmal.com", "mvrht.com", "mytemp.email", "nada.email",
  "owlpic.com", "pokemail.net", "protonmail.com", "spambox.us",
  "spamcowboy.com", "spamgourmet.com", "tempinbox.com", "tempr.email",
  "throwam.com", "trash-mail.at", "trashmail.me", "wegwerfmail.de",
  "yopmail.fr", "yopmail.net", "mailtemp.info", "burnermail.io",
  "guerrillamail.com", "duck.com", "tmail.ws", "tempmailo.com",
  "temp-mail.io", "disposableemailaddress.com", "tempmailaddress.com",
]);

// ========== Free Email Provider Database ==========

const freeEmailProviders = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "icloud.com", "mail.com", "zoho.com", "protonmail.com", "yandex.com",
  "gmx.com", "gmx.net", "live.com", "msn.com", "me.com",
  "yahoo.co.uk", "yahoo.co.in", "yahoo.ca", "yahoo.com.au",
  "hotmail.co.uk", "hotmail.fr", "hotmail.de", "hotmail.it",
  "outlook.fr", "outlook.de", "outlook.es", "outlook.it",
  "googlemail.com", "inbox.com", "fastmail.com", "hushmail.com",
  "tutanota.com", "mailfence.com", "runbox.com", "posteo.de",
  "disroot.org", "riseup.net", "cock.li", "airmail.cc",
  "yahoo.com.ph", "yahoo.com.sg", "yahoo.co.jp",
]);

// ========== Role-Based Addresses ==========

const roleAddresses = new Set([
  "admin", "administrator", "info", "support", "sales", "contact",
  "hello", "help", "noreply", "no-reply", "postmaster", "webmaster",
  "abuse", "billing", "security", "team", "office", "marketing",
  "hr", "careers", "feedback", "press", "media", "legal",
  "compliance", "privacy", "service", "operations", "ops",
  "hostmaster", "mailer-daemon", "root", "devnull", "null",
  "register", "registrar", "unsubscribe", "subscribe",
  "newsletter", "alerts", "notifications", "daemon",
]);

// ========== Spamtrap Patterns ==========

const spamtrapPatterns = [
  /^spamtrap/i,
  /^honey\.?pot/i,
  /^trap@/i,
  /^(abuse|spam).*@/i,
];

// ========== Domain Typo Suggestions ==========

const domainSuggestions: Record<string, string> = {
  "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gamil.com": "gmail.com",
  "gmail.co": "gmail.com", "gmaill.com": "gmail.com", "gnail.com": "gmail.com",
  "gmaik.com": "gmail.com", "gmsil.com": "gmail.com", "gmali.com": "gmail.com",
  "gmai.com": "gmail.com", "gmailcom": "gmail.com", "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com", "gmail.con": "gmail.com", "gmaul.com": "gmail.com",
  "hotmal.com": "hotmail.com", "hotmial.com": "hotmail.com",
  "hotmil.com": "hotmail.com", "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com", "hotamil.com": "hotmail.com",
  "hotmai.com": "hotmail.com", "hitmail.com": "hotmail.com",
  "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com", "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com", "yaoo.com": "yahoo.com",
  "yhoo.com": "yahoo.com",
  "outloo.com": "outlook.com", "outlok.com": "outlook.com",
  "outloook.com": "outlook.com", "outlool.com": "outlook.com",
  "outlook.co": "outlook.com", "outlook.con": "outlook.com",
  "iclod.com": "icloud.com", "icloud.co": "icloud.com",
  "icoud.com": "icloud.com", "iclould.com": "icloud.com",
  "aol.co": "aol.com", "aol.con": "aol.com",
  "protonmail.co": "protonmail.com", "protonmal.com": "protonmail.com",
};

// ========== SMTP Provider Detection ==========

const smtpProviderMap: Record<string, string> = {
  "google": "google",
  "gmail": "google",
  "googlemail": "google",
  "outlook": "microsoft",
  "hotmail": "microsoft",
  "microsoft": "microsoft",
  "office365": "microsoft",
  "protection.outlook": "microsoft",
  "pphosted": "proofpoint",
  "proofpoint": "proofpoint",
  "mimecast": "mimecast",
  "barracuda": "barracuda",
  "messagelabs": "symantec",
  "symantec": "symantec",
  "forcepoint": "forcepoint",
  "sophos": "sophos",
  "zoho": "zoho",
  "amazonses": "amazon_ses",
  "amazonaws": "amazon_ses",
  "sendgrid": "sendgrid",
  "mailgun": "mailgun",
  "sparkpost": "sparkpost",
  "postmark": "postmark",
  "sendinblue": "brevo",
  "brevo": "brevo",
  "mailchimp": "mailchimp",
  "mandrillapp": "mailchimp",
  "yahoo": "yahoo",
  "yandex": "yandex",
  "icloud": "apple",
  "apple": "apple",
  "qq.com": "tencent",
  "163.com": "netease",
  "secureserver": "godaddy",
  "emailsrvr": "rackspace",
  "coxmail": "cox",
  "comcast": "comcast",
  "att.net": "att",
};

// ========== DNS Utilities ==========

function resolveMx(domain: string): Promise<dns.MxRecord[]> {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err) reject(err);
      else resolve(addresses || []);
    });
  });
}

function resolveA(domain: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) reject(err);
      else resolve(addresses || []);
    });
  });
}

function resolveSoa(domain: string): Promise<dns.SoaRecord | null> {
  return new Promise((resolve) => {
    dns.resolveSoa(domain, (err, record) => {
      if (err) resolve(null);
      else resolve(record);
    });
  });
}

// ========== SMTP Verification ==========

interface SmtpCheckResult {
  canConnect: boolean;
  mailboxExists: boolean | null; // null = unknown (greylisting, timeout)
  isCatchAll: boolean;
  smtpBanner: string | null;
  responseCode: number | null;
}

async function checkSmtp(
  email: string,
  mxHost: string,
  timeoutMs: number = 8000
): Promise<SmtpCheckResult> {
  return new Promise((resolve) => {
    const result: SmtpCheckResult = {
      canConnect: false,
      mailboxExists: null,
      isCatchAll: false,
      smtpBanner: null,
      responseCode: null,
    };

    const socket = new net.Socket();
    let step = 0;
    let buffer = "";

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve(result);
    }, timeoutMs);

    socket.on("error", () => {
      clearTimeout(timer);
      cleanup();
      resolve(result);
    });

    socket.on("data", (data) => {
      buffer += data.toString();

      // Wait for complete response (ends with \r\n)
      if (!buffer.includes("\r\n") && !buffer.includes("\n")) return;

      const lines = buffer.split(/\r?\n/);
      const lastCompleteLine = lines[lines.length - 2] || lines[0];
      const code = parseInt(lastCompleteLine.substring(0, 3), 10);
      buffer = "";

      switch (step) {
        case 0: // Banner
          if (code === 220) {
            result.canConnect = true;
            result.smtpBanner = lastCompleteLine.substring(4).trim();
            socket.write("EHLO mail-validator.local\r\n");
            step = 1;
          } else {
            clearTimeout(timer);
            cleanup();
            resolve(result);
          }
          break;

        case 1: // EHLO response
          if (code === 250) {
            socket.write(`MAIL FROM:<check@mail-validator.local>\r\n`);
            step = 2;
          } else {
            clearTimeout(timer);
            cleanup();
            resolve(result);
          }
          break;

        case 2: // MAIL FROM response
          if (code === 250) {
            socket.write(`RCPT TO:<${email}>\r\n`);
            step = 3;
          } else {
            clearTimeout(timer);
            cleanup();
            resolve(result);
          }
          break;

        case 3: // RCPT TO response - the key check
          result.responseCode = code;
          if (code === 250) {
            result.mailboxExists = true;
            // Now check for catch-all by testing a random address
            const randomAddr = `check-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@${email.split("@")[1]}`;
            socket.write(`RCPT TO:<${randomAddr}>\r\n`);
            step = 4;
          } else if (code === 550 || code === 551 || code === 552 || code === 553 || code === 554) {
            result.mailboxExists = false;
          } else if (code === 450 || code === 451 || code === 452) {
            // Greylisting or temp failure
            result.mailboxExists = null;
          }

          if (step !== 4) {
            socket.write("QUIT\r\n");
            step = 99;
          }
          break;

        case 4: // Catch-all check
          if (code === 250) {
            result.isCatchAll = true;
          }
          socket.write("QUIT\r\n");
          step = 99;
          break;

        case 99: // QUIT
          clearTimeout(timer);
          cleanup();
          resolve(result);
          break;
      }
    });

    socket.on("close", () => {
      clearTimeout(timer);
      resolve(result);
    });

    socket.connect(25, mxHost);
  });
}

// ========== Name Extraction ==========

function extractNameFromEmail(localPart: string): { firstName: string | null; lastName: string | null } {
  // Common patterns: first.last, first_last, firstlast
  const cleaned = localPart.replace(/[0-9]+$/g, ""); // Remove trailing numbers

  // Try dot separator
  if (cleaned.includes(".")) {
    const parts = cleaned.split(".");
    if (parts.length >= 2 && parts[0].length > 1 && parts[1].length > 1) {
      return {
        firstName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase(),
        lastName: parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1).toLowerCase(),
      };
    }
  }

  // Try underscore separator
  if (cleaned.includes("_")) {
    const parts = cleaned.split("_");
    if (parts.length >= 2 && parts[0].length > 1 && parts[1].length > 1) {
      return {
        firstName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase(),
        lastName: parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1).toLowerCase(),
      };
    }
  }

  // Try hyphen separator
  if (cleaned.includes("-")) {
    const parts = cleaned.split("-");
    if (parts.length >= 2 && parts[0].length > 1 && parts[1].length > 1) {
      return {
        firstName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase(),
        lastName: parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1).toLowerCase(),
      };
    }
  }

  return { firstName: null, lastName: null };
}

// ========== SMTP Provider Detection ==========

function detectSmtpProvider(mxRecord: string | null, smtpBanner: string | null): string | null {
  const toCheck = `${mxRecord || ""} ${smtpBanner || ""}`.toLowerCase();
  for (const [pattern, provider] of Object.entries(smtpProviderMap)) {
    if (toCheck.includes(pattern.toLowerCase())) {
      return provider;
    }
  }
  return null;
}

// ========== Score Calculation ==========

function calculateScore(result: Partial<EmailValidationResult>): number {
  let score = 0;

  if (result.status === "valid") score += 50;
  else if (result.status === "catch-all") score += 30;
  else if (result.status === "unknown") score += 15;
  else return 0; // invalid, spamtrap, abuse, do_not_mail

  if (result.mxFound) score += 15;
  if (result.smtpProvider) score += 10;
  if (!result.freeEmail) score += 5;
  if (result.subStatus === "mailbox_found") score += 15;
  if (result.subStatus === "role_based") score -= 10;
  if (result.domainAgeDays && result.domainAgeDays > 365) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ========== Main Validation Function ==========

export async function validateEmail(email: string): Promise<EmailValidationResult> {
  const trimmed = email.trim().toLowerCase();
  const baseResult: EmailValidationResult = {
    email: trimmed,
    status: "unknown",
    subStatus: "",
    freeEmail: false,
    didYouMean: null,
    account: "",
    domain: "",
    domainAgeDays: null,
    smtpProvider: null,
    mxFound: false,
    mxRecord: null,
    firstName: null,
    lastName: null,
    score: 0,
  };

  // Basic format check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(trimmed)) {
    baseResult.status = "invalid";
    baseResult.subStatus = "invalid_format";
    baseResult.score = 0;
    return baseResult;
  }

  const [localPart, domain] = trimmed.split("@");
  baseResult.account = localPart;
  baseResult.domain = domain;

  if (!localPart || !domain) {
    baseResult.status = "invalid";
    baseResult.subStatus = "invalid_format";
    return baseResult;
  }

  // Extract name
  const { firstName, lastName } = extractNameFromEmail(localPart);
  baseResult.firstName = firstName;
  baseResult.lastName = lastName;

  // Free email check
  baseResult.freeEmail = freeEmailProviders.has(domain);

  // Domain typo suggestion
  const suggestion = domainSuggestions[domain];
  if (suggestion) {
    baseResult.didYouMean = `${localPart}@${suggestion}`;
  }

  // Disposable email check
  if (disposableDomains.has(domain)) {
    baseResult.status = "do_not_mail";
    baseResult.subStatus = "disposable";
    baseResult.score = 0;
    return baseResult;
  }

  // Spamtrap check
  for (const pattern of spamtrapPatterns) {
    if (pattern.test(trimmed)) {
      baseResult.status = "spamtrap";
      baseResult.subStatus = "spamtrap_pattern";
      baseResult.score = 0;
      return baseResult;
    }
  }

  // Role-based check
  const isRoleBased = roleAddresses.has(localPart);

  // Abuse address check
  if (localPart === "abuse" || localPart === "postmaster") {
    baseResult.status = "abuse";
    baseResult.subStatus = "abuse_address";
    baseResult.score = 0;
    return baseResult;
  }

  // DNS MX lookup
  let mxRecords: dns.MxRecord[] = [];
  let dnsError: NodeJS.ErrnoException | null = null;
  try {
    mxRecords = await resolveMx(domain);
    // Filter out null MX records (RFC 7505): an MX with empty exchange (or ".")
    // signals the domain explicitly does NOT accept email
    const validMxRecords = mxRecords.filter(
      (r) => r.exchange && r.exchange !== "."
    );

    if (validMxRecords.length === 0 && mxRecords.length > 0) {
      // Domain has null MX only — explicitly rejects email
      baseResult.status = "invalid";
      baseResult.subStatus = "null_mx";
      baseResult.score = 0;
      return baseResult;
    }

    if (validMxRecords.length > 0) {
      baseResult.mxFound = true;
      // Sort by priority (lower = higher priority)
      validMxRecords.sort((a, b) => a.priority - b.priority);
      baseResult.mxRecord = validMxRecords[0].exchange;
    }
  } catch (err) {
    dnsError = err as NodeJS.ErrnoException;
    // Try A record as fallback
    try {
      const aRecords = await resolveA(domain);
      if (aRecords.length > 0) {
        baseResult.mxFound = true;
        baseResult.mxRecord = aRecords[0];
        dnsError = null;
      }
    } catch (err2) {
      dnsError = err2 as NodeJS.ErrnoException;
    }
  }

  if (!baseResult.mxFound) {
    // Distinguish between "domain doesn't exist" and "DNS network error"
    const code = dnsError?.code;
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "ESERVFAIL") {
      // Domain genuinely doesn't exist or has no records
      baseResult.status = "invalid";
      baseResult.subStatus = code === "ENOTFOUND" ? "domain_not_found" : "no_mx_records";
      baseResult.score = 0;
      return baseResult;
    }
    // DNS timeout, network error, or other transient issue
    // Don't mark as invalid -- we can't be sure
    baseResult.status = "unknown";
    baseResult.subStatus = `dns_error_${code || "unknown"}`;
    baseResult.score = 30;
    return baseResult;
  }

  // SOA record for domain age estimation
  try {
    const soa = await resolveSoa(domain);
    if (soa && soa.serial) {
      // SOA serial often follows YYYYMMDD format
      const serialStr = String(soa.serial);
      if (serialStr.length >= 8) {
        const year = parseInt(serialStr.substring(0, 4));
        const month = parseInt(serialStr.substring(4, 6));
        const day = parseInt(serialStr.substring(6, 8));
        if (year > 1990 && year < 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const domainDate = new Date(year, month - 1, day);
          const now = new Date();
          baseResult.domainAgeDays = Math.floor((now.getTime() - domainDate.getTime()) / (1000 * 60 * 60 * 24));
        }
      }
    }
  } catch {
    // Domain age is optional
  }

  // Detect SMTP provider from MX record
  baseResult.smtpProvider = detectSmtpProvider(baseResult.mxRecord, null);

  // SMTP mailbox verification
  if (baseResult.mxFound && baseResult.mxRecord) {
    try {
      const smtpResult = await checkSmtp(trimmed, baseResult.mxRecord);

      // Update SMTP provider from banner if not detected from MX
      if (!baseResult.smtpProvider && smtpResult.smtpBanner) {
        baseResult.smtpProvider = detectSmtpProvider(null, smtpResult.smtpBanner);
      }

      if (smtpResult.canConnect) {
        if (smtpResult.isCatchAll) {
          baseResult.status = "catch-all";
          baseResult.subStatus = isRoleBased ? "role_based_catch_all" : "catch_all";
        } else if (smtpResult.mailboxExists === true) {
          baseResult.status = "valid";
          baseResult.subStatus = isRoleBased ? "role_based" : "mailbox_found";
        } else if (smtpResult.mailboxExists === false) {
          baseResult.status = "invalid";
          baseResult.subStatus = "mailbox_not_found";
        } else {
          // Could not determine (greylisting, etc.) - MX exists so likely valid
          baseResult.status = "valid";
          baseResult.subStatus = isRoleBased ? "role_based" : "mail_server_temporary_error";
        }
      } else {
        // SMTP connection failed (port 25 blocked) but MX exists
        // MX record confirms the domain accepts mail - treat as valid
        baseResult.status = "valid";
        baseResult.subStatus = isRoleBased ? "role_based" : "mx_found";
      }
    } catch {
      // SMTP error but MX exists - domain accepts mail
      baseResult.status = "valid";
      baseResult.subStatus = isRoleBased ? "role_based" : "mx_found";
    }
  }

  // If domain typo was detected and status is invalid, mark it
  if (suggestion && baseResult.status === "invalid") {
    baseResult.subStatus = "possible_typo";
  }

  // Calculate deliverability score
  baseResult.score = calculateScore(baseResult);

  return baseResult;
}

// ========== Bulk Validation ==========

export async function validateEmails(
  emails: string[],
  concurrency: number = 5
): Promise<BulkValidationResult> {
  const results: EmailValidationResult[] = [];

  // Process in batches for concurrency control
  for (let i = 0; i < emails.length; i += concurrency) {
    const batch = emails.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((email) => validateEmail(email)));
    results.push(...batchResults);
  }

  const summary = {
    total: results.length,
    valid: results.filter((r) => r.status === "valid").length,
    invalid: results.filter((r) => r.status === "invalid").length,
    catchAll: results.filter((r) => r.status === "catch-all").length,
    unknown: results.filter((r) => r.status === "unknown").length,
    doNotMail: results.filter((r) => r.status === "do_not_mail" || r.status === "spamtrap" || r.status === "abuse").length,
    risky: results.filter((r) => r.status === "catch-all" || r.status === "unknown").length,
  };

  return { results, summary };
}

// ========== Quick Validation (no SMTP, faster) ==========

export async function validateEmailQuick(email: string): Promise<EmailValidationResult> {
  const trimmed = email.trim().toLowerCase();
  const baseResult: EmailValidationResult = {
    email: trimmed,
    status: "unknown",
    subStatus: "",
    freeEmail: false,
    didYouMean: null,
    account: "",
    domain: "",
    domainAgeDays: null,
    smtpProvider: null,
    mxFound: false,
    mxRecord: null,
    firstName: null,
    lastName: null,
    score: 0,
  };

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(trimmed)) {
    baseResult.status = "invalid";
    baseResult.subStatus = "invalid_format";
    return baseResult;
  }

  const [localPart, domain] = trimmed.split("@");
  baseResult.account = localPart;
  baseResult.domain = domain;

  if (!localPart || !domain) {
    baseResult.status = "invalid";
    baseResult.subStatus = "invalid_format";
    return baseResult;
  }

  const { firstName, lastName } = extractNameFromEmail(localPart);
  baseResult.firstName = firstName;
  baseResult.lastName = lastName;
  baseResult.freeEmail = freeEmailProviders.has(domain);

  const suggestion = domainSuggestions[domain];
  if (suggestion) baseResult.didYouMean = `${localPart}@${suggestion}`;

  if (disposableDomains.has(domain)) {
    baseResult.status = "do_not_mail";
    baseResult.subStatus = "disposable";
    return baseResult;
  }

  for (const pattern of spamtrapPatterns) {
    if (pattern.test(trimmed)) {
      baseResult.status = "spamtrap";
      baseResult.subStatus = "spamtrap_pattern";
      return baseResult;
    }
  }

  if (localPart === "abuse" || localPart === "postmaster") {
    baseResult.status = "abuse";
    baseResult.subStatus = "abuse_address";
    return baseResult;
  }

  const isRoleBased = roleAddresses.has(localPart);

  // DNS MX lookup only (no SMTP)
  let quickDnsError: NodeJS.ErrnoException | null = null;
  try {
    const mxRecords = await resolveMx(domain);
    // Filter out null MX records (RFC 7505): an MX with empty exchange (or ".")
    // signals the domain explicitly does NOT accept email
    const validMxRecords = mxRecords.filter(
      (r) => r.exchange && r.exchange !== "."
    );

    if (validMxRecords.length === 0 && mxRecords.length > 0) {
      // Domain has null MX only — explicitly rejects email
      baseResult.status = "invalid";
      baseResult.subStatus = "null_mx";
      baseResult.score = 0;
      return baseResult;
    }

    if (validMxRecords.length > 0) {
      baseResult.mxFound = true;
      validMxRecords.sort((a, b) => a.priority - b.priority);
      baseResult.mxRecord = validMxRecords[0].exchange;
      baseResult.smtpProvider = detectSmtpProvider(baseResult.mxRecord, null);
      baseResult.status = "valid";
      baseResult.subStatus = isRoleBased ? "role_based" : "mx_found";
    }
  } catch (err) {
    quickDnsError = err as NodeJS.ErrnoException;
    try {
      const aRecords = await resolveA(domain);
      if (aRecords.length > 0) {
        baseResult.mxFound = true;
        baseResult.mxRecord = aRecords[0];
        baseResult.status = "valid";
        baseResult.subStatus = isRoleBased ? "role_based" : "a_record_only";
        quickDnsError = null;
      }
    } catch (err2) {
      quickDnsError = err2 as NodeJS.ErrnoException;
    }
  }

  if (!baseResult.mxFound && quickDnsError) {
    const code = quickDnsError.code;
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "ESERVFAIL") {
      baseResult.status = "invalid";
      baseResult.subStatus = code === "ENOTFOUND" ? "domain_not_found" : "no_mx_records";
    } else {
      // Network error, timeout, etc. - can't determine
      baseResult.status = "unknown";
      baseResult.subStatus = `dns_error_${code || "unknown"}`;
      baseResult.score = 30;
    }
  } else if (!baseResult.mxFound) {
    baseResult.status = "invalid";
    baseResult.subStatus = "no_mx_records";
  }

  baseResult.score = calculateScore(baseResult);
  return baseResult;
}
