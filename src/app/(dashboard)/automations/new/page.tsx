"use client";

import Link from "next/link";
import { ArrowLeft, Target, Mail, Clock, HelpCircle, Tag, ListPlus, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function NewAutomationPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/automations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Automation</h1>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Automation Name</Label>
          <Input placeholder="e.g., Welcome Series" />
        </div>

        {/* Visual Workflow */}
        <div className="border border-gray-200 rounded-xl p-8 bg-gray-50 min-h-[500px]">
          <div className="flex flex-col items-center space-y-4">
            {/* Trigger Node */}
            <Card className="w-72 border-2 border-indigo-300">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Target className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase">Trigger</p>
                  <p className="text-sm text-gray-700">Contact added to list</p>
                </div>
              </CardContent>
            </Card>

            <ArrowDown className="h-5 w-5 text-gray-300" />

            {/* Delay Node */}
            <Card className="w-72 border-2 border-amber-300">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase">Delay</p>
                  <p className="text-sm text-gray-700">Wait 1 hour</p>
                </div>
              </CardContent>
            </Card>

            <ArrowDown className="h-5 w-5 text-gray-300" />

            {/* Email Node */}
            <Card className="w-72 border-2 border-blue-300">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase">Send Email</p>
                  <p className="text-sm text-gray-700">Welcome Email</p>
                </div>
              </CardContent>
            </Card>

            <ArrowDown className="h-5 w-5 text-gray-300" />

            {/* Add Step Button */}
            <Button variant="outline" className="rounded-full">
              + Add Step
            </Button>
          </div>

          {/* Available Node Types */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Available Steps</p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Mail, label: "Send Email", color: "bg-blue-100 text-blue-600" },
                { icon: Clock, label: "Delay", color: "bg-amber-100 text-amber-600" },
                { icon: HelpCircle, label: "Condition", color: "bg-purple-100 text-purple-600" },
                { icon: Tag, label: "Add Tag", color: "bg-green-100 text-green-600" },
                { icon: ListPlus, label: "Add to List", color: "bg-cyan-100 text-cyan-600" },
              ].map((node) => (
                <button
                  key={node.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm text-sm"
                >
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${node.color}`}>
                    <node.icon className="h-3 w-3" />
                  </div>
                  {node.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button>Save Automation</Button>
          <Button variant="outline">Activate</Button>
        </div>
      </div>
    </div>
  );
}
