"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Check, Upload, Building2, Link2, AtSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  { id: "company", label: "Company Profile", icon: Building2 },
  { id: "brevo", label: "Connect Brevo", icon: Link2 },
  { id: "sender", label: "Sender Setup", icon: AtSign },
  { id: "import", label: "Import Contacts", icon: Users },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [brevoStatus, setBrevoStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  const handleComplete = () => {
    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-[600px]">
      <CardContent className="p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
                  i < currentStep && "bg-green-500 text-white",
                  i === currentStep && "bg-indigo-500 text-white",
                  i > currentStep && "bg-gray-200 text-gray-400"
                )}
              >
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("w-8 h-0.5", i < currentStep ? "bg-green-500" : "bg-gray-200")} />
              )}
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">{steps[currentStep].label}</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Step {currentStep + 1} of {steps.length}
        </p>

        {/* Step 1: Company Profile */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input placeholder="Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <select className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm">
                <option value="">Select industry...</option>
                {["Technology", "E-commerce", "Healthcare", "Education", "Finance", "Marketing", "Real Estate", "Non-profit", "Media", "Other"].map(
                  (ind) => <option key={ind}>{ind}</option>
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Company Size</Label>
              <div className="grid grid-cols-5 gap-2">
                {["1-10", "11-50", "51-200", "201-1000", "1000+"].map((size) => (
                  <label key={size} className="flex items-center justify-center p-2 border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-indigo-50 hover:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500">
                    <input type="radio" name="size" value={size} className="sr-only" />
                    {size}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website URL (optional)</Label>
              <Input placeholder="https://example.com" />
            </div>
          </div>
        )}

        {/* Step 2: Connect Brevo */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Brevo API Key</Label>
              <Input placeholder="xkeysib-..." className="font-mono text-sm" />
              <a href="https://help.brevo.com/hc/en-us/articles/209467485" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">
                How to find your API key &rarr;
              </a>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setBrevoStatus("testing");
                setTimeout(() => setBrevoStatus("success"), 1500);
              }}
            >
              {brevoStatus === "testing" ? "Testing..." : "Test Connection"}
            </Button>
            {brevoStatus === "success" && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Connected successfully! Account: Acme Corp</span>
              </div>
            )}
            {brevoStatus === "error" && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-sm text-red-700">Connection failed. Please check your API key.</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Sender Setup */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sender Name</Label>
              <Input placeholder="e.g., Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label>Sender Email</Label>
              <Input type="email" placeholder="hello@acme.com" />
            </div>
            <p className="text-xs text-gray-500">
              A verification email will be sent to confirm this sender address.
            </p>
          </div>
        )}

        {/* Step 4: Import Contacts */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "csv", icon: Upload, title: "Upload CSV", desc: "Import contacts from a spreadsheet" },
                { id: "paste", icon: AtSign, title: "Copy-paste Emails", desc: "Paste email addresses directly" },
                { id: "skip", icon: Check, title: "Skip for Now", desc: "You can import contacts later" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-500 transition-all text-left"
                  onClick={() => {
                    if (opt.id === "skip") handleComplete();
                  }}
                >
                  <opt.icon className="h-6 w-6 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{opt.title}</h3>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          {currentStep > 0 ? (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Get Started
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
