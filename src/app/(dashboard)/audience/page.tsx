"use client";

import { useState, useMemo } from "react";
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
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getInitials, generateAvatarColor } from "@/lib/utils";
import type { EmailValidationResult } from "@/lib/email-validation";

// Generate more mock contacts for pagination demo
function generateMockContacts() {
  const firstNames = ["Sarah", "John", "Jane", "Mike", "Emma", "Alex", "Olivia", "Liam", "Sophia", "Noah", "Ava", "Ethan", "Mia", "Lucas", "Isabella", "Mason", "Charlotte", "Logan", "Amelia", "James", "Harper", "Ben", "Evelyn", "Elijah", "Aria", "William", "Chloe", "Daniel", "Ella", "Henry", "Luna", "Sebastian", "Grace", "Jack", "Lily", "Aiden", "Zoey", "Owen", "Penelope", "Samuel", "Layla", "Ryan", "Riley", "Nathan", "Nora", "Leo", "Hannah", "Dylan", "Zoe", "Isaac"];
  const lastNames = ["Lee", "Smith", "Doe", "Brown", "Wilson", "Johnson", "Davis", "Miller", "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "White", "Harris", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Lopez", "Green", "Adams", "Baker", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips"];
  const domains = ["example.com", "company.co", "mail.com", "test.org", "acme.com", "gmial.com", "hotmal.com", "tempmail.com", "corp.io", "startup.dev"];
  const lists = ["Newsletter", "VIP", "Product Updates", "Marketing", "Enterprise"];
  const tags = ["VIP", "Engaged", "New", "Enterprise", "At-risk", "Premium"];
  const statuses = ["subscribed", "subscribed", "subscribed", "subscribed", "unsubscribed", "bounced"];
  const activities = [
    "Opened 'Summer Sale' - 2h ago",
    "Clicked link - 1d ago",
    "Unsubscribed - 3d ago",
    "Subscribed - 5d ago",
    "Opened 'Newsletter #45' - 1d ago",
    "Bounced - 2w ago",
    "Opened 'Welcome' - 3h ago",
    "Clicked CTA - 12h ago",
  ];

  const contacts = [];
  for (let i = 0; i < 87; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const domain = domains[i % domains.length];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 0 ? i : ""}@${domain}`;
    const contactLists = lists.filter((_, j) => (i + j) % 3 === 0).slice(0, 2);
    const contactTags = tags.filter((_, j) => (i + j) % 4 === 0).slice(0, 3);
    const status = statuses[i % statuses.length];
    const day = String((i % 28) + 1).padStart(2, "0");
    const month = String((i % 12) + 1).padStart(2, "0");

    contacts.push({
      id: String(i + 1),
      email,
      firstName: fn,
      lastName: ln,
      lists: contactLists,
      tags: contactTags,
      status,
      addedAt: `2025-${month}-${day}T10:00:00Z`,
      lastActivity: activities[i % activities.length],
    });
  }
  return contacts;
}

const allContacts = generateMockContacts();

const mockLists = [
  { id: 1, name: "Newsletter Subscribers", count: 8234, createdAt: "2025-01-01" },
  { id: 2, name: "VIP Customers", count: 456, createdAt: "2025-01-15" },
  { id: 3, name: "Product Updates", count: 3102, createdAt: "2025-02-01" },
];

const mockSegments = [
  { id: "1", name: "Engaged Users", conditions: "Opened any campaign in last 30 days", count: 5432, logic: "AND" },
  { id: "2", name: "VIP Subscribers", conditions: "Tag is VIP AND Subscribed", count: 456, logic: "AND" },
];

const mockTags = [
  { name: "VIP", count: 456, color: "#6366F1" },
  { name: "Engaged", count: 3200, color: "#10B981" },
  { name: "Enterprise", count: 120, color: "#F59E0B" },
  { name: "New", count: 890, color: "#3B82F6" },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  subscribed: { label: "Subscribed", color: "text-emerald-700", dot: "bg-emerald-500" },
  unsubscribed: { label: "Unsubscribed", color: "text-red-700", dot: "bg-red-500" },
  bounced: { label: "Bounced", color: "text-amber-700", dot: "bg-amber-500" },
  blacklisted: { label: "Blacklisted", color: "text-gray-700", dot: "bg-gray-900" },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function AudiencePage() {
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<typeof allContacts[0] | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Validation state
  const [showValidation, setShowValidation] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<{
    results: EmailValidationResult[];
    summary: { total: number; valid: number; invalid: number; risky: number };
  } | null>(null);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return allContacts.filter(
      (c) =>
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.firstName.toLowerCase().includes(search.toLowerCase()) ||
        c.lastName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // Pagination calculations
  const totalContacts = filteredContacts.length;
  const totalPages = Math.ceil(totalContacts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalContacts);
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleAllOnPage = () => {
    const pageIds = paginatedContacts.map((c) => c.id);
    const allSelected = pageIds.every((id) => selectedContacts.includes(id));
    if (allSelected) {
      setSelectedContacts((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedContacts((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const selectAllContacts = () => {
    setSelectedContacts(filteredContacts.map((c) => c.id));
  };

  // Bulk email validation
  const handleValidateEmails = async () => {
    const emailsToValidate = allContacts
      .filter((c) => selectedContacts.includes(c.id))
      .map((c) => c.email);

    if (emailsToValidate.length === 0) return;

    setShowValidation(true);
    setValidating(true);
    setValidationProgress(0);
    setValidationResults(null);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setValidationProgress((prev) => Math.min(prev + 15, 90));
      }, 200);

      const res = await fetch("/api/contacts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: emailsToValidate }),
      });

      clearInterval(progressInterval);
      setValidationProgress(100);

      if (res.ok) {
        const data = await res.json();
        setValidationResults(data);
      } else {
        console.error("Validation request failed");
      }
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setValidating(false);
    }
  };

  const allOnPageSelected =
    paginatedContacts.length > 0 &&
    paginatedContacts.every((c) => selectedContacts.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Audience</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddContact(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Contact
          </Button>
          <Link href="/audience/import">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="contacts">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="contacts">All Contacts</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        {/* All Contacts Tab */}
        <TabsContent value="contacts">
          {/* Search and Filter */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email, name, or tag..."
                className="pl-9"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Filter
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedContacts.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className="text-sm font-medium text-indigo-700">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? "s" : ""} selected
              </span>
              {selectedContacts.length < filteredContacts.length && (
                <button
                  className="text-sm text-indigo-600 hover:underline font-medium"
                  onClick={selectAllContacts}
                >
                  Select all {filteredContacts.length} contacts
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm">Add to List</Button>
                <Button variant="outline" size="sm">Add Tag</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleValidateEmails}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Validate Emails
                </Button>
                <Button variant="destructive" size="sm">Delete</Button>
                <button
                  className="text-sm text-indigo-600 hover:underline"
                  onClick={() => setSelectedContacts([])}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Contacts Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-500"
                        checked={allOnPageSelected}
                        onChange={toggleAllOnPage}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 hidden md:table-cell">Lists</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 hidden lg:table-cell">Tags</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 hidden xl:table-cell">Added</th>
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
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
                        <span className="text-sm text-gray-500">
                          {contact.lists.length > 0 ? contact.lists.slice(0, 2).join(", ") : "-"}
                          {contact.lists.length > 2 && ` +${contact.lists.length - 2}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-1">
                          {contact.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                          {contact.tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{contact.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${statusConfig[contact.status]?.dot}`} />
                          <span className={`text-xs font-medium ${statusConfig[contact.status]?.color}`}>
                            {statusConfig[contact.status]?.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-sm text-gray-500">
                          {new Date(contact.addedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedContacts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                        No contacts found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">
                  Showing {totalContacts === 0 ? 0 : startIndex + 1}-{endIndex} of {totalContacts} contacts
                </p>
                <div className="flex items-center gap-1.5">
                  <select
                    className="h-8 rounded-md border border-gray-300 px-2 text-xs text-gray-700"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {getPageNumbers().map((page, i) =>
                  page === "ellipsis" ? (
                    <span key={`e-${i}`} className="px-2 text-sm text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-indigo-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Lists Tab */}
        <TabsContent value="lists">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{mockLists.length} lists</p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create List
            </Button>
          </div>
          <Card>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">List Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Contacts</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Created</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {mockLists.map((list) => (
                  <tr key={list.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{list.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{list.count.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">{list.createdAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 rounded hover:bg-gray-100">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{mockSegments.length} segments</p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Segment
            </Button>
          </div>
          <div className="space-y-3">
            {mockSegments.map((segment) => (
              <Card key={segment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{segment.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{segment.conditions}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">
                      {segment.count.toLocaleString()} contacts
                    </span>
                    <button className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{mockTags.length} tags</p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Tag
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mockTags.map((tag) => (
              <Card key={tag.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{tag.name}</h3>
                      <p className="text-xs text-gray-500">{tag.count} contacts</p>
                    </div>
                  </div>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddContact(false); }}>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email *</Label>
              <Input id="contact-email" type="email" placeholder="email@example.com" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="contact-first">First Name</Label>
                <Input id="contact-first" placeholder="First name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-last">Last Name</Label>
                <Input id="contact-last" placeholder="Last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input id="contact-phone" type="tel" placeholder="+1 555-0123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-company">Company</Label>
              <Input id="contact-company" placeholder="Company name" />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAddContact(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Contact</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Validation Results Dialog */}
      <Dialog open={showValidation} onOpenChange={setShowValidation}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-500" />
              Email Validation Results
            </DialogTitle>
            <DialogDescription>
              Validating {selectedContacts.length} selected email{selectedContacts.length !== 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>

          {validating && !validationResults && (
            <div className="py-8 space-y-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
              <p className="text-sm text-gray-600">Validating emails...</p>
              <Progress value={validationProgress} className="max-w-xs mx-auto" />
            </div>
          )}

          {validationResults && (
            <div className="space-y-4 overflow-hidden flex flex-col flex-1">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{validationResults.summary.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{validationResults.summary.valid}</p>
                  <p className="text-xs text-emerald-600">Valid</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{validationResults.summary.risky}</p>
                  <p className="text-xs text-amber-600">Risky</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{validationResults.summary.invalid}</p>
                  <p className="text-xs text-red-600">Invalid</p>
                </div>
              </div>

              {/* Results Table */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="sticky top-0">
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Reason</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResults.results.map((result, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-3 py-2">
                          {result.valid && result.riskLevel === "low" && (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          )}
                          {result.valid && result.riskLevel !== "low" && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          {!result.valid && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm font-mono text-gray-900">{result.email}</span>
                          {result.suggestion && (
                            <p className="text-xs text-indigo-500 mt-0.5">
                              Suggestion: {result.suggestion}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs text-gray-600">{result.reason}</span>
                        </td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={
                              result.riskLevel === "low" ? "success" :
                              result.riskLevel === "medium" ? "warning" :
                              result.riskLevel === "high" ? "destructive" : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {result.riskLevel}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            {validationResults && (
              <Button variant="outline" size="sm" onClick={() => {
                // Remove invalid contacts from selection
                const invalidEmails = new Set(
                  validationResults.results.filter((r) => !r.valid).map((r) => r.email)
                );
                const validIds = allContacts
                  .filter((c) => selectedContacts.includes(c.id) && !invalidEmails.has(c.email.toLowerCase()))
                  .map((c) => c.id);
                setSelectedContacts(validIds);
                setShowValidation(false);
              }}>
                Remove Invalid from Selection
              </Button>
            )}
            <Button onClick={() => setShowValidation(false)}>
              {validating ? "Cancel" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Detail Side Panel */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedContact(null)} />
          <div className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Contact Details</h3>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Avatar & Basic Info */}
              <div className="text-center">
                <div
                  className="mx-auto h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{
                    backgroundColor: generateAvatarColor(
                      `${selectedContact.firstName} ${selectedContact.lastName}`
                    ),
                  }}
                >
                  {getInitials(`${selectedContact.firstName} ${selectedContact.lastName}`)}
                </div>
                <h2 className="mt-3 text-lg font-semibold text-gray-900">
                  {selectedContact.firstName} {selectedContact.lastName}
                </h2>
                <p className="text-sm text-gray-500">{selectedContact.email}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <div className={`h-2 w-2 rounded-full ${statusConfig[selectedContact.status]?.dot}`} />
                  <span className={`text-sm ${statusConfig[selectedContact.status]?.color}`}>
                    {statusConfig[selectedContact.status]?.label}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm">Edit Contact</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>

              {/* Details */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3">Details</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">First Name</dt>
                    <dd className="text-sm text-gray-900">{selectedContact.firstName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Last Name</dt>
                    <dd className="text-sm text-gray-900">{selectedContact.lastName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Added</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(selectedContact.addedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Lists */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3">Lists</h4>
                {selectedContact.lists.length > 0 ? (
                  <div className="space-y-1">
                    {selectedContact.lists.map((list) => (
                      <div key={list} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="text-gray-400">&#128203;</span> {list}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No lists</p>
                )}
                <Button variant="ghost" size="sm" className="mt-2 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add to List
                </Button>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3">Tags</h4>
                {selectedContact.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContact.tags.map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No tags</p>
                )}
                <Button variant="ghost" size="sm" className="mt-2 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Tag
                </Button>
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3">Activity Timeline</h4>
                <div className="space-y-3 border-l-2 border-gray-200 pl-4 ml-1">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <p className="text-sm text-gray-700">{selectedContact.lastActivity}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-green-500" />
                    <p className="text-sm text-gray-700">
                      Subscribed - {new Date(selectedContact.addedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
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
