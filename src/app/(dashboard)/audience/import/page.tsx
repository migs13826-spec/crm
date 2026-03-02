"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, ClipboardPaste, Plug, FileSpreadsheet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ImportStep = "method" | "upload" | "configure" | "review" | "progress";

export default function ImportContactsPage() {
  const [step, setStep] = useState<ImportStep>("method");
  const [method, setMethod] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const startImport = () => {
    setStep("progress");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }
      setProgress(p);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/audience">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import Contacts</h1>
      </div>

      {/* Step 1: Choose Method */}
      {step === "method" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: "csv", icon: FileSpreadsheet, title: "Upload CSV/XLSX", desc: "Upload a spreadsheet file" },
            { id: "paste", icon: ClipboardPaste, title: "Copy & Paste", desc: "Paste emails directly" },
            { id: "integration", icon: Plug, title: "Connect Integration", desc: "Import from another service (Phase 2)" },
          ].map((opt) => (
            <Card
              key={opt.id}
              className={`cursor-pointer hover:shadow-md transition-all ${method === opt.id ? "ring-2 ring-indigo-500" : ""} ${opt.id === "integration" ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => opt.id !== "integration" && setMethod(opt.id)}
            >
              <CardContent className="p-6 text-center space-y-3">
                <opt.icon className="h-8 w-8 mx-auto text-indigo-500" />
                <h3 className="font-semibold text-gray-900">{opt.title}</h3>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === "method" && method && (
        <div className="space-y-4">
          {method === "csv" && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-400 transition-colors">
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Drag file here or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Accepts .csv, .xlsx, .xls - Max 50MB
              </p>
            </div>
          )}
          {method === "paste" && (
            <div className="space-y-2">
              <Label>Paste email addresses (one per line)</Label>
              <textarea
                className="w-full h-40 rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={"sarah@example.com\njohn@example.com\njane@example.com"}
              />
            </div>
          )}
          <Button onClick={() => setStep("configure")}>Continue</Button>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === "configure" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Configure Import</h2>
            <div className="space-y-2">
              <Label>Add to List</Label>
              <select className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm">
                <option>Newsletter Subscribers</option>
                <option>VIP Customers</option>
                <option>Product Updates</option>
                <option>+ Create new list</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tags to apply</Label>
              <Input placeholder="Add tags (comma-separated)" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="update-existing" className="h-4 w-4 rounded border-gray-300" defaultChecked />
              <Label htmlFor="update-existing" className="font-normal">Update existing contacts if email matches</Label>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("method")}>Back</Button>
              <Button onClick={() => setStep("review")}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === "review" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Review Import</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Contacts found</span>
                <span className="font-medium text-gray-900">3,456</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Target list</span>
                <span className="font-medium text-gray-900">Newsletter Subscribers</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duplicates</span>
                <span className="font-medium text-amber-600">234 found</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Invalid emails</span>
                <span className="font-medium text-red-600">12 will be skipped</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("configure")}>Back</Button>
              <Button onClick={startImport}>Start Import</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Progress */}
      {step === "progress" && (
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            {progress < 100 ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Importing contacts...</h2>
                <Progress value={progress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-gray-500">
                  Imported {Math.floor(progress * 34.56)} of 3,456 contacts
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Import Complete!</h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-w-sm mx-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Imported</span>
                    <span className="font-medium text-green-600">3,210</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Updated</span>
                    <span className="font-medium text-gray-900">234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Skipped</span>
                    <span className="font-medium text-gray-900">12</span>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href="/audience">
                    <Button>View Contacts</Button>
                  </Link>
                  <Button variant="outline" onClick={() => { setStep("method"); setMethod(null); setProgress(0); }}>
                    Import More
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
