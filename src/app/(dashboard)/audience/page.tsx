"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Upload,
  Download,
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Ban,
  Mail,
  Globe,
  Server,
  Clock,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getInitials, generateAvatarColor } from "@/lib/utils";

interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  lists: string[];
  tags: string[];
  status: string;
  addedAt: string;
  lastActivity: string;
}

interface ContactList {
  id: string;
  name: string;
  contactCount: number;
  createdAt: string;
}

// ZeroBounce-like validation result
interface EmailValidationResult {
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
  score: number;
}

interface BulkValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  catchAll: number;
  unknown: number;
  doNotMail: number;
  risky: number;
}

const contactStatusConfig: Record<string, { label: string; color: string; dot: string }> = {
  subscribed: { label: "Subscribed", color: "text-emerald-700", dot: "bg-emerald-500" },
  unsubscribed: { label: "Unsubscribed", color: "text-red-700", dot: "bg-red-500" },
  bounced: { label: "Bounced", color: "text-amber-700", dot: "bg-amber-500" },
  blacklisted: { label: "Blacklisted", color: "text-gray-700", dot: "bg-gray-900" },
};

const validationStatusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  valid: { label: "Valid", color: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle },
  invalid: { label: "Invalid", color: "text-red-700", bg: "bg-red-50", icon: XCircle },
  "catch-all": { label: "Catch-All", color: "text-amber-700", bg: "bg-amber-50", icon: AlertTriangle },
  unknown: { label: "Unknown", color: "text-gray-600", bg: "bg-gray-100", icon: HelpCircle },
  spamtrap: { label: "Spamtrap", color: "text-red-800", bg: "bg-red-100", icon: Ban },
  abuse: { label: "Abuse", color: "text-red-700", bg: "bg-red-50", icon: Ban },
  do_not_mail: { label: "Do Not Mail", color: "text-red-700", bg: "bg-red-50", icon: Ban },
};

