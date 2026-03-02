"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NewFormPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/forms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Form</h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Form Name</Label>
          <Input placeholder="e.g., Newsletter Signup" />
        </div>

        <div className="space-y-3">
          <Label>Form Type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "embedded", label: "Embedded", desc: "Inline form for website" },
              { id: "popup", label: "Popup", desc: "Modal overlay" },
              { id: "slide_in", label: "Slide-in", desc: "Bottom corner" },
              { id: "top_bar", label: "Top Bar", desc: "Fixed banner" },
            ].map((type) => (
              <Card key={type.id} className="cursor-pointer hover:shadow-md transition-all hover:ring-2 hover:ring-indigo-500">
                <CardContent className="p-4 text-center">
                  <h3 className="text-sm font-semibold text-gray-900">{type.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Form Fields</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700 flex-1">Email (required)</span>
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700 flex-1">First Name</span>
            </div>
            <Button variant="outline" size="sm">+ Add Field</Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Subscribe to List</Label>
          <select className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm">
            <option>Newsletter Subscribers</option>
            <option>VIP Customers</option>
            <option>Product Updates</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Success Message</Label>
          <Input placeholder="Thanks for subscribing!" />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="double-optin" className="h-4 w-4 rounded border-gray-300" />
          <Label htmlFor="double-optin" className="font-normal">Require email confirmation (double opt-in)</Label>
        </div>

        <div className="flex gap-3">
          <Button>Create Form</Button>
          <Button variant="outline">Preview</Button>
        </div>
      </div>
    </div>
  );
}
