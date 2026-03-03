"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, ClipboardList, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

const typeLabels: Record<string, string> = {
  embedded: "Embedded", popup: "Popup", slide_in: "Slide-in", top_bar: "Top Bar",
};

export default function FormsPage() {
  const { forms, updateForm, deleteForm } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
        <Link href="/forms/new"><Button><Plus className="h-4 w-4 mr-1" />Create Form</Button></Link>
      </div>

      {forms.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No forms yet</h3>
          <p className="text-sm text-gray-500 mt-1">Create signup forms to grow your audience</p>
          <Link href="/forms/new"><Button className="mt-4"><Plus className="h-4 w-4 mr-1" />Create Form</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center"><ClipboardList className="h-5 w-5 text-purple-600" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{form.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px]">{typeLabels[form.type] || form.type}</Badge>
                      <Badge variant={form.status === "active" ? "success" : "secondary"} className="text-[10px]">{form.status}</Badge>
                      <span className="text-xs text-gray-400">{form.submissions} submissions</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateForm(form.id, { status: form.status === "active" ? "inactive" : "active" })}>
                    {form.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <button className="p-1 rounded hover:bg-gray-100" onClick={() => deleteForm(form.id)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
