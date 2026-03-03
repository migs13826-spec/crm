"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Mail, MoreHorizontal, Clock, CheckCircle, FileEdit, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPercentage } from "@/lib/utils";

const mockCampaigns = [
  { id: "1", name: "Summer Sale Announcement", status: "sent", sentAt: "Jun 10, 2025 at 2:30 PM", recipients: "Newsletter (8.2K)", openRate: 24.3, clickRate: 3.8, unsubRate: 0.1, lastEdited: null },
  { id: "2", name: "Product Update v3.2", status: "draft", sentAt: null, recipients: null, openRate: null, clickRate: null, unsubRate: null, lastEdited: "Jun 12, 2025 at 9:15 AM" },
  { id: "3", name: "Weekly Newsletter #46", status: "scheduled", sentAt: "Jun 15, 2025 at 10:00 AM", recipients: "All (12.8K)", openRate: null, clickRate: null, unsubRate: null, lastEdited: null },
  { id: "4", name: "Welcome Email Series", status: "sent", sentAt: "Jun 5, 2025 at 8:00 AM", recipients: "New Subscribers (456)", openRate: 45.2, clickRate: 12.1, unsubRate: 0.0, lastEdited: null },
  { id: "5", name: "Flash Sale - 48hr Only", status: "sent", sentAt: "Jun 3, 2025 at 11:00 AM", recipients: "Newsletter (8.2K)", openRate: 19.1, clickRate: 5.2, unsubRate: 0.2, lastEdited: null },
];

const statusConfig: Record<string, { label: string; variant: "success" | "secondary" | "default" | "warning"; icon: React.ComponentType<{ className?: string }> }> = {
  sent: { label: "Sent", variant: "success", icon: CheckCircle },
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  scheduled: { label: "Scheduled", variant: "default", icon: Clock },
  sending: { label: "Sending", variant: "warning", icon: Send },
};

const tabs = [
  { id: "all", label: "All", count: 5 },
  { id: "draft", label: "Drafts", count: 1 },
  { id: "scheduled", label: "Scheduled", count: 1 },
  { id: "sent", label: "Sent", count: 3 },
];

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockCampaigns.filter((c) => {
    if (activeTab !== "all" && c.status !== activeTab) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-gray-100" : "bg-gray-200/60"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {filtered.map((campaign) => {
          const status = statusConfig[campaign.status];
          const StatusIcon = status.icon;

          return (
            <Card key={campaign.id} className="card-hover group">
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${
                  campaign.status === "sent" ? "bg-emerald-50" :
                  campaign.status === "draft" ? "bg-gray-100" :
                  "bg-blue-50"
                }`}>
                  <Mail className={`h-5 w-5 ${
                    campaign.status === "sent" ? "text-emerald-600" :
                    campaign.status === "draft" ? "text-gray-400" :
                    "text-blue-600"
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
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {campaign.status === "sent" && `Sent ${campaign.sentAt}`}
                          {campaign.status === "scheduled" && `Scheduled ${campaign.sentAt}`}
                          {campaign.status === "draft" && `Last edited ${campaign.lastEdited}`}
                        </span>
                        {campaign.recipients && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="text-xs text-gray-400">To: {campaign.recipients}</span>
                          </>
                        )}
                      </div>
                      {campaign.openRate !== null && (
                        <div className="flex items-center gap-5 mt-2.5">
                          <div>
                            <p className="text-lg font-bold text-gray-900">{formatPercentage(campaign.openRate!)}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Open Rate</p>
                          </div>
                          <div className="h-8 w-px bg-gray-200" />
                          <div>
                            <p className="text-lg font-bold text-gray-900">{formatPercentage(campaign.clickRate!)}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Click Rate</p>
                          </div>
                          <div className="h-8 w-px bg-gray-200" />
                          <div>
                            <p className="text-lg font-bold text-gray-900">{formatPercentage(campaign.unsubRate!)}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Unsub</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {campaign.status === "sent" && (
                        <Link href={`/campaigns/${campaign.id}/report`}>
                          <Button variant="outline" size="sm">
                            View Report
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                      {campaign.status === "draft" && (
                        <Link href={`/campaigns/${campaign.id}/edit`}>
                          <Button size="sm">Continue Editing</Button>
                        </Link>
                      )}
                      {campaign.status === "scheduled" && (
                        <Link href={`/campaigns/${campaign.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200 grid-bg">
            <div className="bg-white/80 inline-block rounded-2xl p-8 shadow-sm border border-gray-100">
              <Mail className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-900">No campaigns found</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">Create your first campaign to get started</p>
              <Link href="/campaigns/new">
                <Button>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
