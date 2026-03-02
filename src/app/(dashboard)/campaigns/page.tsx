"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Mail, MoreHorizontal, Clock, CheckCircle, FileEdit, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPercentage } from "@/lib/utils";

const mockCampaigns = [
  {
    id: "1",
    name: "Summer Sale Announcement",
    status: "sent",
    sentAt: "Jun 10, 2025 at 2:30 PM",
    recipients: "Newsletter (8.2K)",
    openRate: 24.3,
    clickRate: 3.8,
    unsubRate: 0.1,
  },
  {
    id: "2",
    name: "Product Update v3.2",
    status: "draft",
    sentAt: null,
    recipients: null,
    openRate: null,
    clickRate: null,
    unsubRate: null,
    lastEdited: "Jun 12, 2025 at 9:15 AM",
  },
  {
    id: "3",
    name: "Weekly Newsletter #46",
    status: "scheduled",
    sentAt: "Jun 15, 2025 at 10:00 AM",
    recipients: "All (12.8K)",
    openRate: null,
    clickRate: null,
    unsubRate: null,
  },
  {
    id: "4",
    name: "Welcome Email Series",
    status: "sent",
    sentAt: "Jun 5, 2025 at 8:00 AM",
    recipients: "New Subscribers (456)",
    openRate: 45.2,
    clickRate: 12.1,
    unsubRate: 0.0,
  },
  {
    id: "5",
    name: "Flash Sale - 48hr Only",
    status: "sent",
    sentAt: "Jun 3, 2025 at 11:00 AM",
    recipients: "Newsletter (8.2K)",
    openRate: 19.1,
    clickRate: 5.2,
    unsubRate: 0.2,
  },
];

const statusConfig: Record<string, { label: string; variant: "success" | "secondary" | "default" | "warning"; icon: React.ComponentType<{ className?: string }> }> = {
  sent: { label: "Sent", variant: "success", icon: CheckCircle },
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  scheduled: { label: "Scheduled", variant: "default", icon: Clock },
  sending: { label: "Sending", variant: "warning", icon: Send },
};

const tabs = [
  { id: "all", label: "All" },
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Link href="/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search campaigns..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {filtered.map((campaign) => {
          const status = statusConfig[campaign.status];
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
                      <h3 className="text-sm font-semibold text-gray-900">
                        {campaign.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={status.variant} className="text-[10px]">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {campaign.status === "sent" && `Sent ${campaign.sentAt}`}
                          {campaign.status === "scheduled" && `Scheduled ${campaign.sentAt}`}
                          {campaign.status === "draft" && `Last edited ${(campaign as Record<string, unknown>).lastEdited}`}
                        </span>
                        {campaign.recipients && (
                          <span className="text-xs text-gray-400">
                            To: {campaign.recipients}
                          </span>
                        )}
                      </div>
                      {campaign.openRate !== null && (
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Open: <span className="font-medium text-blue-600">{formatPercentage(campaign.openRate!)}</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            Click: <span className="font-medium text-green-600">{formatPercentage(campaign.clickRate!)}</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            Unsub: <span className="font-medium text-red-600">{formatPercentage(campaign.unsubRate!)}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {campaign.status === "sent" && (
                        <Link href={`/campaigns/${campaign.id}/report`}>
                          <Button variant="outline" size="sm">View Report</Button>
                        </Link>
                      )}
                      {campaign.status === "draft" && (
                        <Link href={`/campaigns/${campaign.id}/edit`}>
                          <Button variant="outline" size="sm">Continue</Button>
                        </Link>
                      )}
                      {campaign.status === "scheduled" && (
                        <Link href={`/campaigns/${campaign.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                      )}
                      <button className="p-1 rounded hover:bg-gray-100">
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
          <div className="text-center py-12 text-gray-500">
            <Mail className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No campaigns found</h3>
            <p className="text-sm mt-1">Create your first campaign to get started</p>
            <Link href="/campaigns/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-1" />
                Create Campaign
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
