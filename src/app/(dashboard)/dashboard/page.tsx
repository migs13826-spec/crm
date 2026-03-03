"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Mail,
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  FileText,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercentage } from "@/lib/utils";
const statusConfig: Record<string, { label: string; variant: "success" | "secondary" | "default" | "warning" }> = {
  sent: { label: "Sent", variant: "success" },
  draft: { label: "Draft", variant: "secondary" },
  scheduled: { label: "Scheduled", variant: "default" },
  sending: { label: "Sending", variant: "warning" },
  paused: { label: "Paused", variant: "warning" },
  archived: { label: "Archived", variant: "secondary" },
};

interface DashboardData {
  totalContacts: number;
  campaignsSent: number;
  avgOpenRate: number;
  avgClickRate: number;
  recentCampaigns: {
    id: string;
    name: string;
    status: string;
    openRate: number | null;
    sentAt: string | null;
    estimatedRecipients: number;
    updatedAt: string;
  }[];
}

const quickActions = [
  { label: "Create Campaign", desc: "Send an email to your audience", href: "/campaigns/new", icon: Mail, color: "bg-indigo-50 text-indigo-600" },
  { label: "Add Contacts", desc: "Import or add new contacts", href: "/audience/import", icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "New Template", desc: "Design a reusable template", href: "/templates/new", icon: FileText, color: "bg-violet-50 text-violet-600" },
  { label: "New Automation", desc: "Set up automated workflows", href: "/automations/new", icon: Zap, color: "bg-amber-50 text-amber-600" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const greeting = "Welcome back";

  const kpiCards = data ? [
    { title: "Total Contacts", value: data.totalContacts, format: "number" as const, bg: "bg-blue-50", iconColor: "text-blue-600", icon: Users },
    { title: "Campaigns Sent", value: data.campaignsSent, format: "number" as const, bg: "bg-indigo-50", iconColor: "text-indigo-600", icon: Mail },
    { title: "Avg Open Rate", value: data.avgOpenRate, format: "percentage" as const, bg: "bg-emerald-50", iconColor: "text-emerald-600", icon: Eye },
    { title: "Avg Click Rate", value: data.avgClickRate, format: "percentage" as const, bg: "bg-violet-50", iconColor: "text-violet-600", icon: MousePointerClick },
  ] : [];

  return (
    <div className="space-y-8 page-enter">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, User</h1>
          <p className="text-gray-500 mt-1 text-sm">Here&apos;s what&apos;s happening with your marketing</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="hidden sm:flex shadow-sm shadow-indigo-200">
            <Sparkles className="h-4 w-4 mr-1.5" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpiCards.map((kpi) => (
            <Card key={kpi.title} className="card-hover overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-[13px] font-medium text-gray-500">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">
                      {kpi.format === "percentage" ? formatPercentage(kpi.value) : formatNumber(kpi.value)}
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Email Performance</CardTitle>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {["7d", "30d", "90d"].map((period) => (
                <button key={period} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${period === "30d" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {period}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56 flex items-center justify-center rounded-xl grid-bg">
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Connect your Brevo account to see real data</p>
                <Link href="/settings"><Button variant="outline" size="sm" className="mt-3 text-xs">Connect Brevo</Button></Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Campaigns</CardTitle>
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-800 -mr-2">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse py-2.5 px-2">
                  <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              ))
            ) : data?.recentCampaigns.length ? (
              data.recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={campaign.status === "sent" ? `/campaigns/${campaign.id}/report` : `/campaigns`}
                  className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-xl hover:bg-gray-50/80 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                      {campaign.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={statusConfig[campaign.status]?.variant || "secondary"} className="text-[10px] py-0 px-1.5">
                        {statusConfig[campaign.status]?.label || campaign.status}
                      </Badge>
                      <span className="text-[11px] text-gray-400">
                        {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                  {campaign.openRate !== null && (
                    <div className="ml-3 text-right flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-900">{formatPercentage(campaign.openRate)}</span>
                      <p className="text-[10px] text-gray-400">open rate</p>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No campaigns yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="card-hover group cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action.color} transition-transform group-hover:scale-110`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{action.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

