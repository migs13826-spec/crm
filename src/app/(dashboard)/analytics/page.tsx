"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercentage } from "@/lib/utils";

const overviewKpis = [
  { label: "Total Emails Sent", value: 45678, sub: "This month: 12,345" },
  { label: "Avg Open Rate", value: 24.3, isPercent: true, sub: "Industry avg: 21.5%" },
  { label: "Avg Click Rate", value: 3.8, isPercent: true, sub: "Industry avg: 2.6%" },
  { label: "List Growth Rate", value: 12.4, isPercent: true, sub: "+1,234 this month" },
];

const topCampaigns = [
  { name: "Welcome Email Series", openRate: 45.2, clickRate: 12.1 },
  { name: "Product Launch v3.0", openRate: 38.7, clickRate: 8.4 },
  { name: "Holiday Sale", openRate: 32.1, clickRate: 7.2 },
  { name: "Monthly Newsletter #45", openRate: 28.4, clickRate: 4.1 },
  { name: "Summer Sale", openRate: 24.3, clickRate: 3.8 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewKpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {kpi.isPercent ? formatPercentage(kpi.value) : formatNumber(kpi.value)}
              </p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <p className="text-sm">Bar chart comparing last 10 campaigns</p>
                <p className="text-xs text-gray-400 mt-1">Connect Brevo API for real data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <p className="text-sm">Open/click rate trends over 6 months</p>
                <p className="text-xs text-gray-400 mt-1">Connect Brevo API for real data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List Growth */}
        <Card>
          <CardHeader>
            <CardTitle>List Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
              <p className="text-sm">Subscriber count growth over time</p>
            </div>
          </CardContent>
        </Card>

        {/* Best Performing */}
        <Card>
          <CardHeader>
            <CardTitle>Best Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCampaigns.map((campaign, i) => (
                <div key={campaign.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium text-gray-400 w-5">{i + 1}</span>
                    <span className="text-sm text-gray-900 truncate">{campaign.name}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-blue-600">
                      {formatPercentage(campaign.openRate)} opens
                    </span>
                    <span className="text-xs text-green-600">
                      {formatPercentage(campaign.clickRate)} clicks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Time Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Best Send Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm">Day of week x hour heatmap showing best open rates</p>
              <p className="text-xs text-gray-400 mt-1">Requires campaign send time data from Brevo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
