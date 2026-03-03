"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercentage } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const { contacts, campaigns } = useAppStore();
  const sentCampaigns = campaigns.filter((c) => c.status === "sent");
  const totalSent = sentCampaigns.length;
  const avgOpen = totalSent > 0 ? sentCampaigns.reduce((s, c) => s + (c.openRate || 0), 0) / totalSent : 0;
  const avgClick = totalSent > 0 ? sentCampaigns.reduce((s, c) => s + (c.clickRate || 0), 0) / totalSent : 0;

  const kpis = [
    { label: "Total Contacts", value: contacts.length, isPercent: false },
    { label: "Campaigns Sent", value: totalSent, isPercent: false },
    { label: "Avg Open Rate", value: avgOpen, isPercent: true },
    { label: "Avg Click Rate", value: avgClick, isPercent: true },
  ];

  if (contacts.length === 0 && campaigns.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <Card><CardContent className="py-16 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No data yet</h3>
          <p className="text-sm text-gray-500 mt-1">Send your first campaign to see analytics here</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}><CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.isPercent ? formatPercentage(kpi.value) : formatNumber(kpi.value)}</p>
          </CardContent></Card>
        ))}
      </div>

      {sentCampaigns.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Campaign Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentCampaigns.slice(0, 10).map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 truncate flex-1">{c.name}</span>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-blue-600">{formatPercentage(c.openRate || 0)} opens</span>
                    <span className="text-xs text-green-600">{formatPercentage(c.clickRate || 0)} clicks</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
