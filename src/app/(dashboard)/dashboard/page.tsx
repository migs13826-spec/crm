"use client";

import Link from "next/link";
import {
  Users,
  Mail,
  Eye,
  MousePointerClick,
  ArrowUpRight,
  FileText,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercentage } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const statusVariant: Record<string, "success" | "secondary" | "default" | "warning"> = {
  sent: "success",
  draft: "secondary",
  scheduled: "default",
  sending: "warning",
};

const quickActions = [
  { label: "Create Campaign", href: "/campaigns/new", icon: Mail },
  { label: "Add Contacts", href: "/audience/import", icon: Users },
  { label: "New Template", href: "/templates/new", icon: FileText },
  { label: "New Automation", href: "/automations/new", icon: Zap },
];

export default function DashboardPage() {
  const { contacts, campaigns } = useAppStore();
  const greeting = getGreeting();

  const sentCampaigns = campaigns.filter((c) => c.status === "sent");
  const avgOpen = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / sentCampaigns.length
    : 0;
  const avgClick = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) / sentCampaigns.length
    : 0;

  const kpiCards = [
    { title: "Total Contacts", value: contacts.length, icon: Users, format: "number" as const },
    { title: "Campaigns Sent", value: sentCampaigns.length, icon: Mail, format: "number" as const },
    { title: "Avg Open Rate", value: avgOpen, icon: Eye, format: "percentage" as const },
    { title: "Avg Click Rate", value: avgClick, icon: MousePointerClick, format: "percentage" as const },
  ];

  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, User</h1>
        <p className="text-gray-500 mt-1">Here&apos;s how your marketing is performing</p>
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
                  {kpi.format === "percentage" ? formatPercentage(kpi.value) : formatNumber(kpi.value)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Campaigns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Campaigns</CardTitle>
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No campaigns yet</p>
                <Link href="/campaigns/new">
                  <Button size="sm" className="mt-3">Create your first campaign</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={campaign.status === "sent" ? `/campaigns/${campaign.id}/report` : `/campaigns/${campaign.id}/edit`}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded-md transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{campaign.name}</p>
                      <Badge variant={statusVariant[campaign.status] || "secondary"} className="text-[10px] mt-0.5">
                        {campaign.status}
                      </Badge>
                    </div>
                    {campaign.openRate != null && (
                      <span className="text-sm font-medium text-gray-600 ml-3">
                        {formatPercentage(campaign.openRate)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
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
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
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
