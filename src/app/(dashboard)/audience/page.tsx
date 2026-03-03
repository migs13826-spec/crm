"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus, Upload, Download, Search, MoreHorizontal, ChevronLeft, ChevronRight,
  X, ShieldCheck, CheckCircle, AlertTriangle, XCircle, Loader2, Trash2,
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
import { useAppStore } from "@/lib/store";
import type { EmailValidationResult } from "@/lib/email-validation";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  subscribed: { label: "Subscribed", color: "text-emerald-700", dot: "bg-emerald-500" },
  unsubscribed: { label: "Unsubscribed", color: "text-red-700", dot: "bg-red-500" },
  bounced: { label: "Bounced", color: "text-amber-700", dot: "bg-amber-500" },
  blacklisted: { label: "Blacklisted", color: "text-gray-700", dot: "bg-gray-900" },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function AudiencePage() {
  const { contacts, addContact, deleteContact, deleteContacts, lists, addList, deleteList, tags, addTag, deleteTag, segments, addSegment, deleteSegment } = useAppStore();
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddList, setShowAddList] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [selectedContact, setSelectedContact] = useState<typeof contacts[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showValidation, setShowValidation] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<{ results: EmailValidationResult[]; summary: { total: number; valid: number; invalid: number; risky: number } } | null>(null);

  // New contact form
  const [newContact, setNewContact] = useState({ email: "", firstName: "", lastName: "", phone: "", company: "" });
  const [newListName, setNewListName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366F1");

  const filteredContacts = useMemo(() => contacts.filter(
    (c) => c.email.toLowerCase().includes(search.toLowerCase()) || c.firstName.toLowerCase().includes(search.toLowerCase()) || c.lastName.toLowerCase().includes(search.toLowerCase())
  ), [contacts, search]);

  const totalContacts = filteredContacts.length;
  const totalPages = Math.max(1, Math.ceil(totalContacts / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalContacts);
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  const handleSearchChange = (v: string) => { setSearch(v); setCurrentPage(1); };
  const handlePageSizeChange = (n: number) => { setPageSize(n); setCurrentPage(1); };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const toggleContact = (id: string) => setSelectedContacts((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);
  const allOnPageSelected = paginatedContacts.length > 0 && paginatedContacts.every((c) => selectedContacts.includes(c.id));
  const toggleAllOnPage = () => {
    const ids = paginatedContacts.map((c) => c.id);
    if (allOnPageSelected) setSelectedContacts((p) => p.filter((id) => !ids.includes(id)));
    else setSelectedContacts((p) => [...new Set([...p, ...ids])]);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.email) return;
    addContact({ email: newContact.email, firstName: newContact.firstName, lastName: newContact.lastName, phone: newContact.phone, company: newContact.company, lists: [], tags: [], status: "subscribed" });
    setNewContact({ email: "", firstName: "", lastName: "", phone: "", company: "" });
    setShowAddContact(false);
  };

  const handleDeleteSelected = () => {
    deleteContacts(selectedContacts);
    setSelectedContacts([]);
  };

  const handleValidateEmails = async () => {
    const emails = contacts.filter((c) => selectedContacts.includes(c.id)).map((c) => c.email);
    if (!emails.length) return;
    setShowValidation(true); setValidating(true); setValidationProgress(0); setValidationResults(null);
    try {
      const iv = setInterval(() => setValidationProgress((p) => Math.min(p + 15, 90)), 200);
      const res = await fetch("/api/contacts/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emails }) });
      clearInterval(iv); setValidationProgress(100);
      if (res.ok) setValidationResults(await res.json());
    } catch (e) { console.error(e); } finally { setValidating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Audience</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddContact(true)}><Plus className="h-4 w-4 mr-1" />Add Contact</Button>
          <Link href="/audience/import"><Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" />Import</Button></Link>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
        </div>
      </div>

      <Tabs defaultValue="contacts">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="contacts">All Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="lists">Lists ({lists.length})</TabsTrigger>
          <TabsTrigger value="segments">Segments ({segments.length})</TabsTrigger>
          <TabsTrigger value="tags">Tags ({tags.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by email, name..." className="pl-9" value={search} onChange={(e) => handleSearchChange(e.target.value)} />
            </div>
          </div>

          {selectedContacts.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className="text-sm font-medium text-indigo-700">{selectedContacts.length} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleValidateEmails} className="border-indigo-300 text-indigo-700 hover:bg-indigo-100">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />Validate Emails
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
                <button className="text-sm text-indigo-600 hover:underline" onClick={() => setSelectedContacts([])}>Clear</button>
              </div>
            </div>
          )}

          {contacts.length === 0 ? (
            <Card><CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No contacts yet</h3>
              <p className="text-sm text-gray-500 mt-1">Add your first contact or import from a file</p>
              <div className="flex gap-3 justify-center mt-4">
                <Button onClick={() => setShowAddContact(true)}><Plus className="h-4 w-4 mr-1" />Add Contact</Button>
                <Link href="/audience/import"><Button variant="outline"><Upload className="h-4 w-4 mr-1" />Import</Button></Link>
              </div>
            </CardContent></Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="w-10 px-4 py-3"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-500" checked={allOnPageSelected} onChange={toggleAllOnPage} /></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 hidden md:table-cell">Added</th>
                      <th className="w-10 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedContacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-500" checked={selectedContacts.includes(contact.id)} onChange={() => toggleContact(contact.id)} /></td>
                        <td className="px-4 py-3"><span className="text-sm font-medium text-gray-900">{contact.email}</span></td>
                        <td className="px-4 py-3"><span className="text-sm text-gray-700">{contact.firstName} {contact.lastName}</span></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className={`h-2 w-2 rounded-full ${statusConfig[contact.status]?.dot}`} /><span className={`text-xs font-medium ${statusConfig[contact.status]?.color}`}>{statusConfig[contact.status]?.label}</span></div></td>
                        <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-gray-500">{new Date(contact.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}><button className="p-1 rounded hover:bg-gray-100" onClick={() => deleteContact(contact.id)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">Showing {totalContacts === 0 ? 0 : startIndex + 1}-{endIndex} of {totalContacts}</p>
                  <select className="h-8 rounded-md border border-gray-300 px-2 text-xs" value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
                    {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s} per page</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                  {getPageNumbers().map((page, i) => page === "ellipsis" ? <span key={`e-${i}`} className="px-2 text-sm text-gray-400">...</span> : (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`h-8 w-8 rounded-md text-sm font-medium ${currentPage === page ? "bg-indigo-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}>{page}</button>
                  ))}
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lists">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{lists.length} lists</p>
            <Button size="sm" onClick={() => setShowAddList(true)}><Plus className="h-4 w-4 mr-1" />Create List</Button>
          </div>
          {lists.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-sm text-gray-500">No lists yet. Create one to organize your contacts.</p><Button size="sm" className="mt-3" onClick={() => setShowAddList(true)}>Create List</Button></CardContent></Card>
          ) : (
            <Card>
              <table className="w-full">
                <thead><tr className="border-b border-gray-100 bg-gray-50"><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">List Name</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Contacts</th><th className="w-10 px-4 py-3"></th></tr></thead>
                <tbody>{lists.map((list) => (
                  <tr key={list.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3"><span className="text-sm font-medium text-gray-900">{list.name}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-gray-600">{list.count}</span></td>
                    <td className="px-4 py-3"><button className="p-1 rounded hover:bg-gray-100" onClick={() => deleteList(list.id)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="segments">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{segments.length} segments</p>
            <Button size="sm" onClick={() => addSegment({ name: `Segment ${segments.length + 1}`, conditions: "Custom conditions", logic: "AND", count: 0 })}><Plus className="h-4 w-4 mr-1" />Create Segment</Button>
          </div>
          {segments.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-sm text-gray-500">No segments yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-3">{segments.map((seg) => (
              <Card key={seg.id}><CardContent className="p-4 flex items-center justify-between">
                <div><h3 className="text-sm font-semibold text-gray-900">{seg.name}</h3><p className="text-xs text-gray-500">{seg.conditions}</p></div>
                <div className="flex items-center gap-3"><span className="text-sm text-gray-600">{seg.count} contacts</span><button className="p-1 rounded hover:bg-gray-100" onClick={() => deleteSegment(seg.id)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" /></button></div>
              </CardContent></Card>
            ))}</div>
          )}
        </TabsContent>

        <TabsContent value="tags">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{tags.length} tags</p>
            <Button size="sm" onClick={() => setShowAddTag(true)}><Plus className="h-4 w-4 mr-1" />Create Tag</Button>
          </div>
          {tags.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-sm text-gray-500">No tags yet.</p><Button size="sm" className="mt-3" onClick={() => setShowAddTag(true)}>Create Tag</Button></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{tags.map((tag) => (
              <Card key={tag.name}><CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} /><div><h3 className="text-sm font-semibold text-gray-900">{tag.name}</h3><p className="text-xs text-gray-500">{tag.count} contacts</p></div></div>
                <button className="p-1 rounded hover:bg-gray-100" onClick={() => deleteTag(tag.name)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" /></button>
              </CardContent></Card>
            ))}</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="sm:max-w-[560px]"><DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleAddContact}>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="email@example.com" required value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>First Name</Label><Input placeholder="First name" value={newContact.firstName} onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input placeholder="Last name" value={newContact.lastName} onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Phone</Label><Input type="tel" placeholder="+1 555-0123" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Company</Label><Input placeholder="Company name" value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} /></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setShowAddContact(false)}>Cancel</Button><Button type="submit">Add Contact</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add List Dialog */}
      <Dialog open={showAddList} onOpenChange={setShowAddList}>
        <DialogContent className="sm:max-w-[400px]"><DialogHeader><DialogTitle>Create List</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (newListName) { addList(newListName); setNewListName(""); setShowAddList(false); } }}>
            <div className="space-y-2 mb-4"><Label>List Name</Label><Input placeholder="e.g., Newsletter Subscribers" value={newListName} onChange={(e) => setNewListName(e.target.value)} required /></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setShowAddList(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Tag Dialog */}
      <Dialog open={showAddTag} onOpenChange={setShowAddTag}>
        <DialogContent className="sm:max-w-[400px]"><DialogHeader><DialogTitle>Create Tag</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (newTagName) { addTag(newTagName, newTagColor); setNewTagName(""); setShowAddTag(false); } }}>
            <div className="space-y-2 mb-3"><Label>Tag Name</Label><Input placeholder="e.g., VIP" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} required /></div>
            <div className="space-y-2 mb-4"><Label>Color</Label><div className="flex gap-2">{["#6366F1","#10B981","#F59E0B","#EF4444","#3B82F6","#8B5CF6","#EC4899","#6B7280"].map((c) => (<button key={c} type="button" className={`h-8 w-8 rounded-full border-2 ${newTagColor === c ? "border-gray-900" : "border-transparent"}`} style={{ backgroundColor: c }} onClick={() => setNewTagColor(c)} />))}</div></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setShowAddTag(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Validation Dialog */}
      <Dialog open={showValidation} onOpenChange={setShowValidation}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-indigo-500" />Email Validation</DialogTitle><DialogDescription>Validating {selectedContacts.length} emails</DialogDescription></DialogHeader>
          {validating && !validationResults && (<div className="py-8 space-y-4 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /><p className="text-sm text-gray-600">Validating...</p><Progress value={validationProgress} className="max-w-xs mx-auto" /></div>)}
          {validationResults && (<div className="space-y-4 overflow-hidden flex flex-col flex-1">
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 text-center"><p className="text-2xl font-bold text-gray-900">{validationResults.summary.total}</p><p className="text-xs text-gray-500">Total</p></div>
              <div className="rounded-lg bg-emerald-50 p-3 text-center"><p className="text-2xl font-bold text-emerald-600">{validationResults.summary.valid}</p><p className="text-xs text-emerald-600">Valid</p></div>
              <div className="rounded-lg bg-amber-50 p-3 text-center"><p className="text-2xl font-bold text-amber-600">{validationResults.summary.risky}</p><p className="text-xs text-amber-600">Risky</p></div>
              <div className="rounded-lg bg-red-50 p-3 text-center"><p className="text-2xl font-bold text-red-600">{validationResults.summary.invalid}</p><p className="text-xs text-red-600">Invalid</p></div>
            </div>
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg"><table className="w-full"><thead className="sticky top-0"><tr className="bg-gray-50 border-b"><th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Status</th><th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Email</th><th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Reason</th></tr></thead>
              <tbody>{validationResults.results.map((r, i) => (<tr key={i} className="border-b border-gray-50"><td className="px-3 py-2">{r.valid && r.riskLevel === "low" ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : r.valid ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-red-500" />}</td><td className="px-3 py-2 text-sm font-mono text-gray-900">{r.email}{r.suggestion && <p className="text-xs text-indigo-500">Suggestion: {r.suggestion}</p>}</td><td className="px-3 py-2 text-xs text-gray-600">{r.reason}</td></tr>))}</tbody>
            </table></div>
          </div>)}
          <DialogFooter><Button onClick={() => setShowValidation(false)}>{validating ? "Cancel" : "Close"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Detail Side Panel */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedContact(null)} />
          <div className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between"><h3 className="font-semibold text-gray-900">Contact Details</h3><button onClick={() => setSelectedContact(null)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-400" /></button></div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: generateAvatarColor(`${selectedContact.firstName} ${selectedContact.lastName}`) }}>{getInitials(`${selectedContact.firstName} ${selectedContact.lastName}`)}</div>
                <h2 className="mt-3 text-lg font-semibold text-gray-900">{selectedContact.firstName} {selectedContact.lastName}</h2>
                <p className="text-sm text-gray-500">{selectedContact.email}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2"><div className={`h-2 w-2 rounded-full ${statusConfig[selectedContact.status]?.dot}`} /><span className={`text-sm ${statusConfig[selectedContact.status]?.color}`}>{statusConfig[selectedContact.status]?.label}</span></div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="destructive" size="sm" onClick={() => { deleteContact(selectedContact.id); setSelectedContact(null); }}>Delete</Button>
              </div>
              <div><h4 className="text-xs font-semibold uppercase text-gray-400 mb-3">Details</h4>
                <dl className="space-y-2">
                  {selectedContact.phone && <div className="flex justify-between"><dt className="text-sm text-gray-500">Phone</dt><dd className="text-sm text-gray-900">{selectedContact.phone}</dd></div>}
                  {selectedContact.company && <div className="flex justify-between"><dt className="text-sm text-gray-500">Company</dt><dd className="text-sm text-gray-900">{selectedContact.company}</dd></div>}
                  <div className="flex justify-between"><dt className="text-sm text-gray-500">Added</dt><dd className="text-sm text-gray-900">{new Date(selectedContact.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
