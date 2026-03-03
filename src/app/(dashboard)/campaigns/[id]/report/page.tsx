"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatNumber, formatPercentage } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function CampaignReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { campaigns } = useAppStore();
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/campaigns"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Report</h1>
        </div>
        <Card><CardContent className="py-16 text-center">
          <Mail className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Campaign not found</h3>
          <p className="text-sm text-gray-500 mt-1">This campaign may have been deleted</p>
          <Link href="/campaigns"><Button className="mt-4">Back to Campaigns</Button></Link>
        </CardContent></Card>
      </div>
    );
  }

  // Use campaign data or defaults for stats
  const openRate = campaign.openRate || 0;
  const clickRate = campaign.clickRate || 0;
  const unsubRate = campaign.unsubRate || 0;
  const estimatedRecipients = campaign.estimatedRecipients || 0;
  const delivered = Math.round(estimatedRecipients * 0.985);
  const opened = Math.round(delivered * (openRate / 100));
  const clicked = Math.round(delivered * (clickRate / 100));
  const unsubs = Math.round(delivered * (unsubRate / 100));
  const bounced = estimatedRecipients - delivered;

  const kpiCards = [
    { label: "Delivered", value: delivered, pct: estimatedRecipients > 0 ? (delivered / estimatedRecipients) * 100 : 0, color: "text-gray-900" },
    { label: "Opened", value: opened, pct: delivered > 0 ? (opened / delivered) * 100 : 0, color: "text-blue-600" },
    { label: "Clicked", value: clicked, pct: delivered > 0 ? (clicked / delivered) * 100 : 0, color: "text-green-600" },
    { label: "Unsubscribed", value: unsubs, pct: delivered > 0 ? (unsubs / delivered) * 100 : 0, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/campaigns"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-sm text-gray-500">
              {campaign.sentAt ? `Sent ${new Date(campaign.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "Draft"}
              {campaign.subject && ` - Subject: ${campaign.subject}`}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export Report</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}><CardContent className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{formatNumber(kpi.value)}</p>
            <p className="text-sm text-gray-400">{formatPercentage(kpi.pct)}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase">Bounced</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">{formatNumber(bounced)}</p>
          <p className="text-sm text-gray-400">{estimatedRecipients > 0 ? formatPercentage((bounced / estimatedRecipients) * 100) : "0%"}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Sent</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{formatNumber(estimatedRecipients)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase">Open Rate</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{formatPercentage(openRate)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase">Click Rate</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{formatPercentage(clickRate)}</p>
        </CardContent></Card>
      </div>

      {/* Engagement Chart placeholder */}
      <Card>
        <CardHeader><CardTitle>Engagement Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm">Opens & clicks chart over first 72 hours</p>
              <p className="text-xs text-gray-400 mt-1">Connect Brevo API for real-time engagement data</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Preview */}
      {campaign.htmlContent && (
        <Card>
          <CardHeader><CardTitle>Email Content</CardTitle></CardHeader>
          <CardContent>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-w-[600px] mx-auto">
              <iframe srcDoc={campaign.htmlContent} className="w-full border-0 min-h-[400px]" title="Email content" sandbox="allow-same-origin" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriber Activity */}
      <Card>
        <CardHeader><CardTitle>Subscriber Activity</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="opened">
            <TabsList>
              <TabsTrigger value="opened">Opened ({formatNumber(opened)})</TabsTrigger>
              <TabsTrigger value="clicked">Clicked ({formatNumber(clicked)})</TabsTrigger>
              <TabsTrigger value="bounced">Bounced ({bounced})</TabsTrigger>
              <TabsTrigger value="unsubscribed">Unsubscribed ({unsubs})</TabsTrigger>
            </TabsList>
            <TabsContent value="opened"><div className="py-8 text-center text-sm text-gray-500">Detailed activity data available when connected to Brevo API</div></TabsContent>
            <TabsContent value="clicked"><div className="py-8 text-center text-sm text-gray-500">Click activity from Brevo API</div></TabsContent>
            <TabsContent value="bounced"><div className="py-8 text-center text-sm text-gray-500">Bounce details from Brevo API</div></TabsContent>
            <TabsContent value="unsubscribed"><div className="py-8 text-center text-sm text-gray-500">Unsubscribe details from Brevo API</div></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
