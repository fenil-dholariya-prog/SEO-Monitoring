import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDefaultSitePassword, hashSitePassword } from "../src/lib/auth/site-password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "ADMIN" },
    create: {
      name: "Agency Admin",
      email: "admin@example.com",
      role: "ADMIN",
    },
  });

  await prisma.appSetting.upsert({
    where: { key: "site_access_password_hash" },
    update: {},
    create: {
      key: "site_access_password_hash",
      value: hashSitePassword(getDefaultSitePassword()),
    },
  });

  const ecommerce = await prisma.client.upsert({
    where: { id: "demo-ecommerce-client" },
    update: {},
    create: {
      id: "demo-ecommerce-client",
      name: "Northstar Outfitters",
      websiteUrl: "https://northstar.example.com",
      clientType: "ECOMMERCE",
      industry: "Outdoor retail",
      targetCountry: "United States",
      brandColor: "#0f766e",
      agencyLogoUrl: "/placeholder-agency.svg",
      clientLogoUrl: "/placeholder-client.svg",
      gscPropertyUrl: "sc-domain:northstar.example.com",
      ga4PropertyId: "123456789",
    },
  });

  const leadGen = await prisma.client.upsert({
    where: { id: "demo-lead-client" },
    update: {},
    create: {
      id: "demo-lead-client",
      name: "CivicStone Legal",
      websiteUrl: "https://civicstone.example.com",
      clientType: "LEAD_GENERATION",
      industry: "Legal services",
      targetCountry: "United States",
      brandColor: "#7c3aed",
      agencyLogoUrl: "/placeholder-agency.svg",
      clientLogoUrl: "/placeholder-client.svg",
      gscPropertyUrl: "https://civicstone.example.com/",
      ga4PropertyId: "987654321",
    },
  });

  await createDemoReport(ecommerce.id, 4, 2026, "ECOMMERCE");
  await createDemoReport(leadGen.id, 4, 2026, "LEAD_GENERATION");

  console.log(`Seeded demo data for ${admin.email}`);
}

