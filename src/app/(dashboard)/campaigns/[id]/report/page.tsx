"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatNumber, formatPercentage } from "@/lib/utils";

const stats = {
  sent: 8234,
  delivered: 8112,
  uniqueOpens: 1972,
  totalOpens: 3456,
  uniqueClicks: 312,
  totalClicks: 567,
  unsubscribes: 8,
  hardBounces: 98,
  softBounces: 24,
  spamComplaints: 2,
};

const topLinks = [
  { url: "https://shop.acme.com/sale", clicks: 187, percentage: 60 },
  { url: "https://shop.acme.com/new", clicks: 89, percentage: 28.5 },
  { url: "https://acme.com/blog", clicks: 36, percentage: 11.5 },
];

const kpiCards = [
  { label: "Delivered", value: stats.delivered, pct: (stats.delivered / stats.sent) * 100, color: "text-gray-900" },
  { label: "Opened", value: stats.uniqueOpens, pct: (stats.uniqueOpens / stats.delivered) * 100, color: "text-blue-600" },
  { label: "Clicked", value: stats.uniqueClicks, pct: (stats.uniqueClicks / stats.delivered) * 100, color: "text-green-600" },
  { label: "Unsubscribed", value: stats.unsubscribes, pct: (stats.unsubscribes / stats.delivered) * 100, color: "text-red-600" },
  { label: "Bounced", value: stats.hardBounces + stats.softBounces, pct: ((stats.hardBounces + stats.softBounces) / stats.sent) * 100, color: "text-amber-600" },
  { label: "Spam Complaints", value: stats.spamComplaints, pct: (stats.spamComplaints / stats.delivered) * 100, color: "text-red-600" },
  { label: "Unique Opens", value: stats.uniqueOpens, pct: (stats.uniqueOpens / stats.delivered) * 100, color: "text-blue-600" },
  { label: "Unique Clicks", value: stats.uniqueClicks, pct: (stats.uniqueClicks / stats.delivered) * 100, color: "text-green-600" },
];

export default function CampaignReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Summer Sale Announcement</h1>
            <p className="text-sm text-gray-500">
              Sent Jun 10, 2025 at 2:30 PM - To: Newsletter (8,234)
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.slice(0, 4).map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>
                {formatNumber(kpi.value)}
              </p>
              <p className="text-sm text-gray-400">{formatPercentage(kpi.pct)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.slice(4).map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>
                {formatNumber(kpi.value)}
              </p>
              <p className="text-sm text-gray-400">{formatPercentage(kpi.pct)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm">Opens & clicks chart over first 72 hours</p>
              <p className="text-xs text-gray-400 mt-1">Connect Brevo API to see real data</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Links */}
      <Card>
        <CardHeader>
          <CardTitle>Top Links Clicked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topLinks.map((link, i) => (
              <div key={link.url} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-gray-400 w-6">{i + 1}.</span>
                  <span className="text-sm text-indigo-600 truncate">{link.url}</span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${link.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-20 text-right">
                    {link.clicks} clicks ({formatPercentage(link.percentage, 1)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscriber Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriber Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="opened">
            <TabsList>
              <TabsTrigger value="opened">Opened ({formatNumber(stats.uniqueOpens)})</TabsTrigger>
              <TabsTrigger value="clicked">Clicked ({formatNumber(stats.uniqueClicks)})</TabsTrigger>
              <TabsTrigger value="bounced">Bounced ({stats.hardBounces + stats.softBounces})</TabsTrigger>
              <TabsTrigger value="unsubscribed">Unsubscribed ({stats.unsubscribes})</TabsTrigger>
            </TabsList>
            <TabsContent value="opened">
              <div className="py-8 text-center text-sm text-gray-500">
                Detailed subscriber activity will load from Brevo API
              </div>
            </TabsContent>
            <TabsContent value="clicked">
              <div className="py-8 text-center text-sm text-gray-500">
                Click activity details from Brevo API
              </div>
            </TabsContent>
            <TabsContent value="bounced">
              <div className="py-8 text-center text-sm text-gray-500">
                Bounce details from Brevo API
              </div>
            </TabsContent>
            <TabsContent value="unsubscribed">
              <div className="py-8 text-center text-sm text-gray-500">
                Unsubscribe details from Brevo API
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Device Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Device & Client Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">By Device</p>
              <div className="space-y-2">
                {[
                  { label: "Mobile", pct: 50 },
                  { label: "Desktop", pct: 45 },
                  { label: "Tablet", pct: 5 },
                ].map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">{d.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.pct}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-10 text-right">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Top Email Clients</p>
              <div className="space-y-2">
                {[
                  { label: "Apple Mail", pct: 35 },
                  { label: "Gmail", pct: 28 },
                  { label: "Outlook", pct: 20 },
                  { label: "Other", pct: 17 },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-24">{c.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-10 text-right">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
