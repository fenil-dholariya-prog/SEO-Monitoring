import { google } from "googleapis";
import { mockGscData } from "@/lib/google/mock-data";

type FetchOptions = {
  accessToken?: string | null;
  propertyUrl?: string | null;
  startDate: Date;
  endDate: Date;
};

function shouldMock(options: FetchOptions) {
  return process.env.GOOGLE_API_MOCK_MODE !== "false" || !options.accessToken || !options.propertyUrl;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function querySearchAnalytics(options: FetchOptions, dimensions?: string[]) {
  if (shouldMock(options)) return null;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: options.accessToken });
  const webmasters = google.searchconsole({ version: "v1", auth });
  const response = await webmasters.searchanalytics.query({
    siteUrl: options.propertyUrl!,
    requestBody: {
      startDate: dateOnly(options.startDate),
      endDate: dateOnly(options.endDate),
      dimensions,
      rowLimit: 25,
    },
  });
  return response.data.rows ?? [];
}

export async function fetchGscOverview(options: FetchOptions) {
  const rows = await querySearchAnalytics(options);
  if (!rows) return mockGscData();
  const row = rows[0];
  return {
    ...mockGscData(),
    clicks: row?.clicks ?? 0,
    impressions: row?.impressions ?? 0,
    ctr: Number(((row?.ctr ?? 0) * 100).toFixed(2)),
    averagePosition: Number((row?.position ?? 0).toFixed(2)),
  };
}

export async function fetchGscTopQueries(options: FetchOptions) {
  const rows = await querySearchAnalytics(options, ["query"]);
  if (!rows) return mockGscData().topQueries;
  return rows.map((row) => ({
    query: row.keys?.[0] ?? "Unknown query",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: Number(((row.ctr ?? 0) * 100).toFixed(2)),
    position: Number((row.position ?? 0).toFixed(2)),
  }));
}

export async function fetchGscTopPages(options: FetchOptions) {
  const rows = await querySearchAnalytics(options, ["page"]);
  if (!rows) return mockGscData().topPages;
  return rows.map((row) => ({
    page: row.keys?.[0] ?? "Unknown page",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: Number(((row.ctr ?? 0) * 100).toFixed(2)),
    position: Number((row.position ?? 0).toFixed(2)),
  }));
}

export async function fetchGscDeviceData(options: FetchOptions) {
  const rows = await querySearchAnalytics(options, ["device"]);
  if (!rows) return mockGscData().devicePerformance;
  return rows.map((row) => ({ device: row.keys?.[0] ?? "unknown", clicks: row.clicks ?? 0, impressions: row.impressions ?? 0 }));
}

export async function fetchGscCountryData(options: FetchOptions) {
  const rows = await querySearchAnalytics(options, ["country"]);
  if (!rows) return mockGscData().countryPerformance;
  return rows.map((row) => ({ country: row.keys?.[0] ?? "unknown", clicks: row.clicks ?? 0, impressions: row.impressions ?? 0 }));
}

export async function fetchGscLowCtrPages(options: FetchOptions) {
  const pages = await fetchGscTopPages(options);
  return pages.filter((page) => page.impressions > 1000 && page.ctr < 3).slice(0, 10);
}
