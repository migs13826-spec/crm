"use client";

import Link from "next/link";
import { Plus, Zap, MoreHorizontal, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const automations = [
  {
    id: "1",
    name: "Welcome Series",
    status: "active",
    trigger: "When contact subscribes to Newsletter list",
    steps: 3,
    entered: 2345,
    completion: 89,
  },
  {
    id: "2",
    name: "Re-engagement Campaign",
    status: "paused",
    trigger: "No open in 90 days",
    steps: 2,
    entered: 567,
    completion: 34,
  },
  {
    id: "3",
    name: "Post-Purchase Follow-up",
    status: "draft",
    trigger: 'Tag "purchased" added',
    steps: 4,
    entered: 0,
    completion: 0,
  },
];

const recipes = [
  { id: "r1", name: "Welcome Series", icon: "&#128075;", desc: "Send a series of welcome emails to new subscribers" },
  { id: "r2", name: "Abandoned Cart", icon: "&#128722;", desc: "Remind customers about items left in their cart" },
  { id: "r3", name: "Birthday Email", icon: "&#127874;", desc: "Send personalized birthday wishes" },
  { id: "r4", name: "Follow-up Sequence", icon: "&#128200;", desc: "Nurture leads with educational content" },
  { id: "r5", name: "Re-engagement", icon: "&#128140;", desc: "Win back inactive subscribers" },
  { id: "r6", name: "Lead Nurture", icon: "&#127793;", desc: "Guide prospects through your funnel" },
];

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  draft: { label: "Draft", variant: "secondary" },
};

export default function AutomationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
        <Link href="/automations/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Create Automation
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="my">
        <TabsList>
          <TabsTrigger value="my">My Automations ({automations.length})</TabsTrigger>
          <TabsTrigger value="recipes">Pre-built Recipes ({recipes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          <div className="space-y-3">
            {automations.map((automation) => {
              const status = statusConfig[automation.status];
              return (
                <Card key={automation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">{automation.name}</h3>
                          <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Trigger: {automation.trigger}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {automation.steps} steps - {automation.entered.toLocaleString()} contacts entered - {automation.completion}% completion
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/automations/${automation.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      {automation.status === "active" && (
                        <Button variant="outline" size="sm">
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                      )}
                      {automation.status === "paused" && (
                        <Button variant="outline" size="sm">
                          <Play className="h-3 w-3 mr-1" />
                          Resume
                        </Button>
                      )}
                      <button className="p-1 rounded hover:bg-gray-100">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recipes">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-3xl" dangerouslySetInnerHTML={{ __html: recipe.icon }} />
                  <h3 className="text-sm font-semibold text-gray-900">{recipe.name}</h3>
                  <p className="text-xs text-gray-500">{recipe.desc}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Use This Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
