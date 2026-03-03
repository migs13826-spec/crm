"use client";

import { useState, useCallback } from "react";
import {
  Building2,
  Link2,
  Mail,
  Users,
  Key,
  Webhook,
  Bell,
  AlertTriangle,
  ListPlus,
  Check,
  X,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Plus,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ---------- Toast notification component ----------
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  const colors = {
    success: "border-l-green-500 bg-green-50 text-green-800",
    error: "border-l-red-500 bg-red-50 text-red-800",
    info: "border-l-blue-500 bg-blue-50 text-blue-800",
  };
  const icons = {
    success: <Check className="h-4 w-4 text-green-600" />,
    error: <X className="h-4 w-4 text-red-600" />,
    info: <Bell className="h-4 w-4 text-blue-600" />,
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[100] flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 shadow-lg animate-in slide-in-from-right ${colors[type]}`}
      style={{ minWidth: 320, maxWidth: 420 }}
    >
      {icons[type]}
      <span className="text-sm flex-1">{message}</span>
      <button onClick={onClose} className="p-0.5 rounded hover:bg-black/5">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const show = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, show, dismiss };
}

// ---------- Settings Nav ----------
const settingsNav = [
  { id: "general", label: "General", icon: Building2 },
  { id: "brevo", label: "Brevo Connection", icon: Link2 },
  { id: "senders", label: "Sender Identities", icon: Mail },
  { id: "fields", label: "Custom Fields", icon: ListPlus },
  { id: "team", label: "Team Members", icon: Users },
  { id: "api", label: "API Keys", icon: Key },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

// ---------- Types ----------
interface Sender {
  id: string;
  name: string;
  email: string;
  status: "verified" | "pending" | "failed";
  isDefault: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending";
}

interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
}

// ---------- Main Component ----------
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  // ---- General Settings State ----
  const [general, setGeneral] = useState({
    orgName: "Acme Corp",
    timezone: "UTC",
    dateFormat: "YYYY-MM-DD",
    defaultFromName: "Acme Corp",
    defaultReplyTo: "hello@acme.com",
    companyAddress: "123 Main St, Suite 100, San Francisco, CA 94105",
    primaryColor: "#6366F1",
    secondaryColor: "#10B981",
    accentColor: "#F59E0B",
  });
  const [generalSaving, setGeneralSaving] = useState(false);

  const handleSaveGeneral = async () => {
    setGeneralSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setGeneralSaving(false);
    showToast("General settings saved successfully");
  };

  // ---- Brevo Connection State ----
  const [brevo, setBrevo] = useState({
    apiKey: "xkeysib-xxxxxxxxxxxxxxxxxxxx-xxxx",
    connected: true,
    accountName: "Acme Corp",
    plan: "Free",
    emailCredits: "300/day",
    lastSync: "2 minutes ago",
  });
  const [brevoKeyVisible, setBrevoKeyVisible] = useState(false);
  const [brevoChanging, setBrevoChanging] = useState(false);
  const [brevoNewKey, setBrevoNewKey] = useState("");
  const [brevoTesting, setBrevoTesting] = useState(false);
  const [brevoSyncing, setBrevoSyncing] = useState(false);

  const handleTestBrevoConnection = async () => {
    setBrevoTesting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setBrevoTesting(false);
    showToast("Brevo connection is working correctly");
  };

  const handleSaveBrevoKey = async () => {
    if (!brevoNewKey.trim()) {
      showToast("Please enter a valid API key", "error");
      return;
    }
    setBrevoTesting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setBrevo({ ...brevo, apiKey: brevoNewKey, connected: true });
    setBrevoChanging(false);
    setBrevoNewKey("");
    setBrevoTesting(false);
    showToast("Brevo API key updated and verified successfully");
  };

  const handleSyncBrevo = async () => {
    setBrevoSyncing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setBrevo({ ...brevo, lastSync: "Just now" });
    setBrevoSyncing(false);
    showToast("Brevo data synced successfully");
  };

  // ---- Senders State ----
  const [senders, setSenders] = useState<Sender[]>([
    { id: "s1", name: "Acme Corp", email: "hello@acme.com", status: "verified", isDefault: true },
    { id: "s2", name: "Marketing Team", email: "marketing@acme.com", status: "verified", isDefault: false },
    { id: "s3", name: "Support", email: "support@acme.com", status: "pending", isDefault: false },
  ]);
  const [showAddSender, setShowAddSender] = useState(false);
  const [newSender, setNewSender] = useState({ name: "", email: "" });
  const [addingSender, setAddingSender] = useState(false);
  const [deletingSenderId, setDeletingSenderId] = useState<string | null>(null);

  const handleAddSender = async () => {
    if (!newSender.name.trim() || !newSender.email.trim()) {
      showToast("Please fill in both name and email", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSender.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    setAddingSender(true);
    await new Promise((r) => setTimeout(r, 1000));
    const created: Sender = {
      id: `s${Date.now()}`,
      name: newSender.name,
      email: newSender.email,
      status: "pending",
      isDefault: false,
    };
    setSenders([...senders, created]);
    setNewSender({ name: "", email: "" });
    setShowAddSender(false);
    setAddingSender(false);
    showToast(`Verification email sent to ${created.email}`);
  };

  const handleSetDefaultSender = (id: string) => {
    setSenders(
      senders.map((s) => ({ ...s, isDefault: s.id === id }))
    );
    const sender = senders.find((s) => s.id === id);
    showToast(`${sender?.name} set as default sender`);
  };

  const handleDeleteSender = (id: string) => {
    const sender = senders.find((s) => s.id === id);
    if (sender?.isDefault) {
      showToast("Cannot delete the default sender", "error");
      return;
    }
    setSenders(senders.filter((s) => s.id !== id));
    setDeletingSenderId(null);
    showToast("Sender removed successfully");
  };

  const handleResendVerification = async (id: string) => {
    const sender = senders.find((s) => s.id === id);
    await new Promise((r) => setTimeout(r, 500));
    showToast(`Verification email resent to ${sender?.email}`);
  };

  // ---- Custom Fields State ----
  const [fields, setFields] = useState<CustomField[]>([
    { id: "f1", name: "Lifetime Value", type: "Number", required: false },
    { id: "f2", name: "Plan", type: "Text", required: false },
    { id: "f3", name: "Birthday", type: "Date", required: false },
    { id: "f4", name: "Is Premium", type: "Boolean", required: false },
  ]);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [fieldForm, setFieldForm] = useState({ name: "", type: "Text", required: false });
  const [fieldSaving, setFieldSaving] = useState(false);
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);

  const handleSaveField = async () => {
    if (!fieldForm.name.trim()) {
      showToast("Please enter a field name", "error");
      return;
    }
    setFieldSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editingField) {
      setFields(
        fields.map((f) =>
          f.id === editingField.id
            ? { ...f, name: fieldForm.name, type: fieldForm.type, required: fieldForm.required }
            : f
        )
      );
      showToast(`Field "${fieldForm.name}" updated`);
    } else {
      const created: CustomField = {
        id: `f${Date.now()}`,
        name: fieldForm.name,
        type: fieldForm.type,
        required: fieldForm.required,
      };
      setFields([...fields, created]);
      showToast(`Field "${created.name}" created`);
    }
    setFieldSaving(false);
    setShowAddField(false);
    setEditingField(null);
    setFieldForm({ name: "", type: "Text", required: false });
  };

  const handleDeleteField = (id: string) => {
    const field = fields.find((f) => f.id === id);
    setFields(fields.filter((f) => f.id !== id));
    setDeletingFieldId(null);
    showToast(`Field "${field?.name}" deleted`);
  };

  // ---- Team Members State ----
  const [team, setTeam] = useState<TeamMember[]>([
    { id: "t1", name: "Sarah Lee", email: "sarah@acme.com", role: "Owner", status: "active" },
    { id: "t2", name: "John Smith", email: "john@acme.com", role: "Admin", status: "active" },
    { id: "t3", name: "Jane Doe", email: "jane@acme.com", role: "Editor", status: "pending" },
  ]);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Editor" });
  const [inviting, setInviting] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const handleInviteMember = async () => {
    if (!inviteForm.email.trim()) {
      showToast("Please enter an email address", "error");
      return;
    }
    if (team.some((m) => m.email === inviteForm.email)) {
      showToast("This person is already a team member", "error");
      return;
    }
    setInviting(true);
    await new Promise((r) => setTimeout(r, 1000));
    const member: TeamMember = {
      id: `t${Date.now()}`,
      name: inviteForm.email.split("@")[0],
      email: inviteForm.email,
      role: inviteForm.role,
      status: "pending",
    };
    setTeam([...team, member]);
    setInviteForm({ email: "", role: "Editor" });
    setShowInviteMember(false);
    setInviting(false);
    showToast(`Invitation sent to ${member.email}`);
  };

  const handleChangeRole = (id: string, role: string) => {
    const member = team.find((m) => m.id === id);
    if (member?.role === "Owner") {
      showToast("Cannot change the owner's role", "error");
      return;
    }
    setTeam(team.map((m) => (m.id === id ? { ...m, role } : m)));
    showToast(`Role updated to ${role}`);
  };

  const handleRemoveMember = (id: string) => {
    const member = team.find((m) => m.id === id);
    if (member?.role === "Owner") {
      showToast("Cannot remove the organization owner", "error");
      setRemovingMemberId(null);
      return;
    }
    setTeam(team.filter((m) => m.id !== id));
    setRemovingMemberId(null);
    showToast(`${member?.name} removed from team`);
  };

  const handleResendInvite = async (id: string) => {
    const member = team.find((m) => m.id === id);
    await new Promise((r) => setTimeout(r, 500));
    showToast(`Invitation resent to ${member?.email}`);
  };

  // ---- API Keys State ----
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [showGenerateKey, setShowGenerateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatingKey, setGeneratingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      showToast("Please enter a key name", "error");
      return;
    }
    setGeneratingKey(true);
    await new Promise((r) => setTimeout(r, 1000));
    const key = `crm_${Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`;
    const created: ApiKeyItem = {
      id: `ak${Date.now()}`,
      name: newKeyName,
      key,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastUsed: null,
    };
    setApiKeys([...apiKeys, created]);
    setGeneratedKey(key);
    setGeneratingKey(false);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      showToast("API key copied to clipboard");
    }).catch(() => {
      showToast("Failed to copy key", "error");
    });
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    setRevokingKeyId(null);
    showToast("API key revoked");
  };

  const handleCloseGenerateKey = () => {
    setShowGenerateKey(false);
    setNewKeyName("");
    setGeneratedKey(null);
  };

  // ---- Webhooks State ----
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    url: "",
    events: [] as string[],
  });
  const [addingWebhook, setAddingWebhook] = useState(false);
  const [deletingWebhookId, setDeletingWebhookId] = useState<string | null>(null);

  const webhookEventOptions = [
    "contact.created",
    "contact.updated",
    "campaign.sent",
    "campaign.opened",
    "link.clicked",
    "contact.unsubscribed",
  ];

  const handleAddWebhook = async () => {
    if (!webhookForm.url.trim()) {
      showToast("Please enter a webhook URL", "error");
      return;
    }
    if (webhookForm.events.length === 0) {
      showToast("Please select at least one event", "error");
      return;
    }
    setAddingWebhook(true);
    await new Promise((r) => setTimeout(r, 800));
    const secret = `whsec_${Array.from({ length: 24 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`;
    const created: WebhookItem = {
      id: `wh${Date.now()}`,
      url: webhookForm.url,
      events: webhookForm.events,
      active: true,
      secret,
    };
    setWebhooks([...webhooks, created]);
    setWebhookForm({ url: "", events: [] });
    setShowAddWebhook(false);
    setAddingWebhook(false);
    showToast("Webhook created successfully");
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(
      webhooks.map((w) =>
        w.id === id ? { ...w, active: !w.active } : w
      )
    );
    const webhook = webhooks.find((w) => w.id === id);
    showToast(`Webhook ${webhook?.active ? "deactivated" : "activated"}`);
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    setDeletingWebhookId(null);
    showToast("Webhook deleted");
  };

  const toggleWebhookEvent = (event: string) => {
    setWebhookForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  // ---- Notifications State ----
  const [notifications, setNotifications] = useState({
    campaignSent: true,
    importComplete: true,
    newFormSubmission: true,
    weeklySummary: false,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setNotifSaving(false);
    showToast("Notification preferences saved");
  };

  // ---- Danger Zone State ----
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setExporting(false);
    showToast("Data export started. You will receive a download link via email.", "info");
  };

  const handleDeleteOrg = async () => {
    if (deleteConfirmText !== "DELETE") {
      showToast('Please type "DELETE" to confirm', "error");
      return;
    }
    await new Promise((r) => setTimeout(r, 1500));
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
    showToast("Organization deletion scheduled. You will be logged out.", "info");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismissToast} />
      )}

      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="flex gap-6">
        {/* Settings Nav */}
        <div className="hidden md:block w-56 flex-shrink-0">
          <nav className="space-y-1 sticky top-20">
            {settingsNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  activeSection === item.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden w-full">
          <select
            className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm mb-4"
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
          >
            {settingsNav.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Settings Content */}
        <div className="flex-1 max-w-2xl">
          {/* ============ GENERAL ============ */}
          {activeSection === "general" && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={general.orgName}
                    onChange={(e) => setGeneral({ ...general, orgName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm"
                    value={general.timezone}
                    onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                  >
                    {["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney"].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <div className="flex gap-3">
                    {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((fmt) => (
                      <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dateFormat"
                          value={fmt}
                          checked={general.dateFormat === fmt}
                          onChange={() => setGeneral({ ...general, dateFormat: fmt })}
                          className="h-4 w-4 text-indigo-500 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{fmt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">Default From Name</Label>
                  <Input
                    id="fromName"
                    value={general.defaultFromName}
                    onChange={(e) => setGeneral({ ...general, defaultFromName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyTo">Default Reply-to Email</Label>
                  <Input
                    id="replyTo"
                    type="email"
                    value={general.defaultReplyTo}
                    onChange={(e) => setGeneral({ ...general, defaultReplyTo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Company Address (for email footers)</Label>
                  <textarea
                    id="address"
                    className="w-full h-20 rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={general.companyAddress}
                    onChange={(e) => setGeneral({ ...general, companyAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand Colors</Label>
                  <div className="flex gap-4">
                    {([
                      { key: "primaryColor" as const, label: "Primary" },
                      { key: "secondaryColor" as const, label: "Secondary" },
                      { key: "accentColor" as const, label: "Accent" },
                    ]).map((c) => (
                      <div key={c.key} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={general[c.key]}
                          onChange={(e) => setGeneral({ ...general, [c.key]: e.target.value })}
                          className="h-8 w-8 rounded-md border border-gray-200 cursor-pointer p-0"
                        />
                        <div>
                          <p className="text-xs text-gray-500">{c.label}</p>
                          <p className="text-xs font-mono text-gray-700">{general[c.key]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSaveGeneral} disabled={generalSaving}>
                  {generalSaving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ============ BREVO CONNECTION ============ */}
          {activeSection === "brevo" && (
            <Card>
              <CardHeader>
                <CardTitle>Brevo Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={brevo.connected ? "success" : "destructive"}>
                    {brevo.connected ? "Connected" : "Disconnected"}
                  </Badge>
                  {brevo.connected && (
                    <span className="text-sm text-gray-500">Account: {brevo.accountName}</span>
                  )}
                </div>

                {!brevoChanging ? (
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={brevoKeyVisible ? "text" : "password"}
                          value={brevo.apiKey}
                          readOnly
                          className="font-mono pr-10"
                        />
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setBrevoKeyVisible(!brevoKeyVisible)}
                        >
                          {brevoKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button variant="outline" onClick={() => setBrevoChanging(true)}>
                        Change
                      </Button>
                      <Button variant="outline" onClick={handleTestBrevoConnection} disabled={brevoTesting}>
                        {brevoTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Label>Enter New API Key</Label>
                    <Input
                      type="text"
                      placeholder="xkeysib-..."
                      className="font-mono"
                      value={brevoNewKey}
                      onChange={(e) => setBrevoNewKey(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveBrevoKey} disabled={brevoTesting}>
                        {brevoTesting ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</>
                        ) : (
                          "Save & Verify"
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => { setBrevoChanging(false); setBrevoNewKey(""); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Account Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plan</span>
                      <span className="text-gray-900">{brevo.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email Credits</span>
                      <span className="text-gray-900">{brevo.emailCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Sync</span>
                      <span className="text-gray-900">{brevo.lastSync}</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" onClick={handleSyncBrevo} disabled={brevoSyncing}>
                  {brevoSyncing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Syncing...</>
                  ) : (
                    <><RefreshCw className="h-4 w-4 mr-2" />Sync Now</>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ============ SENDERS ============ */}
          {activeSection === "senders" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sender Identities</CardTitle>
                <Button size="sm" onClick={() => setShowAddSender(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Sender
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {senders.map((sender) => (
                    <div
                      key={sender.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{sender.name}</span>
                          {sender.isDefault && (
                            <Badge variant="default" className="text-[10px]">Default</Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{sender.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={sender.status === "verified" ? "success" : sender.status === "pending" ? "warning" : "destructive"}
                          className="text-[10px]"
                        >
                          {sender.status === "verified" ? (
                            <><Check className="h-3 w-3 mr-1" />Verified</>
                          ) : sender.status === "pending" ? (
                            "Pending"
                          ) : (
                            "Failed"
                          )}
                        </Badge>
                        {!sender.isDefault && sender.status === "verified" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultSender(sender.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        {sender.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendVerification(sender.id)}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Resend
                          </Button>
                        )}
                        {!sender.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeletingSenderId(sender.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============ CUSTOM FIELDS ============ */}
          {activeSection === "fields" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Custom Fields</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setFieldForm({ name: "", type: "Text", required: false });
                    setEditingField(null);
                    setShowAddField(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{field.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{field.type}</Badge>
                        {field.required && (
                          <Badge variant="default" className="text-[10px]">Required</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingField(field);
                            setFieldForm({ name: field.name, type: field.type, required: field.required });
                            setShowAddField(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeletingFieldId(field.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="text-center py-6 text-sm text-gray-400">No custom fields yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============ TEAM ============ */}
          {activeSection === "team" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <Button size="sm" onClick={() => setShowInviteMember(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Invite Member
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">{member.name}</span>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={member.status === "active" ? "success" : "warning"}
                          className="text-[10px]"
                        >
                          {member.status}
                        </Badge>
                        <select
                          className="h-8 rounded border border-gray-300 text-xs px-2 focus:ring-2 focus:ring-indigo-500"
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.id, e.target.value)}
                          disabled={member.role === "Owner"}
                        >
                          {["Owner", "Admin", "Editor", "Viewer"].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        {member.status === "pending" && (
                          <Button variant="ghost" size="sm" onClick={() => handleResendInvite(member.id)}>
                            <Send className="h-3 w-3 mr-1" />
                            Resend
                          </Button>
                        )}
                        {member.role !== "Owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setRemovingMemberId(member.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============ API KEYS ============ */}
          {activeSection === "api" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>API Keys</CardTitle>
                <Button size="sm" onClick={() => setShowGenerateKey(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Generate Key
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  API keys allow external applications to access your CRM data.
                </p>
                {apiKeys.length > 0 ? (
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-900">{key.name}</span>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {key.key.slice(0, 8)}...{key.key.slice(-4)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Created {key.createdAt}
                            {key.lastUsed ? ` - Last used ${key.lastUsed}` : " - Never used"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleCopyKey(key.key)}>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setRevokingKeyId(key.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-400">
                    No API keys generated yet
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ============ WEBHOOKS ============ */}
          {activeSection === "webhooks" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Webhooks</CardTitle>
                <Button size="sm" onClick={() => setShowAddWebhook(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Webhook
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Receive real-time notifications when events happen in your account.
                </p>
                {webhooks.length > 0 ? (
                  <div className="space-y-3">
                    {webhooks.map((wh) => (
                      <div
                        key={wh.id}
                        className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 font-mono truncate">{wh.url}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {wh.events.map((ev) => (
                                <Badge key={ev} variant="secondary" className="text-[10px]">{ev}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => handleToggleWebhook(wh.id)}
                              className={cn(
                                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                                wh.active ? "bg-indigo-500" : "bg-gray-200"
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                  wh.active ? "translate-x-[18px]" : "translate-x-[2px]"
                                )}
                              />
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeletingWebhookId(wh.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-400">
                    No webhooks configured yet
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ============ NOTIFICATIONS ============ */}
          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  { key: "campaignSent" as const, label: "Campaign sent", desc: "Get notified when a campaign finishes sending" },
                  { key: "importComplete" as const, label: "Import complete", desc: "Get notified when a contact import finishes" },
                  { key: "newFormSubmission" as const, label: "New form submission", desc: "Get notified about new form submissions" },
                  { key: "weeklySummary" as const, label: "Weekly summary", desc: "Receive a weekly performance summary email" },
                ]).map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notif.label}</p>
                      <p className="text-xs text-gray-500">{notif.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications({
                          ...notifications,
                          [notif.key]: !notifications[notif.key],
                        })
                      }
                      className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        notifications[notif.key] ? "bg-indigo-500" : "bg-gray-200"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          notifications[notif.key] ? "translate-x-[18px]" : "translate-x-[2px]"
                        )}
                      />
                    </button>
                  </div>
                ))}
                <Button onClick={handleSaveNotifications} disabled={notifSaving}>
                  {notifSaving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ============ DANGER ZONE ============ */}
          {activeSection === "danger" && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Export All Data</p>
                    <p className="text-xs text-gray-500">Download all your account data as a ZIP file</p>
                  </div>
                  <Button variant="outline" onClick={handleExportData} disabled={exporting}>
                    {exporting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</>
                    ) : (
                      "Export Data"
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-red-600">Delete Organization</p>
                    <p className="text-xs text-gray-500">Permanently delete this organization and all its data</p>
                  </div>
                  <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                    Delete Organization
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ============ DIALOGS ============ */}

      {/* Add Sender Dialog */}
      <Dialog open={showAddSender} onOpenChange={setShowAddSender}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sender Identity</DialogTitle>
            <DialogDescription>
              Add a new sender email address. A verification email will be sent to confirm ownership.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="senderName">Sender Name</Label>
              <Input
                id="senderName"
                placeholder="e.g., Acme Corp"
                value={newSender.name}
                onChange={(e) => setNewSender({ ...newSender, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Sender Email</Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="hello@example.com"
                value={newSender.email}
                onChange={(e) => setNewSender({ ...newSender, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSender(false)}>Cancel</Button>
            <Button onClick={handleAddSender} disabled={addingSender}>
              {addingSender ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : "Add Sender"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sender Confirmation */}
      <Dialog open={!!deletingSenderId} onOpenChange={() => setDeletingSenderId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Sender</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>{senders.find((s) => s.id === deletingSenderId)?.email}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSenderId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingSenderId && handleDeleteSender(deletingSenderId)}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Field Dialog */}
      <Dialog open={showAddField} onOpenChange={(open) => { if (!open) { setShowAddField(false); setEditingField(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingField ? "Edit Field" : "Add Custom Field"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                placeholder="e.g., Lifetime Value"
                value={fieldForm.name}
                onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <select
                id="fieldType"
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm"
                value={fieldForm.type}
                onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}
              >
                {["Text", "Number", "Date", "Boolean", "Dropdown"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fieldRequired"
                className="h-4 w-4 rounded border-gray-300 text-indigo-500"
                checked={fieldForm.required}
                onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
              />
              <Label htmlFor="fieldRequired" className="font-normal">Required field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddField(false); setEditingField(null); }}>Cancel</Button>
            <Button onClick={handleSaveField} disabled={fieldSaving}>
              {fieldSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : editingField ? "Update Field" : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Field Confirmation */}
      <Dialog open={!!deletingFieldId} onOpenChange={() => setDeletingFieldId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Field</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the field{" "}
              <strong>&quot;{fields.find((f) => f.id === deletingFieldId)?.name}&quot;</strong>?
              This will remove it from all contacts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingFieldId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingFieldId && handleDeleteField(deletingFieldId)}>
              Delete Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="colleague@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteRole">Role</Label>
              <select
                id="inviteRole"
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              >
                {["Admin", "Editor", "Viewer"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="bg-gray-50 rounded-md p-3 mt-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Role Permissions:</p>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  <li><strong>Admin:</strong> Manage settings, campaigns, contacts, and team</li>
                  <li><strong>Editor:</strong> Create campaigns, manage contacts, view reports</li>
                  <li><strong>Viewer:</strong> View reports only</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteMember(false)}>Cancel</Button>
            <Button onClick={handleInviteMember} disabled={inviting}>
              {inviting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <Dialog open={!!removingMemberId} onOpenChange={() => setRemovingMemberId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>{team.find((m) => m.id === removingMemberId)?.name}</strong>{" "}
              ({team.find((m) => m.id === removingMemberId)?.email}) from the team?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemovingMemberId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => removingMemberId && handleRemoveMember(removingMemberId)}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate API Key Dialog */}
      <Dialog open={showGenerateKey} onOpenChange={(open) => { if (!open) handleCloseGenerateKey(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{generatedKey ? "API Key Generated" : "Generate API Key"}</DialogTitle>
            {!generatedKey && (
              <DialogDescription>
                Create a new API key for external integrations.
              </DialogDescription>
            )}
          </DialogHeader>
          {!generatedKey ? (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production API"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseGenerateKey}>Cancel</Button>
                <Button onClick={handleGenerateKey} disabled={generatingKey}>
                  {generatingKey ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : "Generate Key"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-3 py-2">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 font-medium">
                    Make sure to copy your API key now. You won&apos;t be able to see it again!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input value={generatedKey} readOnly className="font-mono text-xs" />
                  <Button variant="outline" onClick={() => handleCopyKey(generatedKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseGenerateKey}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke API Key Confirmation */}
      <Dialog open={!!revokingKeyId} onOpenChange={() => setRevokingKeyId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the key{" "}
              <strong>&quot;{apiKeys.find((k) => k.id === revokingKeyId)?.name}&quot;</strong>?
              Any applications using this key will stop working immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokingKeyId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => revokingKeyId && handleRevokeKey(revokingKeyId)}>
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={showAddWebhook} onOpenChange={setShowAddWebhook}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>
              Configure a URL to receive event notifications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Endpoint URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://example.com/webhooks"
                value={webhookForm.url}
                onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="space-y-2">
                {webhookEventOptions.map((event) => (
                  <label key={event} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                      checked={webhookForm.events.includes(event)}
                      onChange={() => toggleWebhookEvent(event)}
                    />
                    <span className="text-sm text-gray-700 font-mono">{event}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWebhook(false)}>Cancel</Button>
            <Button onClick={handleAddWebhook} disabled={addingWebhook}>
              {addingWebhook ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Confirmation */}
      <Dialog open={!!deletingWebhookId} onOpenChange={() => setDeletingWebhookId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this webhook? It will stop receiving events immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingWebhookId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingWebhookId && handleDeleteWebhook(deletingWebhookId)}>
              Delete Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Organization</DialogTitle>
            <DialogDescription>
              This action is <strong>permanent and irreversible</strong>. All data including contacts,
              campaigns, templates, and team members will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-800">
                Type <strong>DELETE</strong> below to confirm deletion:
              </p>
            </div>
            <Input
              placeholder='Type "DELETE" to confirm'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="border-red-300 focus:ring-red-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrg}
              disabled={deleteConfirmText !== "DELETE"}
            >
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