async function createDemoReport(
  clientId: string,
  month: number,
  year: number,
  clientType: "ECOMMERCE" | "LEAD_GENERATION",
) {
  const report = await prisma.report.upsert({
    where: { clientId_month_year: { clientId, month, year } },
    update: {},
    create: {
      clientId,
      month,
      year,
      startDate: new Date(Date.UTC(year, month - 1, 1)),
      endDate: new Date(Date.UTC(year, month, 0)),
      status: "GENERATED",
      executiveSummary:
        "Organic visibility improved this month, with stronger search demand and practical on-page improvements supporting future growth.",
      winsSummary:
        "Keyword visibility improved, priority pages received updates, and fresh authority-building links were added.",
      issuesSummary:
        "Several high-impression pages still need stronger titles and descriptions to convert visibility into clicks.",
      nextMonthFocus:
        "Improve CTR on priority pages, publish planned content, and keep building links to commercial pages.",
    },
  });

  await prisma.gscSnapshot.upsert({
    where: { reportId: report.id },
    update: {},
    create: {
      reportId: report.id,
      clicks: 12480,
      impressions: 284000,
      ctr: 4.39,
      averagePosition: 12.7,
      topQueries: [
        { query: "winter hiking boots", clicks: 940, impressions: 8900, ctr: 10.56, position: 3.8, change: 18 },
        { query: "waterproof trail jacket", clicks: 610, impressions: 12200, ctr: 5, position: 7.4, change: 11 },
        { query: "family lawyer near me", clicks: 382, impressions: 6500, ctr: 5.88, position: 5.6, change: 9 },
      ],
      topPages: [
        { page: "/collections/winter", clicks: 1840, impressions: 42100, ctr: 4.37, position: 8.1 },
        { page: "/services/family-law", clicks: 820, impressions: 18200, ctr: 4.51, position: 6.8 },
        { page: "/blog/seo-guide", clicks: 520, impressions: 15400, ctr: 3.38, position: 11.3 },
      ],
      lowCtrOpportunities: [
        { page: "/collections/rain-jackets", impressions: 31000, clicks: 620, ctr: 2, position: 8.9 },
        { page: "/services/business-contracts", impressions: 12900, clicks: 180, ctr: 1.4, position: 9.7 },
      ],
      keywordMovement: [
        { query: "best hiking boots", previousPosition: 10.4, currentPosition: 6.1, movement: 4.3 },
        { query: "legal consultation", previousPosition: 7.2, currentPosition: 11.8, movement: -4.6 },
      ],
      devicePerformance: [
        { device: "mobile", clicks: 8200, impressions: 192000 },
        { device: "desktop", clicks: 3600, impressions: 76000 },
        { device: "tablet", clicks: 680, impressions: 16000 },
      ],
      countryPerformance: [
        { country: "United States", clicks: 9100, impressions: 205000 },
        { country: "Canada", clicks: 1480, impressions: 33400 },
      ],
    },
  });

  await prisma.ga4Snapshot.upsert({
    where: { reportId: report.id },
    update: {},
    create: {
      reportId: report.id,
      organicUsers: 18520,
      organicSessions: 22140,
      engagedSessions: 15380,
      engagementRate: 69.47,
      conversions: clientType === "ECOMMERCE" ? 486 : 132,
      revenue: clientType === "ECOMMERCE" ? 128400 : null,
      transactions: clientType === "ECOMMERCE" ? 486 : null,
      topLandingPages: [
        { path: "/collections/winter", sessions: 4200, conversions: 96, revenue: 28400 },
        { path: "/blog/checklist", sessions: 2600, conversions: 22, revenue: 4800 },
        { path: "/services/family-law", sessions: 1880, conversions: 38 },
      ],
      sourceMedium: [
        { source: "google / organic", sessions: 20100 },
        { source: "bing / organic", sessions: 1440 },
        { source: "duckduckgo / organic", sessions: 600 },
      ],
      ecommerceData:
        clientType === "ECOMMERCE"
          ? { conversionRate: 2.19, topRevenuePages: ["/collections/winter", "/products/alpine-parka"] }
          : undefined,
      leadGenData:
        clientType === "LEAD_GENERATION"
          ? { formSubmissions: 74, phoneClicks: 38, whatsappClicks: 20, contactPageVisits: 412 }
          : undefined,
    },
  });


  await prisma.aiSearchSnapshot.upsert({
    where: { reportId: report.id },
    update: {},
    create: {
      reportId: report.id,
      includeInReport: true,
      aiTraffic: clientType === "ECOMMERCE" ? 420 : 160,
      aiSales: clientType === "ECOMMERCE" ? 18400 : 0,
      aiConversions: clientType === "ECOMMERCE" ? 34 : 11,
      aiRevenueCurrency: "USD",
      visiblePlatforms: ["ChatGPT", "Perplexity", "Google AI Overviews", "Gemini"],
      platformBreakdown: [
        { platform: "ChatGPT", traffic: 180, sales: clientType === "ECOMMERCE" ? 9200 : 0, conversions: clientType === "ECOMMERCE" ? 14 : 5 },
        { platform: "Perplexity", traffic: 120, sales: clientType === "ECOMMERCE" ? 5400 : 0, conversions: clientType === "ECOMMERCE" ? 9 : 3 },
        { platform: "Google AI Overviews", traffic: 95, sales: clientType === "ECOMMERCE" ? 3000 : 0, conversions: clientType === "ECOMMERCE" ? 8 : 2 },
      ],
      topCitedPages: [clientType === "ECOMMERCE" ? "/collections/winter" : "/services/family-law", "/blog/checklist"],
      notes: "AI visibility is emerging as a measurable assisted traffic source. Continue monitoring cited pages and platform-level conversions.",
    },
  });

  await prisma.onPageWork.createMany({
    data: [
      {
        reportId: report.id,
        pageUrl: "/collections/winter",
        workType: "Meta update",
        title: "Improved collection title and description",
        description: "Updated the title and meta description to clarify product value and seasonal intent.",
        status: "Completed",
        impact: "Expected to improve click rate on a high-impression page.",
      },
      {
        reportId: report.id,
        pageUrl: "/blog/checklist",
        workType: "Internal linking",
        title: "Added links to commercial pages",
        description: "Added contextual links from informational content to priority conversion pages.",
        status: "Completed",
        impact: "Supports discovery and authority flow to target pages.",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.backlinkWork.createMany({
    data: [
      {
        reportId: report.id,
        backlinkUrl: "https://industry.example.com/resources",
        targetUrl: "/collections/winter",
        anchorText: "winter outdoor gear",
        domainRating: 48,
        linkType: "Resource link",
        status: "Live",
        notes: "Relevant industry directory placement.",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.blogPlan.createMany({
    data: [
      {
        reportId: report.id,
        topic: clientType === "ECOMMERCE" ? "How to choose winter hiking boots" : "What to prepare before a legal consultation",
        targetKeyword: clientType === "ECOMMERCE" ? "winter hiking boots" : "legal consultation checklist",
        searchIntent: "Informational",
        targetPage: clientType === "ECOMMERCE" ? "/collections/winter-boots" : "/contact",
        status: "Planned",
        notes: "Include internal links to priority conversion pages.",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
