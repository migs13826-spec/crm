"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Zap, Trash2, Pause, Play, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  draft: { label: "Draft", variant: "secondary" },
};

const recipes = [
  { id: "welcome", name: "Welcome Series", desc: "Send welcome emails to new subscribers", trigger: "list_subscription", nodes: [] },
  { id: "reengagement", name: "Re-engagement", desc: "Win back inactive subscribers", trigger: "no_open_90d", nodes: [] },
  { id: "birthday", name: "Birthday Email", desc: "Send personalized birthday wishes", trigger: "date_field", nodes: [] },
  { id: "post-purchase", name: "Post-Purchase", desc: "Follow up after a purchase", trigger: "tag_added", nodes: [] },
];

export default function AutomationsPage() {
  const { automations, addAutomation, updateAutomation, deleteAutomation } = useAppStore();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleUseRecipe = (recipe: typeof recipes[0]) => {
    addAutomation({
      name: recipe.name,
      status: "draft",
      trigger: recipe.trigger,
      triggerConfig: {},
      nodes: [],
      entered: 0,
      completion: 0,
    });
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    if (currentStatus === "active") updateAutomation(id, { status: "paused" });
    else if (currentStatus === "paused" || currentStatus === "draft") updateAutomation(id, { status: "active" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
        <Link href="/automations/new"><Button><Plus className="h-4 w-4 mr-1" />Create Automation</Button></Link>
      </div>

      {/* My Automations */}
      {automations.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Zap className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No automations yet</h3>
          <p className="text-sm text-gray-500 mt-1">Create an automation or use a pre-built recipe</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {automations.map((automation) => {
            const status = statusConfig[automation.status] || statusConfig.draft;
            return (
              <Card key={automation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center"><Zap className="h-5 w-5 text-amber-600" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{automation.name}</h3>
                        <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Trigger: {automation.trigger}</p>
                      <p className="text-xs text-gray-400 mt-1">{automation.entered} contacts entered - {automation.completion}% completion</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/automations/new?edit=${automation.id}`}><Button variant="outline" size="sm">Edit</Button></Link>
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(automation.id, automation.status)}>
                      {automation.status === "active" ? <><Pause className="h-3 w-3 mr-1" />Pause</> : <><Play className="h-3 w-3 mr-1" />Activate</>}
                    </Button>
                    <button className="p-1 rounded hover:bg-gray-100" onClick={() => deleteAutomation(automation.id)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" /></button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recipes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pre-built Recipes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center space-y-3">
                <Zap className="h-8 w-8 mx-auto text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-900">{recipe.name}</h3>
                <p className="text-xs text-gray-500">{recipe.desc}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleUseRecipe(recipe)}>Use This Recipe</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
