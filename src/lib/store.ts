// In-memory data store for demo/development mode
// In production, replace with Prisma database calls

import { create } from "zustand";

export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  lists: string[];
  tags: string[];
  status: "subscribed" | "unsubscribed" | "bounced" | "blacklisted";
  addedAt: string;
  lastActivity: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused";
  senderName: string;
  senderEmail: string;
  replyTo: string;
  subject: string;
  previewText: string;
  htmlContent: string;
  contentType: string;
  recipientType: string;
  selectedLists: string[];
  estimatedRecipients: number;
  scheduledAt: string | null;
  sentAt: string | null;
  openRate: number | null;
  clickRate: number | null;
  unsubRate: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  htmlContent: string;
  jsonContent: object | null;
  isPrebuilt: boolean;
  createdAt: string;
  updatedAt: string;
}

// Seed data
const seedContacts: Contact[] = [
  { id: "c1", email: "sarah@example.com", firstName: "Sarah", lastName: "Lee", phone: "+1 555-0101", company: "Acme Corp", lists: ["Newsletter Subscribers", "VIP Customers"], tags: ["VIP", "Engaged"], status: "subscribed", addedAt: "2025-01-15T10:00:00Z", lastActivity: "Opened 'Summer Sale' - 2h ago" },
  { id: "c2", email: "john@example.com", firstName: "John", lastName: "Smith", phone: "+1 555-0102", company: "TechStart Inc", lists: ["Newsletter Subscribers"], tags: ["New"], status: "subscribed", addedAt: "2025-02-10T10:00:00Z", lastActivity: "Clicked link - 1d ago" },
  { id: "c3", email: "jane@example.com", firstName: "Jane", lastName: "Doe", phone: "", company: "Design Co", lists: ["Newsletter Subscribers"], tags: [], status: "unsubscribed", addedAt: "2025-01-20T10:00:00Z", lastActivity: "Unsubscribed - 3d ago" },
  { id: "c4", email: "mike@example.com", firstName: "Mike", lastName: "Brown", phone: "+1 555-0104", company: "", lists: [], tags: ["Enterprise"], status: "subscribed", addedAt: "2025-03-01T10:00:00Z", lastActivity: "Subscribed - 5d ago" },
  { id: "c5", email: "emma@example.com", firstName: "Emma", lastName: "Wilson", phone: "+1 555-0105", company: "Growth Labs", lists: ["VIP Customers"], tags: ["VIP"], status: "subscribed", addedAt: "2025-02-28T10:00:00Z", lastActivity: "Opened 'Newsletter #45' - 1d ago" },
  { id: "c6", email: "alex@example.com", firstName: "Alex", lastName: "Johnson", phone: "", company: "Startup XYZ", lists: ["Newsletter Subscribers", "Product Updates"], tags: [], status: "bounced", addedAt: "2025-01-05T10:00:00Z", lastActivity: "Bounced - 2w ago" },
];

const seedCampaigns: Campaign[] = [
  { id: "camp1", name: "Summer Sale Announcement", type: "regular", status: "sent", senderName: "Acme Corp", senderEmail: "hello@acme.com", replyTo: "", subject: "Summer Sale - 50% off everything!", previewText: "Don't miss our biggest sale", htmlContent: "<h1>Summer Sale!</h1>", contentType: "html", recipientType: "lists", selectedLists: ["Newsletter Subscribers"], estimatedRecipients: 8234, scheduledAt: null, sentAt: "2025-06-10T14:30:00Z", openRate: 24.3, clickRate: 3.8, unsubRate: 0.1, tags: ["promotional"], createdAt: "2025-06-08T10:00:00Z", updatedAt: "2025-06-10T14:30:00Z" },
  { id: "camp2", name: "Product Update v3.2", type: "regular", status: "draft", senderName: "Acme Corp", senderEmail: "hello@acme.com", replyTo: "", subject: "", previewText: "", htmlContent: "", contentType: "", recipientType: "", selectedLists: [], estimatedRecipients: 0, scheduledAt: null, sentAt: null, openRate: null, clickRate: null, unsubRate: null, tags: [], createdAt: "2025-06-12T09:15:00Z", updatedAt: "2025-06-12T09:15:00Z" },
  { id: "camp3", name: "Weekly Newsletter #46", type: "regular", status: "scheduled", senderName: "Acme Corp", senderEmail: "hello@acme.com", replyTo: "", subject: "This week in tech", previewText: "Your weekly digest", htmlContent: "<h1>Newsletter</h1>", contentType: "html", recipientType: "lists", selectedLists: ["Newsletter Subscribers"], estimatedRecipients: 12847, scheduledAt: "2025-06-15T10:00:00Z", sentAt: null, openRate: null, clickRate: null, unsubRate: null, tags: ["newsletter"], createdAt: "2025-06-13T08:00:00Z", updatedAt: "2025-06-13T08:00:00Z" },
  { id: "camp4", name: "Welcome Email Series", type: "regular", status: "sent", senderName: "Acme Corp", senderEmail: "hello@acme.com", replyTo: "", subject: "Welcome to Acme!", previewText: "We're glad you're here", htmlContent: "<h1>Welcome!</h1>", contentType: "html", recipientType: "lists", selectedLists: ["Newsletter Subscribers"], estimatedRecipients: 456, scheduledAt: null, sentAt: "2025-06-05T08:00:00Z", openRate: 45.2, clickRate: 12.1, unsubRate: 0.0, tags: ["welcome"], createdAt: "2025-06-04T10:00:00Z", updatedAt: "2025-06-05T08:00:00Z" },
];

