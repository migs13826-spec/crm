"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  { id: "setup", label: "Setup" },
  { id: "to", label: "To" },
  { id: "from", label: "From" },
  { id: "subject", label: "Subject" },
  { id: "content", label: "Content" },
  { id: "review", label: "Review" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState({
    name: "",
    type: "regular",
    recipientType: "lists",
    selectedLists: [] as string[],
    senderName: "My Company",
    senderEmail: "hello@example.com",
    replyTo: "",
    subject: "",
    previewText: "",
    contentType: "",
    htmlContent: "",
  });

  const canProceed = () => {
    switch (currentStep) {
      case 0: return campaign.name.length > 0;
      case 1: return true;
      case 2: return campaign.senderName.length > 0 && campaign.senderEmail.length > 0;
      case 3: return campaign.subject.length > 0;
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={saving || !campaign.name} onClick={async () => {
            setSaving(true);
            try {
              await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(campaign),
              });
              router.push("/campaigns");
            } catch (e) { console.error(e); } finally { setSaving(false); }
          }}>
            <Save className="h-3 w-3 mr-1" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Step Sidebar */}
        <div className="hidden md:block w-60 bg-gray-50 border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => i <= currentStep && setCurrentStep(i)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  i === currentStep && "bg-indigo-50 text-indigo-700",
                  i < currentStep && "text-gray-700 hover:bg-gray-100",
                  i > currentStep && "text-gray-400 cursor-not-allowed"
                )}
                disabled={i > currentStep}
              >
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                    i === currentStep && "bg-indigo-500 text-white",
                    i < currentStep && "bg-green-500 text-white",
                    i > currentStep && "bg-gray-200 text-gray-400"
                  )}
                >
                  {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                {step.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Step Content */}
        <div className="flex-1 p-6 md:p-8 max-w-3xl">
          {/* Step 1: Setup */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Campaign Setup</h2>
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Summer Sale - June 2025"
                  value={campaign.name}
                  onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                />
                <p className="text-xs text-gray-400">Internal name, not shown to recipients</p>
              </div>
              <div className="space-y-3">
                <Label>Campaign Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "regular", label: "Regular", desc: "Standard email campaign" },
                    { id: "ab_test", label: "A/B Test", desc: "Test variations (Phase 2)" },
                    { id: "automated", label: "Automated", desc: "Trigger-based" },
                  ].map((type) => (
                    <Card
                      key={type.id}
                      className={cn(
                        "cursor-pointer hover:shadow-md transition-all",
                        campaign.type === type.id && "ring-2 ring-indigo-500",
                        type.id === "ab_test" && "opacity-50"
                      )}
                      onClick={() => type.id !== "ab_test" && setCampaign({ ...campaign, type: type.id })}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="text-sm font-semibold text-gray-900">{type.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Recipients */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Who are you sending to?</h2>
              <div className="space-y-3">
                {[
                  { id: "all", label: "Entire audience (12,847 contacts)" },
                  { id: "lists", label: "Specific lists" },
                  { id: "segment", label: "Segment" },
                  { id: "tags", label: "Tags" },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="recipientType"
                      value={opt.id}
                      checked={campaign.recipientType === opt.id}
                      onChange={() => setCampaign({ ...campaign, recipientType: opt.id })}
                      className="h-4 w-4 text-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
              {campaign.recipientType === "lists" && (
                <div className="ml-7 space-y-2">
                  {["Newsletter Subscribers (8,234)", "VIP Customers (456)", "Product Updates (3,102)"].map((list) => (
                    <label key={list} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-500" />
                      <span className="text-sm text-gray-700">{list}</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="text-gray-600">Estimated recipients: <span className="font-semibold text-gray-900">8,234</span></p>
              </div>
            </div>
          )}

          {/* Step 3: From */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Sender Information</h2>
              <div className="space-y-2">
                <Label htmlFor="sender-name">Sender Name</Label>
                <Input
                  id="sender-name"
                  value={campaign.senderName}
                  onChange={(e) => setCampaign({ ...campaign, senderName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-email">Sender Email</Label>
                <select className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm">
                  <option>hello@example.com</option>
                  <option>marketing@example.com</option>
                  <option>+ Add new sender</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply-to">Reply-to Email (optional)</Label>
                <Input
                  id="reply-to"
                  type="email"
                  placeholder="Same as sender email"
                  value={campaign.replyTo}
                  onChange={(e) => setCampaign({ ...campaign, replyTo: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 4: Subject */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Subject Line</h2>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Enter your email subject line"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{campaign.subject.length}/150 characters</p>
                  <button className="text-xs text-indigo-500 hover:underline">Add Personalization</button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preview">Preview Text (optional)</Label>
                <Input
                  id="preview"
                  placeholder="Brief summary shown in inbox..."
                  value={campaign.previewText}
                  onChange={(e) => setCampaign({ ...campaign, previewText: e.target.value })}
                />
                <p className="text-xs text-gray-400">{campaign.previewText.length}/200 characters</p>
              </div>

              {/* Inbox Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Inbox Preview</h3>
                <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{campaign.senderName || "Sender"}</p>
                        <p className="text-sm text-gray-900 truncate">{campaign.subject || "Subject line..."}</p>
                        <p className="text-sm text-gray-500 truncate">{campaign.previewText || "Preview text..."}</p>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">10:30 AM</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <div className="flex items-start justify-between opacity-40">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Other Sender</p>
                          <p className="text-sm text-gray-500">Another email subject...</p>
                        </div>
                        <span className="text-xs text-gray-400 ml-2">9:15 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Content */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Design Your Email</h2>
              <p className="text-sm text-gray-500">Choose how to create your email:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "dragdrop", label: "Drag & Drop Editor", desc: "Build with visual blocks", icon: "&#127912;" },
                  { id: "templates", label: "My Templates", desc: "Choose from saved templates", icon: "&#128203;" },
                  { id: "html", label: "HTML Editor", desc: "Paste or code your own HTML", icon: "</>" },
                ].map((opt) => (
                  <Card
                    key={opt.id}
                    className={cn(
                      "cursor-pointer hover:shadow-md transition-all",
                      campaign.contentType === opt.id && "ring-2 ring-indigo-500"
                    )}
                    onClick={() => setCampaign({ ...campaign, contentType: opt.id })}
                  >
                    <CardContent className="p-6 text-center space-y-2">
                      <div className="text-2xl" dangerouslySetInnerHTML={{ __html: opt.icon }} />
                      <h3 className="text-sm font-semibold text-gray-900">{opt.label}</h3>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {campaign.contentType === "html" && (
                <div className="space-y-2">
                  <Label>HTML Content</Label>
                  <textarea
                    className="w-full h-64 rounded-lg border border-gray-300 p-3 text-sm font-mono"
                    placeholder="<html>...</html>"
                    value={campaign.htmlContent}
                    onChange={(e) => setCampaign({ ...campaign, htmlContent: e.target.value })}
                  />
                </div>
              )}
              {campaign.contentType === "dragdrop" && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                  <p className="text-sm text-gray-500">Drag & drop email builder will be available here</p>
                  <p className="text-xs text-gray-400 mt-1">Full builder coming in Phase 2</p>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Review Your Campaign</h2>
              <Card>
                <CardContent className="p-0 divide-y divide-gray-100">
                  {[
                    { label: "Setup", value: campaign.name, step: 0 },
                    { label: "Recipients", value: "Newsletter (8,234 contacts)", step: 1 },
                    { label: "Sender", value: `${campaign.senderName} <${campaign.senderEmail}>`, step: 2 },
                    { label: "Subject", value: campaign.subject, step: 3 },
                    { label: "Content", value: campaign.contentType ? `Using ${campaign.contentType}` : "Not set", step: 4 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500 truncate max-w-sm">{item.value}</p>
                        </div>
                      </div>
                      <button
                        className="text-xs text-indigo-500 hover:underline"
                        onClick={() => setCurrentStep(item.step)}
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Send Test */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Send Test Email</h3>
                <div className="flex gap-2">
                  <Input placeholder="test@example.com" className="max-w-sm" />
                  <Button variant="outline">Send Test</Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Enter up to 5 comma-separated emails</p>
              </div>

              {/* Send Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Delivery Options</h3>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="delivery" value="now" defaultChecked className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm text-gray-700">Send now</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="delivery" value="schedule" className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm text-gray-700">Schedule for later</span>
                </label>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" size="lg" disabled={saving} onClick={async () => {
                  setSaving(true);
                  try {
                    await fetch("/api/campaigns", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...campaign, status: "sent", sentAt: new Date().toISOString(), estimatedRecipients: 8234, openRate: null, clickRate: null }),
                    });
                    router.push("/campaigns");
                  } catch (e) { console.error(e); } finally { setSaving(false); }
                }}>
                  {saving ? "Sending..." : "Send Campaign"}
                </Button>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            {currentStep < steps.length - 1 && (
              <Button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={!canProceed()}
              >
                Next Step
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