export default function AudiencePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [addForm, setAddForm] = useState({ email: "", firstName: "", lastName: "", phone: "", company: "" });
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Per-row validation state
  const [validationResults, setValidationResults] = useState<Record<string, EmailValidationResult>>({});
  const [validatingEmails, setValidatingEmails] = useState<Set<string>>(new Set());

  // Bulk validation dialog state
  const [showBulkValidation, setShowBulkValidation] = useState(false);
  const [bulkValidating, setBulkValidating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState<EmailValidationResult[] | null>(null);
  const [bulkSummary, setBulkSummary] = useState<BulkValidationSummary | null>(null);

  // Single email validation dialog
  const [showSingleValidation, setShowSingleValidation] = useState(false);
  const [singleValidationEmail, setSingleValidationEmail] = useState("");
  const [singleValidating, setSingleValidating] = useState(false);
  const [singleResult, setSingleResult] = useState<EmailValidationResult | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/contacts${params}`);
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchLists = useCallback(async () => {
    try {
      const res = await fetch("/api/lists");
      const data = await res.json();
      setLists(data.lists || []);
    } catch (err) {
      console.error("Failed to fetch lists:", err);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchLists();
  }, [fetchContacts, fetchLists]);

  useEffect(() => {
    const timer = setTimeout(() => fetchContacts(), 300);
    return () => clearTimeout(timer);
  }, [search, fetchContacts]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        setShowAddContact(false);
        setAddForm({ email: "", firstName: "", lastName: "", phone: "", company: "" });
        fetchContacts();
      }
    } catch (err) {
      console.error("Failed to add contact:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      setSelectedContact(null);
      fetchContacts();
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedContacts) {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    }
    setSelectedContacts([]);
    fetchContacts();
  };

  // ===== Single Email Validation (per-row) =====
  const validateSingleEmail = async (email: string) => {
    setValidatingEmails((prev) => new Set(prev).add(email));
    try {
      const res = await fetch("/api/contacts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const result: EmailValidationResult = await res.json();
        setValidationResults((prev) => ({ ...prev, [email]: result }));
      }
    } catch (err) {
      console.error("Validation failed:", err);
    } finally {
      setValidatingEmails((prev) => {
        const next = new Set(prev);
        next.delete(email);
        return next;
      });
    }
  };

  // ===== Single Email Validation Dialog =====
  const handleSingleValidation = async () => {
    if (!singleValidationEmail.trim()) return;
    setSingleValidating(true);
    setSingleResult(null);
    try {
      const res = await fetch("/api/contacts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: singleValidationEmail.trim() }),
      });
      if (res.ok) {
        const result: EmailValidationResult = await res.json();
        setSingleResult(result);
        setValidationResults((prev) => ({ ...prev, [result.email]: result }));
      }
    } catch (err) {
      console.error("Validation failed:", err);
    } finally {
      setSingleValidating(false);
    }
  };

  // ===== Bulk Validation =====
  const handleBulkValidation = async () => {
    const emails = contacts
      .filter((c) => selectedContacts.includes(c.id))
      .map((c) => c.email);
    if (!emails.length) return;

    setShowBulkValidation(true);
    setBulkValidating(true);
    setBulkProgress(0);
    setBulkResults(null);
    setBulkSummary(null);

    try {
      const progressInterval = setInterval(() => {
        setBulkProgress((p) => Math.min(p + 8, 90));
      }, 300);

      const res = await fetch("/api/contacts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      clearInterval(progressInterval);
      setBulkProgress(100);

      if (res.ok) {
        const data = await res.json();
        setBulkResults(data.results);
        setBulkSummary(data.summary);

        // Update per-row results
        const newResults: Record<string, EmailValidationResult> = {};
        for (const r of data.results) {
          newResults[r.email] = r;
        }
        setValidationResults((prev) => ({ ...prev, ...newResults }));
      }
    } catch (err) {
      console.error("Bulk validation failed:", err);
    } finally {
      setBulkValidating(false);
    }
  };

  const filteredContacts = useMemo(() => contacts.filter(
    (c) => c.email.toLowerCase().includes(search.toLowerCase()) || c.firstName.toLowerCase().includes(search.toLowerCase()) || c.lastName.toLowerCase().includes(search.toLowerCase())
  ), [contacts, search]);

  const totalContacts = filteredContacts.length;
  const totalPages = Math.max(1, Math.ceil(totalContacts / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalContacts);
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  const handleSearchChange = (v: string) => { setSearch(v); setCurrentPage(1); };

  const allOnPageSelected = paginatedContacts.length > 0 && paginatedContacts.every((c) => selectedContacts.includes(c.id));
  const toggleAllOnPage = () => {
    const ids = paginatedContacts.map((c) => c.id);
    if (allOnPageSelected) setSelectedContacts((p) => p.filter((id) => !ids.includes(id)));
    else setSelectedContacts((p) => [...new Set([...p, ...ids])]);
  };
  const toggleContact = (id: string) => setSelectedContacts((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);

  // Render validation status badge for a contact row
  const renderValidationBadge = (contact: Contact) => {
    const result = validationResults[contact.email];
    const isValidating = validatingEmails.has(contact.email);

    if (isValidating) {
      return (
        <div className="flex items-center gap-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
          <span className="text-[10px] text-gray-400">Checking...</span>
        </div>
      );
    }

    if (result) {
      const config = validationStatusConfig[result.status] || validationStatusConfig.unknown;
      const Icon = config.icon;
      return (
        <button
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.color} hover:opacity-80 transition-opacity`}
          onClick={(e) => {
            e.stopPropagation();
            setSingleResult(result);
            setSingleValidationEmail(result.email);
            setShowSingleValidation(true);
          }}
          title={`${result.status} - ${result.subStatus} (Score: ${result.score})`}
        >
          <Icon className="h-3 w-3" />
          {config.label}
          <span className="text-[9px] opacity-70">{result.score}</span>
        </button>
      );
    }

    return (
      <button
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-200"
        onClick={(e) => {
          e.stopPropagation();
          validateSingleEmail(contact.email);
        }}
        title="Click to validate this email"
      >
        <ShieldCheck className="h-3 w-3" />
        Validate
      </button>
    );
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audience</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {contacts.length.toLocaleString()} contacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSingleValidationEmail("");
              setSingleResult(null);
              setShowSingleValidation(true);
            }}
          >
            <ShieldCheck className="h-4 w-4 mr-1" />
            Validate Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAddContact(true)}><Plus className="h-4 w-4 mr-1" />Add Contact</Button>
          <Link href="/audience/import"><Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" />Import</Button></Link>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
        </div>
      </div>

      <Tabs defaultValue="contacts">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="contacts">All Contacts</TabsTrigger>
          <TabsTrigger value="lists">Lists ({lists.length})</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          {/* Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by email, name..." className="pl-9" value={search} onChange={(e) => handleSearchChange(e.target.value)} />
            </div>
            <Button variant="ghost" size="sm" onClick={() => fetchContacts()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {selectedContacts.length > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
              <span className="text-sm font-medium text-indigo-700">
                {selectedContacts.length} contact{selectedContacts.length > 1 ? "s" : ""} selected
              </span>
              <Button size="sm" onClick={handleBulkValidation}>
                <ShieldCheck className="h-3 w-3 mr-1" />
                Bulk Validate
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
              <button
                className="ml-auto text-sm text-indigo-600 hover:underline"
                onClick={() => setSelectedContacts([])}
              >
                Clear
              </button>
            </div>
          )}

          {/* Contacts Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-500"
                        checked={allOnPageSelected}
                        onChange={toggleAllOnPage}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider hidden md:table-cell">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Validation
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider hidden lg:table-cell">Tags</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 tracking-wider">Status</th>
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50 animate-pulse">
                        <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                        <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                        <td className="px-4 py-3" />
                      </tr>
                    ))
                  ) : paginatedContacts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                        {search ? "No contacts match your search" : "No contacts yet. Import some to get started!"}
                      </td>
                    </tr>
                  ) : (
                    paginatedContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-500"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => toggleContact(contact.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{contact.email}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">
                            {contact.firstName} {contact.lastName}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-500">{contact.company || "--"}</span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {renderValidationBadge(contact)}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex gap-1">
                            {contact.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                            {contact.tags.length > 2 && (
                              <span className="text-xs text-gray-400">+{contact.tags.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${contactStatusConfig[contact.status]?.dot || "bg-gray-400"}`} />
                            <span className={`text-xs font-medium ${contactStatusConfig[contact.status]?.color || "text-gray-500"}`}>
                              {contactStatusConfig[contact.status]?.label || contact.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <button className="p-1 rounded hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {totalContacts > 0 ? startIndex + 1 : 0}-{endIndex} of {totalContacts} contact{totalContacts !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="lists">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{lists.length} lists</p>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Create List</Button>
          </div>
          <Card>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">List Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Contacts</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody>
                {lists.map((list) => (
                  <tr key={list.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{list.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{list.contactCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(list.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="tags">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(() => {
              const allTags = new Map<string, number>();
              contacts.forEach((c) => c.tags.forEach((t) => allTags.set(t, (allTags.get(t) || 0) + 1)));
              const tagEntries = Array.from(allTags.entries());
              if (tagEntries.length === 0) {
                return (
                  <div className="col-span-full">
                    <Card><CardContent className="py-12 text-center"><p className="text-sm text-gray-500">No tags yet. Tags will appear here when contacts have them.</p></CardContent></Card>
                  </div>
                );
              }
              return tagEntries.map(([tag, count]) => (
                <Card key={tag} className="card-hover">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-indigo-500" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{tag}</h3>
                        <p className="text-xs text-gray-500">{count} contact{count !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ));
            })()}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== Single Email Validation Dialog ===== */}
      <Dialog open={showSingleValidation} onOpenChange={setShowSingleValidation}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-500" />
              Email Validation
            </DialogTitle>
            <DialogDescription>
              Enter an email address to validate - checks MX records, SMTP mailbox, domain reputation, and more
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                value={singleValidationEmail}
                onChange={(e) => setSingleValidationEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSingleValidation()}
                className="flex-1"
              />
              <Button onClick={handleSingleValidation} disabled={singleValidating || !singleValidationEmail.trim()}>
                {singleValidating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
                {singleValidating ? "Validating..." : "Validate"}
              </Button>
            </div>

            {singleResult && (
              <div className="space-y-4">
                {/* Status Header */}
                <div className={`rounded-xl p-4 ${validationStatusConfig[singleResult.status]?.bg || "bg-gray-50"} border`}>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const cfg = validationStatusConfig[singleResult.status];
                      const Icon = cfg?.icon || HelpCircle;
                      return <Icon className={`h-8 w-8 ${cfg?.color || "text-gray-500"}`} />;
                    })()}
                    <div>
                      <p className="text-lg font-bold text-gray-900">{singleResult.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`${validationStatusConfig[singleResult.status]?.bg} ${validationStatusConfig[singleResult.status]?.color} border-0`}>
                          {validationStatusConfig[singleResult.status]?.label || singleResult.status}
                        </Badge>
                        <span className="text-sm text-gray-500">Score: {singleResult.score}/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Results Grid (ZeroBounce-style) */}
                <div className="grid grid-cols-3 gap-3">
                  <DetailField icon={Shield} label="STATUS" value={singleResult.status} highlight={singleResult.status === "valid" ? "green" : singleResult.status === "invalid" ? "red" : "yellow"} />
                  <DetailField icon={Shield} label="SUB-STATUS" value={singleResult.subStatus || "none"} />
                  <DetailField icon={Mail} label="FREE EMAIL" value={singleResult.freeEmail ? "Yes" : "No"} />
                  <DetailField icon={HelpCircle} label="DID YOU MEAN" value={singleResult.didYouMean || "Unknown"} />
                  <DetailField icon={User} label="ACCOUNT" value={singleResult.account} />
                  <DetailField icon={Globe} label="DOMAIN" value={singleResult.domain} />
                  <DetailField icon={Clock} label="DOMAIN AGE DAYS" value={singleResult.domainAgeDays !== null ? String(singleResult.domainAgeDays) : "Unknown"} />
                  <DetailField icon={Server} label="SMTP PROVIDER" value={singleResult.smtpProvider || "Unknown"} />
                  <DetailField icon={CheckCircle} label="MX FOUND" value={singleResult.mxFound ? "true" : "false"} highlight={singleResult.mxFound ? "green" : "red"} />
                  <DetailField icon={Server} label="MX RECORD" value={singleResult.mxRecord || "none"} wide />
                  <DetailField icon={User} label="FIRST NAME" value={singleResult.firstName || "Unknown"} />
                  <DetailField icon={User} label="LAST NAME" value={singleResult.lastName || "Unknown"} />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Bulk Validation Dialog ===== */}
      <Dialog open={showBulkValidation} onOpenChange={setShowBulkValidation}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-500" />
              Bulk Email Validation
            </DialogTitle>
            <DialogDescription>
              Validating {selectedContacts.length} email{selectedContacts.length !== 1 ? "s" : ""} with DNS + SMTP verification
            </DialogDescription>
          </DialogHeader>

          {bulkValidating && !bulkResults && (
            <div className="py-10 space-y-4 text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-500" />
              <div>
                <p className="text-base font-semibold text-gray-900">Validating emails...</p>
                <p className="text-sm text-gray-500 mt-1">Checking MX records, SMTP mailboxes, and domain reputation</p>
              </div>
              <Progress value={bulkProgress} className="max-w-sm mx-auto h-2" />
              <p className="text-xs text-gray-400">{bulkProgress}% complete</p>
            </div>
          )}

          {bulkSummary && bulkResults && (
            <div className="space-y-4 overflow-hidden flex flex-col flex-1">
              {/* Summary Cards */}
              <div className="grid grid-cols-6 gap-2">
                <SummaryCard label="Total" value={bulkSummary.total} color="gray" />
                <SummaryCard label="Valid" value={bulkSummary.valid} color="emerald" />
                <SummaryCard label="Invalid" value={bulkSummary.invalid} color="red" />
                <SummaryCard label="Catch-All" value={bulkSummary.catchAll} color="amber" />
                <SummaryCard label="Unknown" value={bulkSummary.unknown} color="gray" />
                <SummaryCard label="Do Not Mail" value={bulkSummary.doNotMail} color="red" />
              </div>

              {/* Results Table */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Sub-Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">SMTP</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">MX</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((r, i) => {
                      const cfg = validationStatusConfig[r.status] || validationStatusConfig.unknown;
                      const Icon = cfg.icon;
                      return (
                        <tr
                          key={i}
                          className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                          onClick={() => {
                            setSingleResult(r);
                            setSingleValidationEmail(r.email);
                            setShowSingleValidation(true);
                          }}
                        >
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
                              <Icon className="h-3 w-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-900">
                            {r.email}
                            {r.didYouMean && (
                              <p className="text-xs text-indigo-500 font-sans">Did you mean: {r.didYouMean}</p>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600">{r.subStatus}</td>
                          <td className="px-3 py-2 text-xs text-gray-500">{r.smtpProvider || "-"}</td>
                          <td className="px-3 py-2">
                            {r.mxFound
                              ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              : <XCircle className="h-3.5 w-3.5 text-red-400" />
                            }
                          </td>
                          <td className="px-3 py-2">
                            <span className={`text-xs font-bold ${r.score >= 70 ? "text-emerald-600" : r.score >= 40 ? "text-amber-600" : "text-red-600"}`}>
                              {r.score}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowBulkValidation(false)}>
              {bulkValidating ? "Cancel" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Add Contact Dialog ===== */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddContact} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email *</Label>
              <Input id="contact-email" type="email" placeholder="email@example.com" required value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="contact-first">First Name</Label>
                <Input id="contact-first" placeholder="First name" value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-last">Last Name</Label>
                <Input id="contact-last" placeholder="Last name" value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input id="contact-phone" type="tel" placeholder="+1 555-0123" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-company">Company</Label>
              <Input id="contact-company" placeholder="Company name" value={addForm.company} onChange={(e) => setAddForm({ ...addForm, company: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAddContact(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Contact"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== Contact Detail Side Panel ===== */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedContact(null)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">Contact Details</h3>
              <button onClick={() => setSelectedContact(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div
                  className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: generateAvatarColor(`${selectedContact.firstName} ${selectedContact.lastName}`) }}
                >
                  {getInitials(`${selectedContact.firstName} ${selectedContact.lastName}`)}
                </div>
                <h2 className="mt-3 text-lg font-semibold text-gray-900">
                  {selectedContact.firstName} {selectedContact.lastName}
                </h2>
                <p className="text-sm text-gray-500">{selectedContact.email}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <div className={`h-2 w-2 rounded-full ${contactStatusConfig[selectedContact.status]?.dot}`} />
                  <span className={`text-sm ${contactStatusConfig[selectedContact.status]?.color}`}>{contactStatusConfig[selectedContact.status]?.label}</span>
                </div>
              </div>

              {/* Email Validation in Side Panel */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wider">Email Validation</h4>
                {validationResults[selectedContact.email] ? (
                  <div className={`rounded-lg p-3 ${validationStatusConfig[validationResults[selectedContact.email].status]?.bg || "bg-gray-50"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const r = validationResults[selectedContact.email];
                        const cfg = validationStatusConfig[r.status];
                        const Icon = cfg?.icon || HelpCircle;
                        return (
                          <>
                            <Icon className={`h-4 w-4 ${cfg?.color}`} />
                            <span className={`text-sm font-semibold ${cfg?.color}`}>{cfg?.label}</span>
                            <span className="text-xs text-gray-400 ml-auto">Score: {r.score}/100</span>
                          </>
                        );
                      })()}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-400">Sub-status:</span> <span className="text-gray-700">{validationResults[selectedContact.email].subStatus}</span></div>
                      <div><span className="text-gray-400">SMTP:</span> <span className="text-gray-700">{validationResults[selectedContact.email].smtpProvider || "-"}</span></div>
                      <div><span className="text-gray-400">MX:</span> <span className="text-gray-700">{validationResults[selectedContact.email].mxFound ? "Found" : "Not found"}</span></div>
                      <div><span className="text-gray-400">Free:</span> <span className="text-gray-700">{validationResults[selectedContact.email].freeEmail ? "Yes" : "No"}</span></div>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => validateSingleEmail(selectedContact.email)} disabled={validatingEmails.has(selectedContact.email)}>
                    {validatingEmails.has(selectedContact.email) ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Validating...</>
                    ) : (
                      <><ShieldCheck className="h-3.5 w-3.5 mr-1" />Validate Email</>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteContact(selectedContact.id)}>Delete</Button>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wider">Details</h4>
                <dl className="space-y-2.5">
                  {[
                    { label: "Phone", value: selectedContact.phone || "--" },
                    { label: "Company", value: selectedContact.company || "--" },
                    { label: "Added", value: new Date(selectedContact.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <dt className="text-sm text-gray-500">{label}</dt>
                      <dd className="text-sm text-gray-900 font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wider">Lists</h4>
                {selectedContact.lists.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedContact.lists.map((list) => (
                      <div key={list} className="text-sm text-gray-700 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-400">&#128203;</span> {list}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No lists</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wider">Tags</h4>
                {selectedContact.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContact.tags.map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No tags</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wider">Activity</h4>
                <div className="space-y-3 border-l-2 border-gray-200 pl-4 ml-1">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <p className="text-sm text-gray-700">{selectedContact.lastActivity}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Helper Components =====

function DetailField({ icon: Icon, label, value, highlight, wide }: {
  icon: typeof CheckCircle;
  label: string;
  value: string;
  highlight?: "green" | "red" | "yellow";
  wide?: boolean;
}) {
  const highlightColors = {
    green: "bg-emerald-50 border-emerald-200",
    red: "bg-red-50 border-red-200",
    yellow: "bg-amber-50 border-amber-200",
  };

  return (
    <div className={`rounded-lg border p-3 ${wide ? "col-span-2" : ""} ${highlight ? highlightColors[highlight] : "border-gray-200 bg-white"}`}>
      <div className="flex items-center gap-1 mb-1">
        <Icon className="h-3 w-3 text-gray-400" />
        <span className="text-[10px] font-semibold uppercase text-gray-400 tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-900 truncate" title={value}>{value}</p>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-50 text-gray-900",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className={`rounded-lg p-3 text-center ${colorMap[color] || colorMap.gray}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}
