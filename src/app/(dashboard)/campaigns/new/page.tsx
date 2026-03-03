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
import { useAppStore } from "@/lib/store";
import { EmailEditor } from "@/components/email-editor";
import { EmailPreview } from "@/components/email-preview";

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
    type: "regular" as const,
    recipientType: "all",
    selectedLists: [] as string[],
    senderName: "",
    senderEmail: "",
    replyTo: "",
    subject: "",
    previewText: "",
    htmlContent: "",
  });

  const canProceed = () => {
    switch (currentStep) {
      case 0: return campaign.name.length > 0;
      case 1: return true;
      case 2: return campaign.senderName.length > 0;
      case 3: return campaign.subject.length > 0;
      case 4: return campaign.htmlContent.length > 0;
      default: return true;
    }
  };

  const handleSaveDraft = () => {
    addCampaign({
      ...campaign,
      type: campaign.type as "regular",
      status: "draft",
      estimatedRecipients: 0,
    });
    router.push("/campaigns");
  };

  const handleSend = () => {
    addCampaign({
      ...campaign,
      type: campaign.type as "regular",
      status: "sent",
      sentAt: new Date().toISOString(),
      openRate: 0,
      clickRate: 0,
      unsubRate: 0,
      estimatedRecipients: 0,
    });
    router.push("/campaigns");
  };

  if (showPreview) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <EmailPreview
          html={campaign.htmlContent}
          subject={campaign.subject}
          senderName={campaign.senderName}
          previewText={campaign.previewText}
          onClose={() => setShowPreview(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <Link href="/campaigns"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
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
        <div className="hidden md:block w-60 bg-gray-50 border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {steps.map((step, i) => (
              <button key={step.id} onClick={() => i <= currentStep && setCurrentStep(i)}
                className={cn("flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors", i === currentStep && "bg-indigo-50 text-indigo-700", i < currentStep && "text-gray-700 hover:bg-gray-100", i > currentStep && "text-gray-400 cursor-not-allowed")} disabled={i > currentStep}>
                <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-xs", i === currentStep && "bg-indigo-500 text-white", i < currentStep && "bg-green-500 text-white", i > currentStep && "bg-gray-200 text-gray-400")}>
                  {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                {step.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-6 md:p-8 max-w-3xl">
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Campaign Setup</h2>
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input placeholder="e.g., Summer Sale - June 2025" value={campaign.name} onChange={(e) => setCampaign({ ...campaign, name: e.target.value })} />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Who are you sending to?</h2>
              <div className="space-y-3">
                {[{ id: "all", label: "Entire audience" }, { id: "lists", label: "Specific lists" }].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="recipientType" value={opt.id} checked={campaign.recipientType === opt.id} onChange={() => setCampaign({ ...campaign, recipientType: opt.id })} className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
              {campaign.recipientType === "lists" && lists.length > 0 && (
                <div className="ml-7 space-y-2">{lists.map((list) => (
                  <label key={list.id} className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-500" /><span className="text-sm text-gray-700">{list.name} ({list.count})</span></label>
                ))}</div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Sender Information</h2>
              <div className="space-y-2"><Label>Sender Name *</Label><Input value={campaign.senderName} onChange={(e) => setCampaign({ ...campaign, senderName: e.target.value })} placeholder="Your Company" /></div>
              <div className="space-y-2"><Label>Sender Email</Label><Input type="email" value={campaign.senderEmail} onChange={(e) => setCampaign({ ...campaign, senderEmail: e.target.value })} placeholder="hello@example.com" /></div>
              <div className="space-y-2"><Label>Reply-to (optional)</Label><Input type="email" value={campaign.replyTo} onChange={(e) => setCampaign({ ...campaign, replyTo: e.target.value })} placeholder="Same as sender" /></div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Subject Line</h2>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input placeholder="Enter your email subject line" value={campaign.subject} onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })} />
                <p className="text-xs text-gray-400">{campaign.subject.length}/150 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Preview Text (optional)</Label>
                <Input placeholder="Brief summary shown in inbox..." value={campaign.previewText} onChange={(e) => setCampaign({ ...campaign, previewText: e.target.value })} />
              </div>
              {/* Inbox Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Inbox Preview</h3>
                <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-sm">
                  <p className="text-sm font-semibold text-gray-900">{campaign.senderName || "Sender"}</p>
                  <p className="text-sm text-gray-900 truncate">{campaign.subject || "Subject line..."}</p>
                  <p className="text-sm text-gray-500 truncate">{campaign.previewText || "Preview text..."}</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Email Content</h2>
                {campaign.htmlContent && (
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4 mr-1" />Preview
                  </Button>
                )}
              </div>
              <EmailEditor content={campaign.htmlContent} onChange={(html) => setCampaign({ ...campaign, htmlContent: html })} placeholder="Write your email content here..." />
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Review Your Campaign</h2>
              <Card><CardContent className="p-0 divide-y divide-gray-100">
                {[
                  { label: "Setup", value: campaign.name, step: 0 },
                  { label: "Recipients", value: campaign.recipientType === "all" ? "Entire audience" : "Specific lists", step: 1 },
                  { label: "Sender", value: campaign.senderName ? `${campaign.senderName} <${campaign.senderEmail}>` : "Not set", step: 2 },
                  { label: "Subject", value: campaign.subject || "Not set", step: 3 },
                  { label: "Content", value: campaign.htmlContent ? "Content ready" : "Not set", step: 4 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${item.value && item.value !== "Not set" ? "bg-green-100" : "bg-gray-100"}`}>
                        {item.value && item.value !== "Not set" ? <Check className="h-3 w-3 text-green-600" /> : <span className="text-xs text-gray-400">{item.step + 1}</span>}
                      </div>
                      <div><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-500 truncate max-w-sm">{item.value}</p></div>
                    </div>
                    <button className="text-xs text-indigo-500 hover:underline" onClick={() => setCurrentStep(item.step)}>Edit</button>
                  </div>
                ))}
              </CardContent></Card>
              {campaign.htmlContent && (
                <Button variant="outline" onClick={() => setShowPreview(true)} className="w-full"><Eye className="h-4 w-4 mr-1" />Preview Email</Button>
              )}
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

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
            <span className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</span>
            {currentStep < steps.length - 1 && <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
