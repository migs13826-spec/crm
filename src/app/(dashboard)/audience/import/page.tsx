"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  ClipboardPaste,
  Plug,
  FileSpreadsheet,
  Check,
  X,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type ImportStep = "method" | "mapping" | "configure" | "review" | "progress";

interface ParsedCSV {
  headers: string[];
  rows: string[][];
  totalRows: number;
  fileName: string;
  fileSize: string;
}

interface ColumnMapping {
  [fileColumn: string]: string;
}

const targetFields = [
  { value: "", label: "-- Skip Column --" },
  { value: "email", label: "Email *" },
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "phone", label: "Phone" },
  { value: "company", label: "Company" },
  { value: "jobTitle", label: "Job Title" },
  { value: "city", label: "City" },
  { value: "country", label: "Country" },
  { value: "custom", label: "+ Create Custom Field" },
];

function autoDetectMapping(header: string): string {
  const h = header.toLowerCase().trim().replace(/[_\-\s]+/g, "");
  if (["email", "emailaddress", "mail", "e-mail"].includes(h)) return "email";
  if (["firstname", "first", "fname", "givenname"].includes(h)) return "firstName";
  if (["lastname", "last", "lname", "surname", "familyname"].includes(h)) return "lastName";
  if (["phone", "phonenumber", "tel", "telephone", "mobile"].includes(h)) return "phone";
  if (["company", "companyname", "organization", "org"].includes(h)) return "company";
  if (["jobtitle", "title", "position", "role"].includes(h)) return "jobTitle";
  if (["city", "town"].includes(h)) return "city";
  if (["country", "nation"].includes(h)) return "country";
  return "";
}

