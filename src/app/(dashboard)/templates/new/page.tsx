"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewTemplatePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Template</h1>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Template Name</Label>
          <Input id="template-name" placeholder="e.g., Monthly Newsletter" />
        </div>
        <div className="space-y-2">
          <Label>Template Content</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center min-h-[400px] flex items-center justify-center">
            <div>
              <p className="text-lg font-medium text-gray-500">Drag & Drop Email Builder</p>
              <p className="text-sm text-gray-400 mt-2">
                The full visual email builder with blocks panel, canvas, and properties panel
                <br />
                will be implemented in Phase 2
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-400">For now, you can use the HTML editor:</p>
                <textarea
                  className="w-full max-w-lg mx-auto h-48 rounded-lg border border-gray-300 p-3 text-sm font-mono"
                  placeholder="<html>&#10;  <body>&#10;    <h1>Your email content here</h1>&#10;  </body>&#10;</html>"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button>Save Template</Button>
          <Button variant="outline">Preview</Button>
        </div>
      </div>
    </div>
  );
}
