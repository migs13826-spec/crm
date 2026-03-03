"use client";

import { useState } from "react";
import { Monitor, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmailPreviewProps {
  html: string;
  subject?: string;
  senderName?: string;
  previewText?: string;
  onClose?: () => void;
}

export function EmailPreview({
  html,
  subject,
  senderName,
  previewText,
  onClose,
}: EmailPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; }
        img { max-width: 100%; height: auto; }
        a { color: #6366F1; }
      </style>
    </head>
    <body>${html || "<p style='color: #999; text-align: center; padding: 40px;'>No content yet</p>"}</body>
    </html>
  `;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Preview</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setDevice("desktop")}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors",
                device === "desktop"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-200",
                device === "mobile"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Mobile
            </button>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Subject preview */}
      {(subject || senderName) && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="max-w-lg mx-auto">
            <p className="text-sm font-semibold text-gray-900">
              {senderName || "Sender"}
            </p>
            <p className="text-sm text-gray-800">{subject || "Subject line"}</p>
            {previewText && (
              <p className="text-sm text-gray-500 truncate">{previewText}</p>
            )}
          </div>
        </div>
      )}

      {/* Email content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div
          className={cn(
            "mx-auto bg-white shadow-sm rounded-lg overflow-hidden transition-all",
            device === "desktop" ? "max-w-[600px]" : "max-w-[375px]"
          )}
        >
          <iframe
            srcDoc={wrappedHtml}
            className="w-full border-0"
            style={{ minHeight: device === "desktop" ? "500px" : "600px" }}
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