function parseCSVContent(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ImportContactsPage() {
  const [step, setStep] = useState<ImportStep>("method");
  const [method, setMethod] = useState<string | null>(null);
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [pastedEmails, setPastedEmails] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [targetList, setTargetList] = useState("Newsletter Subscribers");
  const [tags, setTags] = useState("");
  const [updateExisting, setUpdateExisting] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const { headers, rows } = parseCSVContent(content);
      const csv: ParsedCSV = {
        headers,
        rows,
        totalRows: rows.length,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
      };
      setParsedCSV(csv);

      // Auto-detect column mappings
      const autoMap: ColumnMapping = {};
      headers.forEach((h) => {
        const detected = autoDetectMapping(h);
        if (detected) autoMap[h] = detected;
      });
      setColumnMapping(autoMap);
      setStep("mapping");
    };
    reader.readAsText(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handlePasteSubmit = () => {
    const emails = pastedEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
    const csv: ParsedCSV = {
      headers: ["email"],
      rows: emails.map((e) => [e]),
      totalRows: emails.length,
      fileName: "Pasted emails",
      fileSize: `${emails.length} entries`,
    };
    setParsedCSV(csv);
    setColumnMapping({ email: "email" });
    setStep("configure");
  };

  const emailColumnKey = Object.entries(columnMapping).find(([, v]) => v === "email")?.[0];
  const emailColIndex = parsedCSV?.headers.indexOf(emailColumnKey || "") ?? -1;

  const getImportStats = () => {
    if (!parsedCSV) return { total: 0, valid: 0, invalid: 0, duplicates: 0 };
    const emails = new Set<string>();
    let valid = 0;
    let invalid = 0;
    let duplicates = 0;

    parsedCSV.rows.forEach((row) => {
      const email = emailColIndex >= 0 ? row[emailColIndex]?.toLowerCase().trim() : row[0]?.toLowerCase().trim();
      if (!email || !isValidEmail(email)) {
        invalid++;
      } else if (emails.has(email)) {
        duplicates++;
      } else {
        emails.add(email);
        valid++;
      }
    });

    return { total: parsedCSV.totalRows, valid, invalid, duplicates };
  };

  const hasEmailMapping = Object.values(columnMapping).includes("email");

  const [importResult, setImportResult] = useState<{ imported: number; updated: number; skipped: number } | null>(null);

  const startImport = async () => {
    setStep("progress");
    setProgress(10);

    // Build contact objects from parsed CSV using column mapping
    const contactsToImport: Record<string, string>[] = [];
    if (parsedCSV) {
      for (const row of parsedCSV.rows) {
        const contact: Record<string, string> = {};
        parsedCSV.headers.forEach((header, idx) => {
          const mappedField = columnMapping[header];
          if (mappedField && row[idx]) {
            contact[mappedField] = row[idx];
          }
        });
        if (contact.email) {
          contactsToImport.push(contact);
        }
      }
    }

    setProgress(30);

    try {
      const tagsArray = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
      const res = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: contactsToImport,
          listName: targetList,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          updateExisting,
        }),
      });
      setProgress(80);
      const result = await res.json();
      setImportResult(result);
      setProgress(100);
    } catch (error) {
      console.error("Import failed:", error);
      setImportResult({ imported: 0, updated: 0, skipped: contactsToImport.length });
      setProgress(100);
    }
  };

  const stepLabels: { key: ImportStep; label: string; num: number }[] = [
    { key: "method", label: "Choose Method", num: 1 },
    { key: "mapping", label: "Map Columns", num: 2 },
    { key: "configure", label: "Configure", num: 3 },
    { key: "review", label: "Review & Import", num: 4 },
  ];

  const currentStepNum =
    step === "progress" ? 4 : stepLabels.find((s) => s.key === step)?.num ?? 1;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/audience">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Contacts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add contacts from a file or paste them directly</p>
        </div>
      </div>

      {/* Step Progress Bar */}
      {step !== "progress" && (
        <div className="flex items-center gap-2">
          {stepLabels.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors ${
                    currentStepNum > s.num
                      ? "bg-emerald-500 text-white"
                      : currentStepNum === s.num
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStepNum > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    currentStepNum >= s.num ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  className={`h-px flex-1 min-w-4 ${
                    currentStepNum > s.num ? "bg-emerald-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Choose Method */}
      {step === "method" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: "csv",
                icon: FileSpreadsheet,
                title: "Upload CSV/XLSX",
                desc: "Import contacts from a spreadsheet file",
                color: "text-indigo-600 bg-indigo-50",
              },
              {
                id: "paste",
                icon: ClipboardPaste,
                title: "Copy & Paste",
                desc: "Paste email addresses directly",
                color: "text-violet-600 bg-violet-50",
              },
              {
                id: "integration",
                icon: Plug,
                title: "Connect Integration",
                desc: "Import from another service",
                color: "text-gray-400 bg-gray-100",
                disabled: true,
              },
            ].map((opt) => (
              <Card
                key={opt.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  method === opt.id
                    ? "ring-2 ring-indigo-500 shadow-md"
                    : "hover:shadow-md hover:border-gray-300"
                } ${opt.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !opt.disabled && setMethod(opt.id)}
              >
                {opt.disabled && (
                  <Badge variant="secondary" className="absolute top-3 right-3 text-[9px]">
                    Coming Soon
                  </Badge>
                )}
                <CardContent className="p-6 text-center space-y-3">
                  <div
                    className={`h-12 w-12 rounded-xl mx-auto flex items-center justify-center ${opt.color}`}
                  >
                    <opt.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{opt.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {method === "csv" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.tsv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Upload className="h-7 w-7 text-indigo-500" />
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  Drop your file here, or{" "}
                  <span className="text-indigo-600">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports CSV, XLSX, XLS, TSV - up to 50MB
                </p>
              </div>
            </div>
          )}

          {method === "paste" && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Paste email addresses
                  </Label>
                  <p className="text-xs text-gray-500">
                    One email per line, or comma/semicolon separated
                  </p>
                  <textarea
                    className="w-full h-44 rounded-xl border border-gray-300 p-4 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder={"sarah@example.com\njohn@example.com\njane@example.com\nmark@company.co"}
                    value={pastedEmails}
                    onChange={(e) => setPastedEmails(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {pastedEmails.split(/[\n,;]+/).filter((e) => e.trim()).length} emails
                      detected
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handlePasteSubmit}
                  disabled={pastedEmails.trim().length === 0}
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === "mapping" && parsedCSV && (
        <div className="space-y-6">
          {/* File info */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {parsedCSV.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {parsedCSV.totalRows.toLocaleString()} rows - {parsedCSV.headers.length} columns - {parsedCSV.fileSize}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setParsedCSV(null);
                  setStep("method");
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </CardContent>
          </Card>

          {/* Mapping interface */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Map Your Columns</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Match your file columns to contact fields. Email is required.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_40px_1fr] gap-2 items-center px-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    File Column
                  </span>
                  <span />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Maps To
                  </span>
                </div>
                {parsedCSV.headers.map((header) => (
                  <div
                    key={header}
                    className={`grid grid-cols-[1fr_40px_1fr] gap-2 items-center p-3 rounded-xl transition-colors ${
                      columnMapping[header] === "email"
                        ? "bg-indigo-50 border border-indigo-200"
                        : columnMapping[header]
                        ? "bg-gray-50 border border-gray-100"
                        : "border border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                        {header}
                      </code>
                      {parsedCSV.rows[0] && (
                        <span className="text-xs text-gray-400 truncate hidden sm:block">
                          e.g. &quot;{parsedCSV.rows[0][parsedCSV.headers.indexOf(header)] || ""}
                          &quot;
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center text-gray-300">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <select
                      className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={columnMapping[header] || ""}
                      onChange={(e) =>
                        setColumnMapping({
                          ...columnMapping,
                          [header]: e.target.value,
                        })
                      }
                    >
                      {targetFields.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {!hasEmailMapping && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    You must map at least one column to <strong>Email</strong> to continue.
                  </p>
                </div>
              )}

              {/* Data Preview */}
              <div>
                <button
                  onClick={() => setPreviewVisible(!previewVisible)}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <Eye className="h-4 w-4" />
                  {previewVisible ? "Hide" : "Preview"} first 5 rows
                </button>
                {previewVisible && (
                  <div className="mt-3 rounded-xl border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-8">
                            #
                          </th>
                          {parsedCSV.headers.map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-xs font-semibold text-gray-500"
                            >
                              {columnMapping[h] ? (
                                <Badge
                                  variant={columnMapping[h] === "email" ? "default" : "secondary"}
                                  className="text-[10px]"
                                >
                                  {targetFields.find((f) => f.value === columnMapping[h])?.label || h}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 italic">skipped</span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedCSV.rows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0">
                            <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className={`px-3 py-2 ${
                                  columnMapping[parsedCSV.headers[j]]
                                    ? "text-gray-900"
                                    : "text-gray-300"
                                }`}
                              >
                                {cell || <span className="text-gray-300">--</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setParsedCSV(null);
                setStep("method");
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button onClick={() => setStep("configure")} disabled={!hasEmailMapping}>
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Configure */}
      {step === "configure" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Configure Import</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose where to add these contacts and how to handle duplicates.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Add to List</Label>
                <select
                  className="w-full h-10 rounded-xl border border-gray-300 px-3 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={targetList}
                  onChange={(e) => setTargetList(e.target.value)}
                >
                  <option>Newsletter Subscribers</option>
                  <option>VIP Customers</option>
                  <option>Product Updates</option>
                  <option value="new">+ Create new list</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tags to apply</Label>
                <Input
                  placeholder="e.g., imported, june-2025"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="rounded-xl"
                />
                <p className="text-xs text-gray-400">Comma-separated. These tags will be added to all imported contacts.</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="update-existing"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                />
                <div>
                  <Label htmlFor="update-existing" className="font-semibold text-sm cursor-pointer">
                    Update existing contacts
                  </Label>
                  <p className="text-xs text-gray-500">
                    If an email already exists, update their info with the new data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(method === "paste" ? "method" : "mapping")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button onClick={() => setStep("review")}>
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === "review" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Review Import</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Double-check everything before importing.
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                {[
                  { label: "Source", value: parsedCSV?.fileName || "Pasted emails", icon: FileText },
                  { label: "Total contacts", value: getImportStats().total.toLocaleString() },
                  { label: "Valid emails", value: getImportStats().valid.toLocaleString(), color: "text-emerald-600" },
                  ...(getImportStats().duplicates > 0
                    ? [{ label: "Duplicates", value: `${getImportStats().duplicates} will be ${updateExisting ? "updated" : "skipped"}`, color: "text-amber-600" }]
                    : []),
                  ...(getImportStats().invalid > 0
                    ? [{ label: "Invalid emails", value: `${getImportStats().invalid} will be skipped`, color: "text-red-500" }]
                    : []),
                  { label: "Target list", value: targetList },
                  ...(tags ? [{ label: "Tags", value: tags }] : []),
                  {
                    label: "Mapped fields",
                    value: Object.values(columnMapping)
                      .filter(Boolean)
                      .map((v) => targetFields.find((f) => f.value === v)?.label || v)
                      .join(", "),
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className={`text-sm font-semibold ${(item as { color?: string }).color || "text-gray-900"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {getImportStats().invalid > 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      {getImportStats().invalid} invalid email{getImportStats().invalid > 1 ? "s" : ""} found
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      These rows will be skipped during import.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("configure")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button onClick={startImport} size="lg" className="px-8">
              Start Import
              <Upload className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Progress / Complete */}
      {step === "progress" && (
        <Card>
          <CardContent className="p-10 text-center space-y-6">
            {progress < 100 ? (
              <>
                <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Upload className="h-7 w-7 text-indigo-600 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Importing contacts...</h2>
                  <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm font-medium text-gray-600">
                    {Math.floor((progress / 100) * getImportStats().valid).toLocaleString()} of{" "}
                    {getImportStats().valid.toLocaleString()} contacts
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Check className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Import Complete</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Your contacts have been successfully imported
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 max-w-xs mx-auto overflow-hidden">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">Imported</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {importResult ? importResult.imported.toLocaleString() : getImportStats().valid.toLocaleString()}
                    </span>
                  </div>
                  {(importResult?.updated || 0) > 0 && (
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-sm text-gray-500">Updated</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {importResult!.updated}
                      </span>
                    </div>
                  )}
                  {(importResult?.skipped || 0) > 0 && (
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-sm text-gray-500">Skipped</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {importResult!.skipped}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <Link href="/audience">
                    <Button size="lg">View Contacts</Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setStep("method");
                      setMethod(null);
                      setParsedCSV(null);
                      setColumnMapping({});
                      setPastedEmails("");
                      setProgress(0);
                    }}
                  >
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
