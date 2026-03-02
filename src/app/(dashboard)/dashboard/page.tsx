"use client";

import Link from "next/link";
import {
  Users,
  Mail,
  Eye,
  MousePointerClick,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Zap,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercentage } from "@/lib/utils";

// Mock data for dashboard KPIs
const kpiCards = [
  {
    title: "Total Contacts",
    value: 12847,
    delta: 12,
    deltaPositive: true,
    icon: Users,
    format: "number" as const,
  },
  {
    title: "Campaigns Sent",
    value: 34,
    delta: 5,
    deltaPositive: true,
    icon: Mail,
    format: "number" as const,
  },
  {
    title: "Avg Open Rate",
    value: 24.3,
    delta: 1.2,
    deltaPositive: true,
    icon: Eye,
    format: "percentage" as const,
  },
  {
    title: "Avg Click Rate",
    value: 3.8,
    delta: -0.3,
    deltaPositive: false,
    icon: MousePointerClick,
    format: "percentage" as const,
  },
];

const recentCampaigns = [
  {
    id: "1",
    name: "Summer Sale Announcement",
    status: "sent",
    openRate: 24.3,
    sentDate: "2 days ago",
    recipients: 8234,
  },
  {
    id: "2",
    name: "Product Update v3.2",
    status: "draft",
    openRate: null,
    sentDate: null,
    recipients: null,
  },
  {
    id: "3",
    name: "Weekly Newsletter #46",
    status: "scheduled",
    openRate: null,
    sentDate: "Jun 15 at 10:00 AM",
    recipients: 12847,
  },
  {
    id: "4",
    name: "Welcome Email Series",
    status: "sent",
    openRate: 45.2,
    sentDate: "5 days ago",
    recipients: 456,
  },
  {
    id: "5",
    name: "Flash Sale - 48hr Only",
    status: "sent",
    openRate: 19.1,
    sentDate: "1 week ago",
    recipients: 8234,
  },
];

const quickActions = [
  { label: "Create Campaign", href: "/campaigns/new", icon: Mail },
  { label: "Add Contacts", href: "/audience/import", icon: Users },
  { label: "New Template", href: "/templates/new", icon: FileText },
  { label: "New Automation", href: "/automations/new", icon: Zap },
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
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, User
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s how your marketing is performing
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <kpi.icon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold text-gray-900">
                  {kpi.format === "percentage"
                    ? formatPercentage(kpi.value)
                    : formatNumber(kpi.value)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.deltaPositive ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      kpi.deltaPositive ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {kpi.deltaPositive ? "+" : ""}
                    {kpi.format === "percentage"
                      ? formatPercentage(kpi.delta)
                      : kpi.delta}
                  </span>
                  <span className="text-xs text-gray-400">vs last 30 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Performance Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Email Performance</CardTitle>
            <div className="flex gap-1">
              {["7d", "30d", "90d"].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    period === "30d"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <BarChartPlaceholder />
                <p className="mt-2 text-sm">
                  Email performance chart will display here
                </p>
                <p className="text-xs text-gray-400">
                  Connect Brevo API to see real data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Campaigns</CardTitle>
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCampaigns.slice(0, 5).map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}/report`}
                className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded-md transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {campaign.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={statusConfig[campaign.status].variant} className="text-[10px] py-0">
                      {statusConfig[campaign.status].label}
                    </Badge>
                    {campaign.sentDate && (
                      <span className="text-xs text-gray-400">
                        {campaign.sentDate}
                      </span>
                    )}
                  </div>
                </div>
                {campaign.openRate !== null && (
                  <span className="text-sm font-medium text-gray-600 ml-3">
                    {formatPercentage(campaign.openRate)}
                  </span>
                )}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Audience Growth + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audience Growth Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Audience Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <AreaChartPlaceholder />
                <p className="mt-2 text-sm">
                  Audience growth chart will display here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-l-2 hover:border-l-indigo-500 transition-all text-left">
                  <action.icon className="h-5 w-5" />
                  {action.label}
                </button>
              </Link>
            ))}
          </CardContent>
        </Card>
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

function BarChartPlaceholder() {
  return (
    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 48 48">
      <rect x="6" y="24" width="6" height="18" rx="1" fill="#E5E7EB" />
      <rect x="15" y="16" width="6" height="26" rx="1" fill="#C7D2FE" />
      <rect x="24" y="20" width="6" height="22" rx="1" fill="#E5E7EB" />
      <rect x="33" y="12" width="6" height="30" rx="1" fill="#C7D2FE" />
    </svg>
  );
}

function AreaChartPlaceholder() {
  return (
    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 48 48">
      <path d="M6 36L14 28L22 32L30 20L42 24V42H6V36Z" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
      <path d="M6 36L14 28L22 32L30 20L42 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
