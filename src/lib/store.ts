import { create } from "zustand";

// ─── Contact ────────────────────────────────────────────────────
export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  lists: string[];
  tags: string[];
  status: "subscribed" | "unsubscribed" | "bounced" | "blacklisted";
  addedAt: string;
  lastActivity?: string;
}

// ─── Campaign ───────────────────────────────────────────────────
export interface Campaign {
  id: string;
  name: string;
  type: "regular" | "ab_test" | "automated";
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "archived";
  senderName?: string;
  senderEmail?: string;
  replyTo?: string;
  subject?: string;
  previewText?: string;
  htmlContent?: string;
  recipientType?: string;
  selectedLists?: string[];
  estimatedRecipients?: number;
  scheduledAt?: string;
  sentAt?: string;
  tags?: string[];
  openRate?: number;
  clickRate?: number;
  unsubRate?: number;
  lastEdited?: string;
  createdAt: string;
}

// ─── Template ───────────────────────────────────────────────────
export interface Template {
  id: string;
  name: string;
  category: string;
  htmlContent: string;
  isPrebuilt: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Automation ─────────────────────────────────────────────────
export interface AutomationNode {
  id: string;
  type: "trigger" | "email" | "delay" | "condition" | "add_tag" | "add_to_list" | "end";
  config: Record<string, unknown>;
  children?: string[]; // node IDs
}

export interface Automation {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "archived";
  trigger: string;
  triggerConfig: Record<string, unknown>;
  nodes: AutomationNode[];
  entered: number;
  completion: number;
  createdAt: string;
}

// ─── Form ───────────────────────────────────────────────────────
export interface AppForm {
  id: string;
  name: string;
  type: "embedded" | "popup" | "slide_in" | "top_bar";
  status: "active" | "inactive";
  fields: { name: string; type: string; required: boolean }[];
  targetList?: string;
  successMessage?: string;
  doubleOptin: boolean;
  submissions: number;
  createdAt: string;
}

// ─── ContactList ────────────────────────────────────────────────
export interface ContactList {
  id: string;
  name: string;
  description?: string;
  count: number;
  createdAt: string;
}

// ─── Tag ────────────────────────────────────────────────────────
export interface Tag {
  name: string;
  color: string;
  count: number;
}

// ─── Segment ────────────────────────────────────────────────────
export interface Segment {
  id: string;
  name: string;
  conditions: string;
  logic: "AND" | "OR";
  count: number;
}

// ─── Store ──────────────────────────────────────────────────────
interface AppState {
  // Contacts
  contacts: Contact[];
  addContact: (c: Omit<Contact, "id" | "addedAt">) => void;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  deleteContacts: (ids: string[]) => void;

  // Lists
  lists: ContactList[];
  addList: (name: string, description?: string) => void;
  deleteList: (id: string) => void;

  // Tags
  tags: Tag[];
  addTag: (name: string, color: string) => void;
  deleteTag: (name: string) => void;

  // Segments
  segments: Segment[];
  addSegment: (s: Omit<Segment, "id">) => void;
  deleteSegment: (id: string) => void;

