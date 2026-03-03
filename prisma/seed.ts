import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const pool = new pg.Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { id: "demo-org" },
    update: {},
    create: {
      id: "demo-org",
      name: "Acme Corp",
      slug: "acme-corp",
      industry: "Technology",
      companySize: "51-200",
      website: "https://acme.com",
      timezone: "UTC",
      primaryColor: "#6366F1",
    },
  });
  console.log(`Organization: ${org.name}`);

  // Seed contacts
  const contacts = [
    { email: "sarah@example.com", firstName: "Sarah", lastName: "Lee", phone: "+1 555-0101", company: "Acme Corp", lists: ["Newsletter Subscribers", "VIP Customers"], tags: ["VIP", "Engaged"], status: "subscribed" },
    { email: "john@example.com", firstName: "John", lastName: "Smith", phone: "+1 555-0102", company: "TechStart Inc", lists: ["Newsletter Subscribers"], tags: ["New"], status: "subscribed" },
    { email: "jane@example.com", firstName: "Jane", lastName: "Doe", phone: "", company: "Design Co", lists: ["Newsletter Subscribers"], tags: [], status: "unsubscribed" },
    { email: "mike@example.com", firstName: "Mike", lastName: "Brown", phone: "+1 555-0104", company: "", lists: [], tags: ["Enterprise"], status: "subscribed" },
    { email: "emma@example.com", firstName: "Emma", lastName: "Wilson", phone: "+1 555-0105", company: "Growth Labs", lists: ["VIP Customers"], tags: ["VIP"], status: "subscribed" },
    { email: "alex@example.com", firstName: "Alex", lastName: "Johnson", phone: "", company: "Startup XYZ", lists: ["Newsletter Subscribers", "Product Updates"], tags: [], status: "bounced" },
    { email: "priya@example.com", firstName: "Priya", lastName: "Sharma", phone: "+1 555-0107", company: "DataFlow", lists: ["Newsletter Subscribers"], tags: ["Engaged"], status: "subscribed" },
    { email: "marcus@example.com", firstName: "Marcus", lastName: "Chen", phone: "+1 555-0108", company: "RetailHub", lists: ["VIP Customers", "Newsletter Subscribers"], tags: ["VIP", "Enterprise"], status: "subscribed" },
  ];

  for (const c of contacts) {
    await prisma.contactCache.upsert({
      where: { organizationId_email: { organizationId: "demo-org", email: c.email } },
      update: {},
      create: {
        organizationId: "demo-org",
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone || null,
        company: c.company || null,
        listIds: c.lists,
        tags: c.tags,
        status: c.status,
        createdAtBrevo: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`Seeded ${contacts.length} contacts`);

  // Seed campaigns
  const campaignsData = [
    {
      name: "Summer Sale Announcement", status: "sent", subject: "Summer Sale - 50% off everything!", previewText: "Don't miss our biggest sale", senderName: "Acme Corp", senderEmail: "hello@acme.com", recipientType: "lists", listIds: ["Newsletter Subscribers"], estimatedRecipients: 8234, sentAt: new Date("2025-06-10T14:30:00Z"), htmlContent: "<h1>Summer Sale!</h1><p>50% off everything this week.</p>",
      stats: { sent: 8234, delivered: 8112, uniqueOpens: 1972, totalOpens: 3456, uniqueClicks: 312, totalClicks: 567, unsubscribes: 8, hardBounces: 98, softBounces: 24, openRate: 24.3, clickRate: 3.8 },
    },
    {
      name: "Product Update v3.2", status: "draft", subject: "", previewText: "", senderName: "Acme Corp", senderEmail: "hello@acme.com", recipientType: "", listIds: [], estimatedRecipients: 0, sentAt: null, htmlContent: "",
      stats: null,
    },
    {
      name: "Weekly Newsletter #46", status: "scheduled", subject: "This week in tech", previewText: "Your weekly digest", senderName: "Acme Corp", senderEmail: "hello@acme.com", recipientType: "lists", listIds: ["Newsletter Subscribers"], estimatedRecipients: 12847, sentAt: null, htmlContent: "<h1>Newsletter #46</h1>",
      stats: null,
    },
    {
      name: "Welcome Email Series", status: "sent", subject: "Welcome to Acme!", previewText: "We're glad you're here", senderName: "Acme Corp", senderEmail: "hello@acme.com", recipientType: "lists", listIds: ["Newsletter Subscribers"], estimatedRecipients: 456, sentAt: new Date("2025-06-05T08:00:00Z"), htmlContent: "<h1>Welcome!</h1>",
      stats: { sent: 456, delivered: 450, uniqueOpens: 206, totalOpens: 312, uniqueClicks: 55, totalClicks: 78, unsubscribes: 0, hardBounces: 4, softBounces: 2, openRate: 45.2, clickRate: 12.1 },
    },
  ];

  for (const c of campaignsData) {
    const campaign = await prisma.campaign.create({
      data: {
        organizationId: "demo-org",
        name: c.name,
        status: c.status,
        subject: c.subject || null,
        previewText: c.previewText || null,
        senderName: c.senderName,
        senderEmail: c.senderEmail,
        recipientType: c.recipientType || null,
        listIds: c.listIds,
        estimatedRecipients: c.estimatedRecipients,
        sentAt: c.sentAt,
        htmlContent: c.htmlContent || null,
        tags: [],
      },
    });

    if (c.stats) {
      await prisma.campaignStats.create({
        data: {
          campaignId: campaign.id,
          organizationId: "demo-org",
          sent: c.stats.sent,
          delivered: c.stats.delivered,
          uniqueOpens: c.stats.uniqueOpens,
          totalOpens: c.stats.totalOpens,
          uniqueClicks: c.stats.uniqueClicks,
          totalClicks: c.stats.totalClicks,
          unsubscribes: c.stats.unsubscribes,
          hardBounces: c.stats.hardBounces,
          softBounces: c.stats.softBounces,
          openRate: c.stats.openRate,
          clickRate: c.stats.clickRate,
        },
      });
    }
  }
  console.log(`Seeded ${campaignsData.length} campaigns`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
