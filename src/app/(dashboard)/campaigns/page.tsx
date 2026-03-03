"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Mail, MoreHorizontal, Clock, CheckCircle, FileEdit, Send, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPercentage } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const statusConfig: Record<string, { label: string; variant: "success" | "secondary" | "default" | "warning"; icon: React.ComponentType<{ className?: string }> }> = {
  sent: { label: "Sent", variant: "success", icon: CheckCircle },
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  scheduled: { label: "Scheduled", variant: "default", icon: Clock },
  sending: { label: "Sending", variant: "warning", icon: Send },
  paused: { label: "Paused", variant: "warning", icon: Clock },
  archived: { label: "Archived", variant: "secondary", icon: FileEdit },
};

const tabs = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "scheduled", label: "Scheduled" },
  { id: "sent", label: "Sent" },
];

export default function CampaignsPage() {
  const { campaigns, deleteCampaign, duplicateCampaign } = useAppStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = campaigns.filter((c) => {
    if (activeTab !== "all" && c.status !== activeTab) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabCounts = {
    draft: campaigns.filter((c) => c.status === "draft").length,
    scheduled: campaigns.filter((c) => c.status === "scheduled").length,
    sent: campaigns.filter((c) => c.status === "sent").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Link href="/campaigns/new"><Button><Plus className="h-4 w-4 mr-1" />Create Campaign</Button></Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search campaigns..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
            {tab.id !== "all" && tabCounts[tab.id as keyof typeof tabCounts] > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">{tabCounts[tab.id as keyof typeof tabCounts]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Mail className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No campaigns found</h3>
            <p className="text-sm mt-1">{campaigns.length === 0 ? "Create your first campaign to get started" : "No campaigns match your filter"}</p>
            <Link href="/campaigns/new"><Button className="mt-4"><Plus className="h-4 w-4 mr-1" />Create Campaign</Button></Link>
          </div>
        ) : filtered.map((campaign) => {
          const status = statusConfig[campaign.status] || statusConfig.draft;
          const StatusIcon = status.icon;
          return (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{campaign.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={status.variant} className="text-[10px]"><StatusIcon className="h-3 w-3 mr-1" />{status.label}</Badge>
                        {campaign.subject && <span className="text-xs text-gray-400 truncate max-w-xs">{campaign.subject}</span>}
                      </div>
                      {campaign.openRate != null && (
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">Open: <span className="font-medium text-blue-600">{formatPercentage(campaign.openRate)}</span></span>
                          {campaign.clickRate != null && <span className="text-xs text-gray-500">Click: <span className="font-medium text-green-600">{formatPercentage(campaign.clickRate)}</span></span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {campaign.status === "sent" && <Link href={`/campaigns/${campaign.id}/report`}><Button variant="outline" size="sm">View Report</Button></Link>}
                      {campaign.status === "draft" && <Button variant="outline" size="sm" onClick={() => router.push(`/campaigns/new?edit=${campaign.id}`)}>Edit</Button>}
                      <div className="relative">
                        <button className="p-1 rounded hover:bg-gray-100" onClick={() => setMenuOpen(menuOpen === campaign.id ? null : campaign.id)}>
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                        {menuOpen === campaign.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => { duplicateCampaign(campaign.id); setMenuOpen(null); }}>
                                <Copy className="h-3.5 w-3.5" />Duplicate
                              </button>
                              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => { deleteCampaign(campaign.id); setMenuOpen(null); }}>
                                <Trash2 className="h-3.5 w-3.5" />Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