  // Campaigns
  campaigns: Campaign[];
  addCampaign: (c: Omit<Campaign, "id" | "createdAt">) => Campaign;
  updateCampaign: (id: string, data: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;

  // Templates
  templates: Template[];
  addTemplate: (t: Omit<Template, "id" | "createdAt" | "updatedAt">) => Template;
  updateTemplate: (id: string, data: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;

  // Automations
  automations: Automation[];
  addAutomation: (a: Omit<Automation, "id" | "createdAt">) => Automation;
  updateAutomation: (id: string, data: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;

  // Forms
  forms: AppForm[];
  addForm: (f: Omit<AppForm, "id" | "createdAt" | "submissions">) => AppForm;
  updateForm: (id: string, data: Partial<AppForm>) => void;
  deleteForm: (id: string) => void;
}

let nextId = 1;
function genId() {
  return String(nextId++);
}

function now() {
  return new Date().toISOString();
}

export const useAppStore = create<AppState>((set, get) => ({
  // ─── Contacts ─────────────────────────────────────────────────
  contacts: [],
  addContact: (c) =>
    set((s) => ({
      contacts: [...s.contacts, { ...c, id: genId(), addedAt: now() }],
    })),
  updateContact: (id, data) =>
    set((s) => ({
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  deleteContact: (id) =>
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
  deleteContacts: (ids) =>
    set((s) => ({
      contacts: s.contacts.filter((c) => !ids.includes(c.id)),
    })),

  // ─── Lists ────────────────────────────────────────────────────
  lists: [],
  addList: (name, description) =>
    set((s) => ({
      lists: [
        ...s.lists,
        { id: genId(), name, description, count: 0, createdAt: now() },
      ],
    })),
  deleteList: (id) =>
    set((s) => ({ lists: s.lists.filter((l) => l.id !== id) })),

  // ─── Tags ─────────────────────────────────────────────────────
  tags: [],
  addTag: (name, color) =>
    set((s) => ({ tags: [...s.tags, { name, color, count: 0 }] })),
  deleteTag: (name) =>
    set((s) => ({ tags: s.tags.filter((t) => t.name !== name) })),

  // ─── Segments ─────────────────────────────────────────────────
  segments: [],
  addSegment: (seg) =>
    set((s) => ({ segments: [...s.segments, { ...seg, id: genId() }] })),
  deleteSegment: (id) =>
    set((s) => ({ segments: s.segments.filter((seg) => seg.id !== id) })),

  // ─── Campaigns ────────────────────────────────────────────────
  campaigns: [],
  addCampaign: (c) => {
    const campaign: Campaign = { ...c, id: genId(), createdAt: now() };
    set((s) => ({ campaigns: [...s.campaigns, campaign] }));
    return campaign;
  },
  updateCampaign: (id, data) =>
    set((s) => ({
      campaigns: s.campaigns.map((c) =>
        c.id === id ? { ...c, ...data, lastEdited: now() } : c
      ),
    })),
  deleteCampaign: (id) =>
    set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),
  duplicateCampaign: (id) => {
    const original = get().campaigns.find((c) => c.id === id);
    if (original) {
      const dup: Campaign = {
        ...original,
        id: genId(),
        name: `${original.name} (Copy)`,
        status: "draft",
        createdAt: now(),
        sentAt: undefined,
        scheduledAt: undefined,
      };
      set((s) => ({ campaigns: [...s.campaigns, dup] }));
    }
  },

  // ─── Templates ────────────────────────────────────────────────
  templates: [],
  addTemplate: (t) => {
    const template: Template = {
      ...t,
      id: genId(),
      createdAt: now(),
      updatedAt: now(),
    };
    set((s) => ({ templates: [...s.templates, template] }));
    return template;
  },
  updateTemplate: (id, data) =>
    set((s) => ({
      templates: s.templates.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: now() } : t
      ),
    })),
  deleteTemplate: (id) =>
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
  duplicateTemplate: (id) => {
    const orig = get().templates.find((t) => t.id === id);
    if (orig) {
      set((s) => ({
        templates: [
          ...s.templates,
          {
            ...orig,
            id: genId(),
            name: `${orig.name} (Copy)`,
            isPrebuilt: false,
            createdAt: now(),
            updatedAt: now(),
          },
        ],
      }));
    }
  },

  // ─── Automations ──────────────────────────────────────────────
  automations: [],
  addAutomation: (a) => {
    const automation: Automation = { ...a, id: genId(), createdAt: now() };
    set((s) => ({ automations: [...s.automations, automation] }));
    return automation;
  },
  updateAutomation: (id, data) =>
    set((s) => ({
      automations: s.automations.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    })),
  deleteAutomation: (id) =>
    set((s) => ({
      automations: s.automations.filter((a) => a.id !== id),
    })),

  // ─── Forms ────────────────────────────────────────────────────
  forms: [],
  addForm: (f) => {
    const form: AppForm = { ...f, id: genId(), createdAt: now(), submissions: 0 };
    set((s) => ({ forms: [...s.forms, form] }));
    return form;
  },
  updateForm: (id, data) =>
    set((s) => ({
      forms: s.forms.map((f) => (f.id === id ? { ...f, ...data } : f)),
    })),
  deleteForm: (id) =>
    set((s) => ({ forms: s.forms.filter((f) => f.id !== id) })),
}));
