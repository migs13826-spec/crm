"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { EmailEditor } from "@/components/email-editor";
import { EmailPreview } from "@/components/email-preview";

export default function NewTemplatePage() {
  const router = useRouter();
  const { addTemplate } = useAppStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Newsletter");
  const [htmlContent, setHtmlContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    if (!name) return;
    addTemplate({ name, category, htmlContent, isPrebuilt: false });
    router.push("/templates");
  };

  if (showPreview) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <EmailPreview html={htmlContent} onClose={() => setShowPreview(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/templates"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Template</h1>
        </div>
        <div className="flex gap-2">
          {htmlContent && <Button variant="outline" onClick={() => setShowPreview(true)}><Eye className="h-4 w-4 mr-1" />Preview</Button>}
          <Button onClick={handleSave} disabled={!name}>Save Template</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Template Name *</Label>
            <Input placeholder="e.g., Monthly Newsletter" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <select className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              {["Newsletter", "Promotional", "Welcome", "Product", "Event", "E-commerce", "Transactional", "Minimal"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Template Content</Label>
          <EmailEditor content={htmlContent} onChange={setHtmlContent} placeholder="Design your email template..." />
        </div>
      </div>
    </div>
  );
}
