"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="flex gap-6">
        {/* Settings Nav */}
        <div className="hidden md:block w-56 flex-shrink-0">
          <nav className="space-y-1">
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

        {/* Settings Content */}
        <div className="flex-1 max-w-2xl">
          {activeSection === "general" && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input defaultValue="Acme Corp" />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm">
                    <option>UTC</option>
                    <option>America/New_York</option>
                    <option>America/Los_Angeles</option>
                    <option>Europe/London</option>
                    <option>Asia/Tokyo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <div className="flex gap-3">
                    {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((fmt) => (
                      <label key={fmt} className="flex items-center gap-2">
                        <input type="radio" name="dateFormat" value={fmt} defaultChecked={fmt === "YYYY-MM-DD"} className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm text-gray-700">{fmt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Default From Name</Label>
                  <Input defaultValue="Acme Corp" />
                </div>
                <div className="space-y-2">
                  <Label>Default Reply-to Email</Label>
                  <Input type="email" defaultValue="hello@acme.com" />
                </div>
                <div className="space-y-2">
                  <Label>Company Address (for email footers)</Label>
                  <textarea className="w-full h-20 rounded-lg border border-gray-300 p-3 text-sm" defaultValue="123 Main St, Suite 100, San Francisco, CA 94105" />
                </div>
                <div className="space-y-2">
                  <Label>Brand Colors</Label>
                  <div className="flex gap-4">
                    {[
                      { label: "Primary", color: "#6366F1" },
                      { label: "Secondary", color: "#10B981" },
                      { label: "Accent", color: "#F59E0B" },
                    ].map((c) => (
                      <div key={c.label} className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md border border-gray-200" style={{ backgroundColor: c.color }} />
                        <div>
                          <p className="text-xs text-gray-500">{c.label}</p>
                          <p className="text-xs font-mono text-gray-700">{c.color}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "brevo" && (
            <Card>
              <CardHeader>
                <CardTitle>Brevo Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="success">Connected</Badge>
                  <span className="text-sm text-gray-500">Account: Acme Corp</span>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input type="password" defaultValue="xkeysib-xxxxxxxxxxxxxxxxxxxx-xxxx" className="font-mono" readOnly />
                    <Button variant="outline">Change</Button>
                    <Button variant="outline">Test Connection</Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Account Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plan</span>
                      <span className="text-gray-900">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email Credits</span>
                      <span className="text-gray-900">300/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Sync</span>
                      <span className="text-gray-900">2 minutes ago</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline">Sync Now</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "senders" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sender Identities</CardTitle>
                <Button size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Add Sender
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Acme Corp", email: "hello@acme.com", status: "verified", isDefault: true },
                    { name: "Marketing Team", email: "marketing@acme.com", status: "verified", isDefault: false },
                    { name: "Support", email: "support@acme.com", status: "pending", isDefault: false },
                  ].map((sender) => (
                    <div key={sender.email} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{sender.name}</span>
                          {sender.isDefault && <Badge variant="default" className="text-[10px]">Default</Badge>}
                        </div>
                        <span className="text-sm text-gray-500">{sender.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={sender.status === "verified" ? "success" : "warning"} className="text-[10px]">
                          {sender.status === "verified" ? (
                            <><Check className="h-3 w-3 mr-1" /> Verified</>
                          ) : (
                            "Pending"
                          )}
                        </Badge>
                        <Button variant="ghost" size="sm">Set Default</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "team" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <Button size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  Invite Member
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Sarah Lee", email: "sarah@acme.com", role: "Owner", status: "active" },
                    { name: "John Smith", email: "john@acme.com", role: "Admin", status: "active" },
                    { name: "Jane Doe", email: "jane@acme.com", role: "Editor", status: "pending" },
                  ].map((member) => (
                    <div key={member.email} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{member.name}</span>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={member.status === "active" ? "success" : "warning"} className="text-[10px]">
                          {member.status}
                        </Badge>
                        <select className="h-8 rounded border border-gray-300 text-xs px-2">
                          {["Owner", "Admin", "Editor", "Viewer"].map((r) => (
                            <option key={r} selected={r === member.role}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "fields" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Custom Fields</CardTitle>
                <Button size="sm">+ Add Field</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: "Lifetime Value", type: "Number" },
                    { name: "Plan", type: "Text" },
                    { name: "Birthday", type: "Date" },
                    { name: "Is Premium", type: "Boolean" },
                  ].map((field) => (
                    <div key={field.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{field.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{field.type}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "api" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>API Keys</CardTitle>
                <Button size="sm">Generate Key</Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  API keys allow external applications to access your CRM data.
                </p>
                <div className="text-center py-8 text-sm text-gray-400">
                  No API keys generated yet
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "webhooks" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Webhooks</CardTitle>
                <Button size="sm">Add Webhook</Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Configure webhooks to receive real-time notifications about events in your account.
                </p>
                <div className="text-center py-8 text-sm text-gray-400">
                  No webhooks configured yet
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Campaign sent", desc: "Get notified when a campaign finishes sending" },
                  { label: "Import complete", desc: "Get notified when a contact import finishes" },
                  { label: "New form submission", desc: "Get notified about new form submissions" },
                  { label: "Weekly summary", desc: "Receive a weekly performance summary email" },
                ].map((notif) => (
                  <div key={notif.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notif.label}</p>
                      <p className="text-xs text-gray-500">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                    </label>
                  </div>
                ))}
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          )}

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
                  <Button variant="outline">Export Data</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-red-600">Delete Organization</p>
                    <p className="text-xs text-gray-500">Permanently delete this organization and all its data</p>
                  </div>
                  <Button variant="destructive">Delete Organization</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
