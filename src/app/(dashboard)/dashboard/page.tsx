"use client";

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

const kpiCards = [
  {
    title: "Total Contacts",
    value: 12847,
    delta: 12,
    deltaLabel: "+1,542 this month",
    deltaPositive: true,
    icon: Users,
    format: "number" as const,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Campaigns Sent",
    value: 34,
    delta: 5,
    deltaLabel: "+5 this month",
    deltaPositive: true,
    icon: Mail,
    format: "number" as const,
    color: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    title: "Avg Open Rate",
    value: 24.3,
    delta: 1.2,
    deltaLabel: "vs. last 30 days",
    deltaPositive: true,
    icon: Eye,
    format: "percentage" as const,
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Avg Click Rate",
    value: 3.8,
    delta: -0.3,
    deltaLabel: "vs. last 30 days",
    deltaPositive: false,
    icon: MousePointerClick,
    format: "percentage" as const,
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
];

const recentCampaigns = [
  { id: "1", name: "Summer Sale Announcement", status: "sent", openRate: 24.3, sentDate: "2 days ago", recipients: "8.2K" },
  { id: "2", name: "Product Update v3.2", status: "draft", openRate: null, sentDate: null, recipients: null },
  { id: "3", name: "Weekly Newsletter #46", status: "scheduled", openRate: null, sentDate: "Jun 15", recipients: "12.8K" },
  { id: "4", name: "Welcome Email Series", status: "sent", openRate: 45.2, sentDate: "5 days ago", recipients: "456" },
  { id: "5", name: "Flash Sale - 48hr Only", status: "sent", openRate: 19.1, sentDate: "1 week ago", recipients: "8.2K" },
];

const quickActions = [
  { label: "Create Campaign", desc: "Send an email to your audience", href: "/campaigns/new", icon: Mail, color: "bg-indigo-50 text-indigo-600" },
  { label: "Add Contacts", desc: "Import or add new contacts", href: "/audience/import", icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "New Template", desc: "Design a reusable template", href: "/templates/new", icon: FileText, color: "bg-violet-50 text-violet-600" },
  { label: "New Automation", desc: "Set up automated workflows", href: "/automations/new", icon: Zap, color: "bg-amber-50 text-amber-600" },
];

const statusConfig: Record<string, { label: string; variant: "success" | "secondary" | "default" | "warning" }> = {
  sent: { label: "Sent", variant: "success" },
  draft: { label: "Draft", variant: "secondary" },
  scheduled: { label: "Scheduled", variant: "default" },
  sending: { label: "Sending", variant: "warning" },
};

export default function DashboardPage() {
  const greeting = getGreeting();

  return (
    <div className="space-y-8 page-enter">
      {/* Greeting */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, User
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Here&apos;s what&apos;s happening with your marketing
          </p>
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
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="card-hover overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[13px] font-medium text-gray-500">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">
                    {kpi.format === "percentage"
                      ? formatPercentage(kpi.value)
                      : formatNumber(kpi.value)}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {kpi.deltaPositive ? (
                      <div className="flex items-center gap-0.5 text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs font-semibold">
                          +{kpi.format === "percentage" ? formatPercentage(kpi.delta) : kpi.delta}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5 text-red-500">
                        <TrendingDown className="h-3 w-3" />
                        <span className="text-xs font-semibold">
                          {kpi.format === "percentage" ? formatPercentage(kpi.delta) : kpi.delta}
                        </span>
                      </div>
                    )}
                    <span className="text-[11px] text-gray-400">{kpi.deltaLabel}</span>
                  </div>
                </div>
                <div className={`h-10 w-10 rounded-xl ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Email Performance Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Email Performance</CardTitle>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {["7d", "30d", "90d"].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    period === "30d"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56 flex items-center justify-center rounded-xl grid-bg">
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-6 mb-3 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-500">Sent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-gray-500">Opened</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-violet-500" />
                    <span className="text-xs text-gray-500">Clicked</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Connect your Brevo account to see real data</p>
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="mt-3 text-xs">
                    Connect Brevo
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Campaigns</CardTitle>
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-800 -mr-2">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentCampaigns.slice(0, 5).map((campaign) => (
              <Link
                key={campaign.id}
                href={campaign.status === "sent" ? `/campaigns/${campaign.id}/report` : `/campaigns/${campaign.id}/edit`}
                className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-xl hover:bg-gray-50/80 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                    {campaign.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={statusConfig[campaign.status].variant} className="text-[10px] py-0 px-1.5">
                      {statusConfig[campaign.status].label}
                    </Badge>
                    {campaign.sentDate && (
                      <span className="text-[11px] text-gray-400">
                        {campaign.sentDate}
                      </span>
                    )}
                    {campaign.recipients && (
                      <span className="text-[11px] text-gray-400">
                        {campaign.recipients}
                      </span>
                    )}
                  </div>
                </div>
                {campaign.openRate !== null && (
                  <div className="ml-3 text-right flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPercentage(campaign.openRate)}
                    </span>
                    <p className="text-[10px] text-gray-400">open rate</p>
                  </div>
                )}
              </Link>
            ))}
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
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {action.label}
                    </p>
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
