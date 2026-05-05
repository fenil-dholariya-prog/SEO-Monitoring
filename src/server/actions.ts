"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { decryptToken } from "@/lib/auth/crypto";
import { clientSchema } from "@/lib/validators/client";
import { aiSearchSchema, backlinkWorkSchema, blogPlanSchema, onPageWorkSchema, reportCopySchema, reportSchema } from "@/lib/validators/report";
import { fetchGscCountryData, fetchGscDeviceData, fetchGscLowCtrPages, fetchGscOverview, fetchGscTopPages, fetchGscTopQueries } from "@/lib/google/gsc";
import { fetchGa4EcommerceData, fetchGa4LandingPages, fetchGa4LeadGenData, fetchGa4OrganicOverview } from "@/lib/google/ga4";
import { fetchAhrefsSnapshot } from "@/lib/ahrefs/client";
import { generateExecutiveSummary, generateNextMonthPlan } from "@/lib/insights/report-insights";
import { getPreviousReport, getReportWithRelations } from "@/server/queries";
import { requireUser } from "@/server/authz";

function dataFromForm(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function csvList(value?: string) {
  return (value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePlatformBreakdown(value?: string) {
  const lines = (value || "").split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.map((line) => {
    const [platform, traffic, sales, conversions] = line.split(",").map((part) => part.trim());
    return {
      platform,
      traffic: Number(traffic || 0),
      sales: Number(sales || 0),
      conversions: Number(conversions || 0),
    };
  });
}

export async function createClientAction(_state: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") return { error: "Only admins can manage clients." };
  const parsed = clientSchema.safeParse(dataFromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid client data." };

  await prisma.client.create({
    data: {
      ...parsed.data,
      agencyLogoUrl: parsed.data.agencyLogoUrl || null,
      clientLogoUrl: parsed.data.clientLogoUrl || null,
      gscPropertyUrl: parsed.data.gscPropertyUrl || null,
      ga4PropertyId: parsed.data.ga4PropertyId || null,
      ahrefsProjectId: parsed.data.ahrefsProjectId || null,
    },
  });
  revalidatePath("/clients");
  redirect("/clients");
}

export async function createReportAction(_state: unknown, formData: FormData) {
  await requireUser();
  const parsed = reportSchema.safeParse(dataFromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid report data." };

  const report = await prisma.report.upsert({
    where: {
      clientId_month_year: {
        clientId: parsed.data.clientId,
        month: parsed.data.month,
        year: parsed.data.year,
      },
    },
    update: {
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
    },
    create: {
      clientId: parsed.data.clientId,
      month: parsed.data.month,
      year: parsed.data.year,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
    },
  });
  revalidatePath("/reports");
  redirect(`/reports/${report.id}/builder`);
}

async function getAccessToken(userId: string) {
  const connection = await prisma.googleConnection.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return decryptToken(connection?.encryptedAccessToken);
}

export async function fetchReportDataAction(reportId: string) {
  const user = await requireUser();
  const report = await prisma.report.findUnique({ where: { id: reportId }, include: { client: true } });
  if (!report) return { error: "Report not found." };
  if (!report.client.gscPropertyUrl) return { error: "GSC property missing. Add it on the client profile first." };
  if (!report.client.ga4PropertyId) return { error: "GA4 property missing. Add it on the client profile first." };

  const accessToken = await getAccessToken(user.id);
  const gscOptions = {
    accessToken,
    propertyUrl: report.client.gscPropertyUrl,
    startDate: report.startDate,
    endDate: report.endDate,
  };
  const ga4Options = {
    accessToken,
    propertyId: report.client.ga4PropertyId,
    clientType: report.client.clientType,
    startDate: report.startDate,
    endDate: report.endDate,
  };

  const [overview, topQueries, topPages, lowCtrPages, deviceData, countryData, ga4Overview, landingPages, ecommerceData, leadGenData] =
    await Promise.all([
      fetchGscOverview(gscOptions),
      fetchGscTopQueries(gscOptions),
      fetchGscTopPages(gscOptions),
      fetchGscLowCtrPages(gscOptions),
      fetchGscDeviceData(gscOptions),
      fetchGscCountryData(gscOptions),
      fetchGa4OrganicOverview(ga4Options),
      fetchGa4LandingPages(ga4Options),
      fetchGa4EcommerceData(ga4Options),
      fetchGa4LeadGenData(ga4Options),
    ]);

  await prisma.gscSnapshot.upsert({
    where: { reportId },
    update: {
      clicks: overview.clicks,
      impressions: overview.impressions,
      ctr: overview.ctr,
      averagePosition: overview.averagePosition,
      topQueries,
      topPages,
      lowCtrOpportunities: lowCtrPages,
      keywordMovement: overview.keywordMovement,
      devicePerformance: deviceData,
      countryPerformance: countryData,
    },
    create: {
      reportId,
      clicks: overview.clicks,
      impressions: overview.impressions,
      ctr: overview.ctr,
      averagePosition: overview.averagePosition,
      topQueries,
      topPages,
      lowCtrOpportunities: lowCtrPages,
      keywordMovement: overview.keywordMovement,
      devicePerformance: deviceData,
      countryPerformance: countryData,
    },
  });

  await prisma.ga4Snapshot.upsert({
    where: { reportId },
    update: {
      organicUsers: ga4Overview.organicUsers,
      organicSessions: ga4Overview.organicSessions,
      engagedSessions: ga4Overview.engagedSessions,
      engagementRate: ga4Overview.engagementRate,
      conversions: ga4Overview.conversions,
      revenue: ga4Overview.revenue,
      transactions: ga4Overview.transactions,
      topLandingPages: landingPages,
      sourceMedium: ga4Overview.sourceMedium,
      ecommerceData: ecommerceData ?? undefined,
      leadGenData: leadGenData ?? undefined,
    },
    create: {
      reportId,
      organicUsers: ga4Overview.organicUsers,
      organicSessions: ga4Overview.organicSessions,
      engagedSessions: ga4Overview.engagedSessions,
      engagementRate: ga4Overview.engagementRate,
      conversions: ga4Overview.conversions,
      revenue: ga4Overview.revenue,
      transactions: ga4Overview.transactions,
      topLandingPages: landingPages,
      sourceMedium: ga4Overview.sourceMedium,
      ecommerceData: ecommerceData ?? undefined,
      leadGenData: leadGenData ?? undefined,
    },
  });

  await generateInsightsAction(reportId);
  revalidatePath(`/reports/${reportId}/builder`);
  return { ok: true };
}

export async function fetchAhrefsDataAction(reportId: string) {
  await requireUser();
  const report = await prisma.report.findUnique({ where: { id: reportId }, include: { client: true } });
  if (!report) return { error: "Report not found." };

  try {
    const snapshot = await fetchAhrefsSnapshot({
      target: report.client.websiteUrl,
      startDate: report.startDate,
      endDate: report.endDate,
      country: process.env.AHREFS_DEFAULT_COUNTRY,
    });
    const data = {
      target: snapshot.target,
      mode: snapshot.mode,
      domainRating: snapshot.domainRating,
      totalBacklinks: snapshot.totalBacklinks,
      newBacklinks: snapshot.newBacklinks,
      lostBacklinks: snapshot.lostBacklinks,
      referringDomains: snapshot.referringDomains,
      organicKeywords: snapshot.organicKeywords,
      organicTraffic: snapshot.organicTraffic,
      domainOverview: json(snapshot.domainOverview),
      backlinks: json(snapshot.backlinks),
      referringDomainsData: json(snapshot.referringDomainsData),
      lostBacklinksData: json(snapshot.lostBacklinksData),
      organicKeywordsData: json(snapshot.organicKeywordsData),
      competitorBacklinkGap: json(snapshot.competitorBacklinkGap),
      anchorTextDistribution: json(snapshot.anchorTextDistribution),
      topReferringPages: json(snapshot.topReferringPages),
      backlinkQualityNotes: json(snapshot.backlinkQualityNotes),
    };

    await prisma.ahrefsSnapshot.upsert({
      where: { reportId },
      update: data,
      create: {
        reportId,
        ...data,
      },
    });

    await generateInsightsAction(reportId);
    revalidatePath(`/reports/${reportId}/builder`);
    revalidatePath(`/reports/${reportId}/preview`);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return {
      error:
        "Ahrefs data could not be fetched. Check the API token, project access, quota, and selected reporting range.",
    };
  }
}

export async function generateInsightsAction(reportId: string) {
  await requireUser();
  const report = await getReportWithRelations(reportId);
  if (!report) return { error: "Report not found." };
  const previous = await getPreviousReport(report.clientId, report.month, report.year);
  const executiveSummary = generateExecutiveSummary(report, previous);
  const nextMonthFocus = generateNextMonthPlan(report);

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "GENERATED",
      executiveSummary,
      winsSummary:
        "SEO work improved visibility, strengthened priority pages, and created clearer paths from informational content to conversion pages.",
      issuesSummary:
        "High-impression pages with low click rate need focused metadata updates, and any pages losing traffic should be reviewed for content freshness and search intent.",
      nextMonthFocus,
    },
  });
  revalidatePath(`/reports/${reportId}`);
  return { ok: true };
}

export async function updateReportCopyAction(reportId: string, _state: unknown, formData: FormData) {
  await requireUser();
  const parsed = reportCopySchema.safeParse(dataFromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid report copy." };
  await prisma.report.update({ where: { id: reportId }, data: parsed.data });
  revalidatePath(`/reports/${reportId}`);
  return { ok: true };
}

export async function addOnPageWorkAction(_state: unknown, formData: FormData) {
  await requireUser();
  const parsed = onPageWorkSchema.safeParse(dataFromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid on-page work." };
  await prisma.onPageWork.create({ data: parsed.data });
  revalidatePath(`/reports/${parsed.data.reportId}/builder`);
  return { ok: true };
}

export async function addBacklinkWorkAction(_state: unknown, formData: FormData) {
  await requireUser();
  const parsed = backlinkWorkSchema.safeParse(dataFromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid backlink work." };
  await prisma.backlinkWork.create({ data: parsed.data });
  revalidatePath(`/reports/${parsed.data.reportId}/builder`);
  return { ok: true };
}

export async function addBlogPlanAction(_state: unknown, formData: FormData) {
  await requireUser();
  const parsed = blogPlanSchema.safeParse(dataFromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid blog plan." };
  await prisma.blogPlan.create({ data: parsed.data });
  revalidatePath(`/reports/${parsed.data.reportId}/builder`);
  return { ok: true };
}

export async function saveAiSearchReportAction(_state: unknown, formData: FormData) {
  await requireUser();
  const parsed = aiSearchSchema.safeParse(dataFromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid AI search report." };

  const platformBreakdown = parsePlatformBreakdown(parsed.data.platformBreakdown);
  const visiblePlatforms = csvList(parsed.data.visiblePlatforms);
  const topCitedPages = csvList(parsed.data.topCitedPages);

  await prisma.aiSearchSnapshot.upsert({
    where: { reportId: parsed.data.reportId },
    update: {
      includeInReport: parsed.data.includeInReport,
      aiTraffic: parsed.data.aiTraffic,
      aiSales: parsed.data.aiSales,
      aiConversions: parsed.data.aiConversions,
      aiRevenueCurrency: parsed.data.aiRevenueCurrency.toUpperCase(),
      platformBreakdown: json(platformBreakdown),
      visiblePlatforms: json(visiblePlatforms),
      topCitedPages: json(topCitedPages),
      notes: parsed.data.notes || null,
    },
    create: {
      reportId: parsed.data.reportId,
      includeInReport: parsed.data.includeInReport,
      aiTraffic: parsed.data.aiTraffic,
      aiSales: parsed.data.aiSales,
      aiConversions: parsed.data.aiConversions,
      aiRevenueCurrency: parsed.data.aiRevenueCurrency.toUpperCase(),
      platformBreakdown: json(platformBreakdown),
      visiblePlatforms: json(visiblePlatforms),
      topCitedPages: json(topCitedPages),
      notes: parsed.data.notes || null,
    },
  });
  revalidatePath(`/reports/${parsed.data.reportId}/builder`);
  revalidatePath(`/reports/${parsed.data.reportId}/preview`);
  return { ok: true, message: "AI search report saved." };
}

export async function toggleAiSearchInReportAction(reportId: string, includeInReport: boolean) {
  await requireUser();
  await prisma.aiSearchSnapshot.upsert({
    where: { reportId },
    update: { includeInReport },
    create: {
      reportId,
      includeInReport,
      aiTraffic: 0,
      aiSales: 0,
      aiConversions: 0,
      aiRevenueCurrency: "USD",
      platformBreakdown: [],
      visiblePlatforms: [],
      topCitedPages: [],
    },
  });
  revalidatePath(`/reports/${reportId}/builder`);
  revalidatePath(`/reports/${reportId}/preview`);
  return { ok: true };
}