const seedLists: ContactList[] = [
  { id: "list1", name: "Newsletter Subscribers", description: "Main newsletter list", contactCount: 8234, createdAt: "2025-01-01T00:00:00Z" },
  { id: "list2", name: "VIP Customers", description: "High-value customers", contactCount: 456, createdAt: "2025-01-15T00:00:00Z" },
  { id: "list3", name: "Product Updates", description: "Product update notifications", contactCount: 3102, createdAt: "2025-02-01T00:00:00Z" },
];

// Global in-memory store (persists across API calls within the same server process)
declare global {
  // eslint-disable-next-line no-var
  var _store: {
    contacts: Contact[];
    campaigns: Campaign[];
    lists: ContactList[];
    templates: Template[];
    initialized: boolean;
  } | undefined;
}

function getStore() {
  if (!global._store || !global._store.initialized) {
    global._store = {
      contacts: [...seedContacts],
      campaigns: [...seedCampaigns],
      lists: [...seedLists],
      templates: [],
      initialized: true,
    };
  }
  return global._store;
}

// Contacts
export function getContacts(search?: string): Contact[] {
  const store = getStore();
  if (!search) return store.contacts;
  const q = search.toLowerCase();
  return store.contacts.filter(
    (c) =>
      c.email.toLowerCase().includes(q) ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function getContact(id: string): Contact | undefined {
  return getStore().contacts.find((c) => c.id === id);
}

export function createContact(data: Omit<Contact, "id" | "addedAt" | "lastActivity">): Contact {
  const store = getStore();
  const contact: Contact = {
    ...data,
    id: `c${Date.now()}`,
    addedAt: new Date().toISOString(),
    lastActivity: `Subscribed - just now`,
  };
  store.contacts.unshift(contact);
  return contact;
}

export function updateContact(id: string, data: Partial<Contact>): Contact | null {
  const store = getStore();
  const idx = store.contacts.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  store.contacts[idx] = { ...store.contacts[idx], ...data };
  return store.contacts[idx];
}

export function deleteContact(id: string): boolean {
  const store = getStore();
  const idx = store.contacts.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  store.contacts.splice(idx, 1);
  return true;
}

export function importContacts(contacts: Partial<Contact>[], listName?: string, tags?: string[], updateExisting?: boolean): { imported: number; updated: number; skipped: number } {
  const store = getStore();
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const data of contacts) {
    if (!data.email) { skipped++; continue; }
    const existing = store.contacts.find((c) => c.email.toLowerCase() === data.email!.toLowerCase());
    if (existing) {
      if (updateExisting) {
        Object.assign(existing, {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.phone && { phone: data.phone }),
          ...(data.company && { company: data.company }),
        });
        if (listName && !existing.lists.includes(listName)) existing.lists.push(listName);
        if (tags) existing.tags = [...new Set([...existing.tags, ...tags])];
        updated++;
      } else {
        skipped++;
      }
    } else {
      const contact: Contact = {
        id: `c${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        email: data.email,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        company: data.company || "",
        lists: listName ? [listName] : [],
        tags: tags || [],
        status: "subscribed",
        addedAt: new Date().toISOString(),
        lastActivity: "Imported - just now",
      };
      store.contacts.unshift(contact);
      imported++;
    }
  }

  // Update list counts
  if (listName) {
    const list = store.lists.find((l) => l.name === listName);
    if (list) list.contactCount = store.contacts.filter((c) => c.lists.includes(listName)).length;
  }

  return { imported, updated, skipped };
}

// Campaigns
export function getCampaigns(status?: string): Campaign[] {
  const store = getStore();
  if (!status || status === "all") return store.campaigns;
  return store.campaigns.filter((c) => c.status === status);
}

export function getCampaign(id: string): Campaign | undefined {
  return getStore().campaigns.find((c) => c.id === id);
}

export function createCampaign(data: Partial<Campaign>): Campaign {
  const store = getStore();
  const campaign: Campaign = {
    id: `camp${Date.now()}`,
    name: data.name || "Untitled Campaign",
    type: data.type || "regular",
    status: "draft",
    senderName: data.senderName || "",
    senderEmail: data.senderEmail || "",
    replyTo: data.replyTo || "",
    subject: data.subject || "",
    previewText: data.previewText || "",
    htmlContent: data.htmlContent || "",
    contentType: data.contentType || "",
    recipientType: data.recipientType || "",
    selectedLists: data.selectedLists || [],
    estimatedRecipients: data.estimatedRecipients || 0,
    scheduledAt: null,
    sentAt: null,
    openRate: null,
    clickRate: null,
    unsubRate: null,
    tags: data.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.campaigns.unshift(campaign);
  return campaign;
}

export function updateCampaign(id: string, data: Partial<Campaign>): Campaign | null {
  const store = getStore();
  const idx = store.campaigns.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  store.campaigns[idx] = { ...store.campaigns[idx], ...data, updatedAt: new Date().toISOString() };
  return store.campaigns[idx];
}

export function deleteCampaign(id: string): boolean {
  const store = getStore();
  const idx = store.campaigns.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  store.campaigns.splice(idx, 1);
  return true;
}

// Lists
export function getLists(): ContactList[] {
  return getStore().lists;
}

export function createList(data: { name: string; description?: string }): ContactList {
  const store = getStore();
  const list: ContactList = {
    id: `list${Date.now()}`,
    name: data.name,
    description: data.description || "",
    contactCount: 0,
    createdAt: new Date().toISOString(),
  };
  store.lists.push(list);
  return list;
}

// Templates
export function getTemplates(): Template[] {
  return getStore().templates;
}

export function createTemplate(data: Omit<Template, "id" | "createdAt" | "updatedAt">): Template {
  const store = getStore();
  const template: Template = {
    ...data,
    id: `tmpl${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.templates.unshift(template);
  return template;
}

export function deleteTemplate(id: string): boolean {
  const store = getStore();
  const idx = store.templates.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  store.templates.splice(idx, 1);
  return true;
}

// Dashboard stats
export function getDashboardStats() {
  const store = getStore();
  const totalContacts = store.contacts.length;
  const campaignsSent = store.campaigns.filter((c) => c.status === "sent").length;
  const sentCampaigns = store.campaigns.filter((c) => c.status === "sent" && c.openRate !== null);
  const avgOpenRate = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / sentCampaigns.length
    : 0;
  const avgClickRate = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) / sentCampaigns.length
    : 0;

  return {
    totalContacts,
    campaignsSent,
    avgOpenRate: Math.round(avgOpenRate * 10) / 10,
    avgClickRate: Math.round(avgClickRate * 10) / 10,
    recentCampaigns: store.campaigns.slice(0, 5),
  };
}

// ========== Client-side Zustand Store ==========

export interface Automation {
  id: string;
  name: string;
  status: "active" | "paused" | "draft";
  trigger: string;
  triggerConfig: Record<string, unknown>;
  nodes: { id: string; type: string; config: Record<string, unknown> }[];
  entered: number;
  completion: number;
  createdAt: string;
  updatedAt: string;
}

export interface Form {
  id: string;
  name: string;
  type: "embedded" | "popup" | "slide_in" | "top_bar";
  status: "active" | "inactive";
  fields: { name: string; type: string; required: boolean }[];
  successMessage: string;
  doubleOptin: boolean;
  submissions: number;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  // Data
  contacts: Contact[];
  campaigns: Campaign[];
  lists: ContactList[];
  templates: Template[];
  automations: Automation[];
  forms: Form[];

  // Contact actions
  addContact: (data: Omit<Contact, "id" | "addedAt" | "lastActivity">) => void;
  deleteContacts: (ids: string[]) => void;

  // Campaign actions
  addCampaign: (data: Partial<Campaign>) => void;

  // List actions
  addList: (name: string) => void;

  // Template actions
  addTemplate: (data: { name: string; category: string; htmlContent: string; isPrebuilt: boolean }) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;

  // Automation actions
  addAutomation: (data: Omit<Automation, "id" | "createdAt" | "updatedAt">) => void;
  updateAutomation: (id: string, data: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;

  // Form actions
  addForm: (data: Omit<Form, "id" | "submissions" | "createdAt" | "updatedAt">) => void;
  updateForm: (id: string, data: Partial<Form>) => void;
  deleteForm: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Seed data
  contacts: [...seedContacts],
  campaigns: [...seedCampaigns],
  lists: [...seedLists],
  templates: [],
  automations: [],
  forms: [],

  // Contact actions
  addContact: (data) =>
    set((state) => ({
      contacts: [
        {
          ...data,
          id: `c${Date.now()}`,
          addedAt: new Date().toISOString(),
          lastActivity: "Subscribed - just now",
        },
        ...state.contacts,
      ],
    })),

  deleteContacts: (ids) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => !ids.includes(c.id)),
    })),

  // Campaign actions
  addCampaign: (data) =>
    set((state) => ({
      campaigns: [
        {
          id: `camp${Date.now()}`,
          name: data.name || "Untitled Campaign",
          type: data.type || "regular",
          status: (data.status as Campaign["status"]) || "draft",
          senderName: data.senderName || "",
          senderEmail: data.senderEmail || "",
          replyTo: data.replyTo || "",
          subject: data.subject || "",
          previewText: data.previewText || "",
          htmlContent: data.htmlContent || "",
          contentType: data.contentType || "",
          recipientType: data.recipientType || "",
          selectedLists: data.selectedLists || [],
          estimatedRecipients: data.estimatedRecipients || 0,
          scheduledAt: data.scheduledAt || null,
          sentAt: data.sentAt || null,
          openRate: data.openRate ?? null,
          clickRate: data.clickRate ?? null,
          unsubRate: data.unsubRate ?? null,
          tags: data.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...state.campaigns,
      ],
    })),

  // List actions
  addList: (name) =>
    set((state) => ({
      lists: [
        ...state.lists,
        {
          id: `list${Date.now()}`,
          name,
          description: "",
          contactCount: 0,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  // Template actions
  addTemplate: (data) =>
    set((state) => ({
      templates: [
        {
          id: `tmpl${Date.now()}`,
          name: data.name,
          category: data.category,
          htmlContent: data.htmlContent,
          jsonContent: null,
          isPrebuilt: data.isPrebuilt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...state.templates,
      ],
    })),

  deleteTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),

  duplicateTemplate: (id) =>
    set((state) => {
      const original = state.templates.find((t) => t.id === id);
      if (!original) return state;
      return {
        templates: [
          {
            ...original,
            id: `tmpl${Date.now()}`,
            name: `${original.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...state.templates,
        ],
      };
    }),

  // Automation actions
  addAutomation: (data) =>
    set((state) => ({
      automations: [
        ...state.automations,
        {
          ...data,
          id: `auto${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateAutomation: (id, data) =>
    set((state) => ({
      automations: state.automations.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      ),
    })),

  deleteAutomation: (id) =>
    set((state) => ({
      automations: state.automations.filter((a) => a.id !== id),
    })),

  // Form actions
  addForm: (data) =>
    set((state) => ({
      forms: [
        ...state.forms,
        {
          ...data,
          id: `form${Date.now()}`,
          submissions: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateForm: (id, data) =>
    set((state) => ({
      forms: state.forms.map((f) =>
        f.id === id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f
      ),
    })),

  deleteForm: (id) =>
    set((state) => ({
      forms: state.forms.filter((f) => f.id !== id),
    })),
}))
