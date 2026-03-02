"use client";

import { useState } from "react";
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
  UserPlus,
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getInitials, generateAvatarColor, formatRelativeTime } from "@/lib/utils";

// Mock data
const mockContacts = [
  { id: "1", email: "sarah@example.com", firstName: "Sarah", lastName: "Lee", lists: ["Newsletter", "VIP"], tags: ["VIP", "Engaged"], status: "subscribed", addedAt: "2025-01-15T10:00:00Z", lastActivity: "Opened 'Summer Sale' - 2h ago" },
  { id: "2", email: "john@example.com", firstName: "John", lastName: "Smith", lists: ["Newsletter"], tags: ["New"], status: "subscribed", addedAt: "2025-02-10T10:00:00Z", lastActivity: "Clicked link - 1d ago" },
  { id: "3", email: "jane@example.com", firstName: "Jane", lastName: "Doe", lists: ["Newsletter"], tags: [], status: "unsubscribed", addedAt: "2025-01-20T10:00:00Z", lastActivity: "Unsubscribed - 3d ago" },
  { id: "4", email: "mike@example.com", firstName: "Mike", lastName: "Brown", lists: [], tags: ["Enterprise"], status: "subscribed", addedAt: "2025-03-01T10:00:00Z", lastActivity: "Subscribed - 5d ago" },
  { id: "5", email: "emma@example.com", firstName: "Emma", lastName: "Wilson", lists: ["VIP"], tags: ["VIP"], status: "subscribed", addedAt: "2025-02-28T10:00:00Z", lastActivity: "Opened 'Newsletter #45' - 1d ago" },
  { id: "6", email: "alex@example.com", firstName: "Alex", lastName: "Johnson", lists: ["Newsletter", "Product Updates"], tags: [], status: "bounced", addedAt: "2025-01-05T10:00:00Z", lastActivity: "Bounced - 2w ago" },
];

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

export default function AudiencePage() {
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<typeof mockContacts[0] | null>(null);

  const filteredContacts = mockContacts.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map((c) => c.id));
    }
  };

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
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Filter
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedContacts.length > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className="text-sm font-medium text-indigo-700">
                {selectedContacts.length} contacts selected
              </span>
              <Button variant="outline" size="sm">Add to List</Button>
              <Button variant="outline" size="sm">Add Tag</Button>
              <Button variant="destructive" size="sm">Delete</Button>
              <button
                className="ml-auto text-sm text-indigo-600 hover:underline"
                onClick={() => setSelectedContacts([])}
              >
                Clear selection
              </button>
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
                        checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                        onChange={toggleAll}
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
                  {filteredContacts.map((contact) => (
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
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing 1-{filteredContacts.length} of {filteredContacts.length} contacts
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-700 px-2">1</span>
                <Button variant="outline" size="sm" disabled>
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
