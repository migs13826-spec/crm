"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target, Mail, Clock, HelpCircle, Tag, ListPlus, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

const nodeTypes = [
  { type: "email", icon: Mail, label: "Send Email", color: "bg-blue-100 text-blue-600 border-blue-300" },
  { type: "delay", icon: Clock, label: "Delay", color: "bg-amber-100 text-amber-600 border-amber-300" },
  { type: "condition", icon: HelpCircle, label: "Condition", color: "bg-purple-100 text-purple-600 border-purple-300" },
  { type: "add_tag", icon: Tag, label: "Add Tag", color: "bg-green-100 text-green-600 border-green-300" },
  { type: "add_to_list", icon: ListPlus, label: "Add to List", color: "bg-cyan-100 text-cyan-600 border-cyan-300" },
];

export default function NewAutomationPage() {
  const router = useRouter();
  const { addAutomation } = useAppStore();
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("list_subscription");
  const [workflowNodes, setWorkflowNodes] = useState<{ id: string; type: string; label: string }[]>([
    { id: "1", type: "delay", label: "Wait 1 hour" },
    { id: "2", type: "email", label: "Welcome Email" },
  ]);

  const addNode = (type: string) => {
    const labels: Record<string, string> = { email: "Send Email", delay: "Wait 1 day", condition: "Check condition", add_tag: "Add tag", add_to_list: "Add to list" };
    setWorkflowNodes((prev) => [...prev, { id: String(Math.random()).slice(2, 10), type, label: labels[type] || type }]);
  };

  const removeNode = (id: string) => setWorkflowNodes(workflowNodes.filter((n) => n.id !== id));

  const handleSave = () => {
    if (!name) return;
    addAutomation({ name, status: "draft", trigger: triggerType, triggerConfig: {}, nodes: workflowNodes.map((n) => ({ id: n.id, type: n.type as "trigger", config: { label: n.label } })), entered: 0, completion: 0 });
    router.push("/automations");
  };

  const handleActivate = () => {
    if (!name) return;
    addAutomation({ name, status: "active", trigger: triggerType, triggerConfig: {}, nodes: workflowNodes.map((n) => ({ id: n.id, type: n.type as "trigger", config: { label: n.label } })), entered: 0, completion: 0 });
    router.push("/automations");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/automations"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Automation</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={!name}>Save Draft</Button>
          <Button onClick={handleActivate} disabled={!name}>Activate</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Automation Name *</Label><Input placeholder="e.g., Welcome Series" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Trigger</Label>
            <select className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm" value={triggerType} onChange={(e) => setTriggerType(e.target.value)}>
              <option value="list_subscription">Contact added to list</option>
              <option value="form_submission">Form submitted</option>
              <option value="tag_added">Tag added</option>
              <option value="date_field">Date-based</option>
            </select>
          </div>
        </div>

        {/* Visual Workflow */}
        <div className="border border-gray-200 rounded-xl p-8 bg-gray-50 min-h-[400px]">
          <div className="flex flex-col items-center space-y-3">
            {/* Trigger */}
            <Card className="w-72 border-2 border-indigo-300">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center"><Target className="h-4 w-4 text-indigo-600" /></div>
                <div><p className="text-xs font-semibold text-indigo-600 uppercase">Trigger</p><p className="text-sm text-gray-700">{triggerType.replace(/_/g, " ")}</p></div>
              </CardContent>
            </Card>

            {workflowNodes.map((node, i) => {
              const nodeType = nodeTypes.find((n) => n.type === node.type);
              const Icon = nodeType?.icon || Mail;
              return (
                <div key={node.id} className="flex flex-col items-center">
                  <ArrowDown className="h-5 w-5 text-gray-300" />
                  <Card className={`w-72 border-2 ${nodeType?.color || "border-gray-300"} group relative`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${nodeType?.color || ""}`}><Icon className="h-4 w-4" /></div>
                      <div className="flex-1"><p className="text-xs font-semibold uppercase">{nodeType?.label}</p><p className="text-sm text-gray-700">{node.label}</p></div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-all" onClick={() => removeNode(node.id)}>x</button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            <ArrowDown className="h-5 w-5 text-gray-300" />
            <div className="flex flex-wrap gap-2 justify-center">
              {nodeTypes.map((nt) => (
                <button key={nt.type} onClick={() => addNode(nt.type)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm text-sm">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${nt.color}`}><nt.icon className="h-3 w-3" /></div>
                  {nt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
