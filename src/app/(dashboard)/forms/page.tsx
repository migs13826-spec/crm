"use client";

import Link from "next/link";
import { Plus, MoreHorizontal, ClipboardList, Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const forms = [
  { id: "1", name: "Newsletter Signup", type: "embedded", status: "active", submissions: 1234 },
  { id: "2", name: "Exit Intent Popup", type: "popup", status: "active", submissions: 567 },
  { id: "3", name: "Footer Signup", type: "embedded", status: "inactive", submissions: 89 },
  { id: "4", name: "Welcome Offer", type: "slide_in", status: "active", submissions: 345 },
];

const typeLabels: Record<string, string> = {
  embedded: "Embedded",
  popup: "Popup",
  slide_in: "Slide-in",
  top_bar: "Top Bar",
  landing_page: "Landing Page",
};

export default function FormsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
        <Link href="/forms/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Create Form
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {forms.map((form) => (
          <Card key={form.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{form.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {typeLabels[form.type]}
                    </Badge>
                    <Badge
                      variant={form.status === "active" ? "success" : "secondary"}
                      className="text-[10px]"
                    >
                      {form.status}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {form.submissions.toLocaleString()} submissions
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/forms/${form.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Code className="h-3 w-3 mr-1" />
                  Embed Code
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <button className="p-1 rounded hover:bg-gray-100">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
