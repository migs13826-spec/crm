"use client";

import Link from "next/link";
import { Plus, MoreHorizontal, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const myTemplates = [
  { id: "1", name: "Monthly Newsletter", category: "Newsletter", modified: "Jun 10, 2025", thumbnail: null },
  { id: "2", name: "Promotional Sale", category: "Promotional", modified: "Jun 8, 2025", thumbnail: null },
  { id: "3", name: "Welcome Email", category: "Welcome", modified: "Jun 5, 2025", thumbnail: null },
  { id: "4", name: "Product Announcement", category: "Product", modified: "Jun 1, 2025", thumbnail: null },
];

const prebuiltTemplates = [
  { id: "p1", name: "Classic Newsletter", category: "Newsletter" },
  { id: "p2", name: "Modern Digest", category: "Newsletter" },
  { id: "p3", name: "Sale Announcement", category: "Promotional" },
  { id: "p4", name: "Flash Sale", category: "Promotional" },
  { id: "p5", name: "Welcome Series", category: "Welcome" },
  { id: "p6", name: "Product Launch", category: "Product" },
  { id: "p7", name: "Event Invitation", category: "Event" },
  { id: "p8", name: "Order Confirmation", category: "E-commerce" },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <Link href="/templates/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Create Template
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="my">
        <TabsList>
          <TabsTrigger value="my">My Templates ({myTemplates.length})</TabsTrigger>
          <TabsTrigger value="prebuilt">Pre-built ({prebuiltTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {myTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-48 bg-gray-100 relative flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">Preview</Button>
                      <Button size="sm">Use Template</Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{template.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                        <span className="text-xs text-gray-400">{template.modified}</span>
                      </div>
                    </div>
                    <button className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prebuilt">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {prebuiltTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-50 relative flex items-center justify-center">
                  <FileText className="h-12 w-12 text-indigo-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">Preview</Button>
                      <Button size="sm">Use Template</Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900">{template.name}</h3>
                  <Badge variant="secondary" className="text-[10px] mt-1">{template.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
