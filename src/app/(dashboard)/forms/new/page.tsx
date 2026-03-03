"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function NewFormPage() {
  const router = useRouter();
  const { addForm } = useAppStore();
  const [name, setName] = useState("");
  const [type, setType] = useState<"embedded" | "popup" | "slide_in" | "top_bar">("embedded");
  const [successMessage, setSuccessMessage] = useState("Thanks for subscribing!");
  const [doubleOptin, setDoubleOptin] = useState(false);

  const handleCreate = () => {
    if (!name) return;
    addForm({
      name, type, status: "active",
      fields: [{ name: "email", type: "email", required: true }, { name: "firstName", type: "text", required: false }],
      successMessage, doubleOptin,
    });
    router.push("/forms");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/forms"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Form</h1>
        </div>
        <Button onClick={handleCreate} disabled={!name}>Create Form</Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2"><Label>Form Name *</Label><Input placeholder="e.g., Newsletter Signup" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-3">
          <Label>Form Type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([["embedded", "Embedded", "Inline form"], ["popup", "Popup", "Modal overlay"], ["slide_in", "Slide-in", "Bottom corner"], ["top_bar", "Top Bar", "Fixed banner"]] as const).map(([id, label, desc]) => (
              <Card key={id} className={cn("cursor-pointer hover:shadow-md transition-all", type === id && "ring-2 ring-indigo-500")} onClick={() => setType(id)}>
                <CardContent className="p-4 text-center"><h3 className="text-sm font-semibold text-gray-900">{label}</h3><p className="text-xs text-gray-500 mt-1">{desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-2"><Label>Success Message</Label><Input value={successMessage} onChange={(e) => setSuccessMessage(e.target.value)} /></div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="double-optin" className="h-4 w-4 rounded border-gray-300" checked={doubleOptin} onChange={(e) => setDoubleOptin(e.target.checked)} />
          <Label htmlFor="double-optin" className="font-normal">Require email confirmation (double opt-in)</Label>
        </div>
      </div>
    </div>
  );
}
