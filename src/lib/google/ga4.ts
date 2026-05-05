import { google } from "googleapis";
import type { ClientType } from "@/generated/prisma/enums";
import { mockGa4Data } from "@/lib/google/mock-data";

type FetchOptions = {
  accessToken?: string | null;
  propertyId?: string | null;
  clientType: ClientType;
  startDate: Date;
  endDate: Date;
};

function shouldMock(options: FetchOptions) {
  return process.env.GOOGLE_API_MOCK_MODE !== "false" || !options.accessToken || !options.propertyId;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function runGa4Report(options: FetchOptions, metrics: string[], dimensions: string[] = []) {
  if (shouldMock(options)) return null;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: options.accessToken ?? undefined });
  const analyticsData = google.analyticsdata({ version: "v1beta", auth });
  const response = await analyticsData.properties.runReport({
    property: `properties/${options.propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: dateOnly(options.startDate), endDate: dateOnly(options.endDate) }],
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metrics.map((name) => ({ name })),
      dimensionFilter: {
        filter: {
          fieldName: "sessionDefaultChannelGroup",
          stringFilter: { value: "Organic Search" },
        },
      },
    },
  });
  return response.data.rows ?? [];
}

export async function fetchGa4OrganicOverview(options: FetchOptions) {
  const rows = await runGa4Report(options, ["activeUsers", "sessions", "engagedSessions", "engagementRate", "conversions"]);
  if (!rows) return mockGa4Data(options.clientType);
  const metrics = rows[0]?.metricValues ?? [];
  return {
    ...mockGa4Data(options.clientType),
    organicUsers: Number(metrics[0]?.value ?? 0),
    organicSessions: Number(metrics[1]?.value ?? 0),
    engagedSessions: Number(metrics[2]?.value ?? 0),
    engagementRate: Number((Number(metrics[3]?.value ?? 0) * 100).toFixed(2)),
    conversions: Number(metrics[4]?.value ?? 0),
  };
}

export async function fetchGa4LandingPages(options: FetchOptions) {
  const rows = await runGa4Report(options, ["sessions", "conversions"], ["landingPage"]);
  if (!rows) return mockGa4Data(options.clientType).topLandingPages;
  return rows.map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "/",
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
    conversions: Number(row.metricValues?.[1]?.value ?? 0),
  }));
}

export async function fetchGa4Conversions(options: FetchOptions) {
  const overview = await fetchGa4OrganicOverview(options);
  return overview.conversions;
}

export async function fetchGa4EcommerceData(options: FetchOptions) {
  if (options.clientType !== "ECOMMERCE") return null;
  const rows = await runGa4Report(options, ["purchaseRevenue", "transactions"], ["landingPage"]);
  if (!rows) return mockGa4Data(options.clientType).ecommerceData;
  return {
    topRevenueLandingPages: rows.slice(0, 10).map((row) => row.dimensionValues?.[0]?.value ?? "/"),
    revenue: rows.reduce((sum, row) => sum + Number(row.metricValues?.[0]?.value ?? 0), 0),
    transactions: rows.reduce((sum, row) => sum + Number(row.metricValues?.[1]?.value ?? 0), 0),
  };
}

export async function fetchGa4LeadGenData(options: FetchOptions) {
  if (options.clientType !== "LEAD_GENERATION") return null;
  if (shouldMock(options)) return mockGa4Data(options.clientType).leadGenData;
  return {
    formSubmissions: await fetchGa4Conversions(options),
    phoneClicks: 0,
    whatsappClicks: 0,
    contactPageVisits: 0,
  };
}
