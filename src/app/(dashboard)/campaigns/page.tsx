"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Mail, MoreHorizontal, Clock, CheckCircle, FileEdit, Send, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPercentage } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  status: string;
  sentAt: string | null;
  estimatedRecipients: number;
  openRate: number | null;
  clickRate: number | null;
  unsubRate: number | null;
  updatedAt: string;
  selectedLists: string[];
}

const statusConfig: Record<string, { label: string; variant: "success" | "secondary" | "default" | "warning"; icon: React.ComponentType<{ className?: string }> }> = {
  sent: { label: "Sent", variant: "success", icon: CheckCircle },
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  scheduled: { label: "Scheduled", variant: "default", icon: Clock },
  sending: { label: "Sending", variant: "warning", icon: Send },
};

const tabs = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "scheduled", label: "Scheduled" },
  { id: "sent", label: "Sent" },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data) => { setCampaigns(data.campaigns || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = campaigns.filter((c) => {
    if (activeTab !== "all" && c.status !== activeTab) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabCounts = {
    all: campaigns.length,
    draft: campaigns.filter((c) => c.status === "draft").length,
    scheduled: campaigns.filter((c) => c.status === "scheduled").length,
    sent: campaigns.filter((c) => c.status === "sent").length,
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create, manage, and track your email campaigns</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="shadow-sm shadow-indigo-200">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Campaign
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search campaigns..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-gray-100" : "bg-gray-200/60"}`}>
                {tabCounts[tab.id as keyof typeof tabCounts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200 grid-bg">
            <div className="bg-white/80 inline-block rounded-2xl p-8 shadow-sm border border-gray-100">
              <Mail className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-900">No campaigns found</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">Create your first campaign to get started</p>
              <Link href="/campaigns/new"><Button><Plus className="h-4 w-4 mr-1.5" />Create Campaign</Button></Link>
            </div>
          </div>
        ) : (
          filtered.map((campaign) => {
            const status = statusConfig[campaign.status] || statusConfig.draft;
            const StatusIcon = status.icon;
            return (
              <Card key={campaign.id} className="card-hover group">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${
                    campaign.status === "sent" ? "bg-emerald-50" : campaign.status === "draft" ? "bg-gray-100" : "bg-blue-50"
                  }`}>
                    <Mail className={`h-5 w-5 ${
                      campaign.status === "sent" ? "text-emerald-600" : campaign.status === "draft" ? "text-gray-400" : "text-blue-600"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                          {campaign.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant={status.variant} className="text-[10px] gap-1">
                            <StatusIcon className="h-3 w-3" />{status.label}
                          </Badge>
                          {campaign.sentAt && (
                            <span className="text-xs text-gray-400">{new Date(campaign.sentAt).toLocaleDateString()}</span>
                          )}
                          {campaign.estimatedRecipients > 0 && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="text-xs text-gray-400">{campaign.estimatedRecipients.toLocaleString()} recipients</span>
                            </>
                          )}
                        </div>
                        {campaign.openRate !== null && (
                          <div className="flex items-center gap-5 mt-2.5">
                            <div>
                              <p className="text-lg font-bold text-gray-900">{formatPercentage(campaign.openRate)}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Open Rate</p>
                            </div>
                            <div className="h-8 w-px bg-gray-200" />
                            <div>
                              <p className="text-lg font-bold text-gray-900">{formatPercentage(campaign.clickRate || 0)}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Click Rate</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {campaign.status === "sent" && (
                          <Link href={`/campaigns/${campaign.id}/report`}>
                            <Button variant="outline" size="sm">Report <ArrowRight className="h-3 w-3 ml-1" /></Button>
                          </Link>
                        )}
                        {campaign.status === "draft" && (
                          <Link href={`/campaigns/new?edit=${campaign.id}`}>
                            <Button size="sm">Continue</Button>
                          </Link>
                        )}
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                          onClick={() => handleDelete(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
