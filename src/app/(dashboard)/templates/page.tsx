"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, FileText, Trash2, Copy, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { EmailPreview } from "@/components/email-preview";

export default function TemplatesPage() {
  const { templates, deleteTemplate, duplicateTemplate } = useAppStore();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<typeof templates[0] | null>(null);

  if (previewTemplate) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <EmailPreview html={previewTemplate.htmlContent} onClose={() => setPreviewTemplate(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <Link href="/templates/new"><Button><Plus className="h-4 w-4 mr-1" />Create Template</Button></Link>
      </div>

      {templates.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No templates yet</h3>
          <p className="text-sm text-gray-500 mt-1">Create reusable email templates for your campaigns</p>
          <Link href="/templates/new"><Button className="mt-4"><Plus className="h-4 w-4 mr-1" />Create Template</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="group hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-48 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                {template.htmlContent ? (
                  <iframe srcDoc={template.htmlContent} className="w-full h-full border-0 pointer-events-none scale-75 origin-top" title={template.name} />
                ) : (
                  <FileText className="h-12 w-12 text-gray-300" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setPreviewTemplate(template)}><Eye className="h-3.5 w-3.5 mr-1" />Preview</Button>
                    <Link href={`/templates/new?edit=${template.id}`}><Button size="sm">Edit</Button></Link>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{template.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                      <span className="text-xs text-gray-400">{new Date(template.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-1 rounded hover:bg-gray-100" onClick={() => setMenuOpen(menuOpen === template.id ? null : template.id)}>
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                    {menuOpen === template.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-full mt-1 z-50 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => { duplicateTemplate(template.id); setMenuOpen(null); }}><Copy className="h-3.5 w-3.5" />Duplicate</button>
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => { deleteTemplate(template.id); setMenuOpen(null); }}><Trash2 className="h-3.5 w-3.5" />Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
