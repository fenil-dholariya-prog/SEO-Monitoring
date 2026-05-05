import type { ClientType } from "@/generated/prisma/enums";

export function mockGscData() {
  return {
    clicks: 12840,
    impressions: 302400,
    ctr: 4.25,
    averagePosition: 11.8,
    topQueries: [
      { query: "seo pricing agency", clicks: 640, impressions: 9800, ctr: 6.53, position: 4.2, change: 14 },
      { query: "technical seo checklist", clicks: 520, impressions: 15100, ctr: 3.44, position: 8.8, change: 9 },
      { query: "local seo services", clicks: 410, impressions: 11200, ctr: 3.66, position: 9.4, change: -3 },
    ],
    topPages: [
      { page: "/services/seo", clicks: 1620, impressions: 34200, ctr: 4.74, position: 6.9 },
      { page: "/blog/technical-seo-checklist", clicks: 1180, impressions: 28400, ctr: 4.15, position: 8.1 },
      { page: "/contact", clicks: 540, impressions: 9900, ctr: 5.45, position: 5.7 },
    ],
    lowCtrOpportunities: [
      { page: "/services/local-seo", clicks: 220, impressions: 18600, ctr: 1.18, position: 8.6 },
      { page: "/blog/content-plan", clicks: 190, impressions: 14200, ctr: 1.34, position: 10.2 },
    ],
    keywordMovement: [
      { query: "seo audit service", previousPosition: 12.3, currentPosition: 7.9, movement: 4.4 },
      { query: "monthly seo report", previousPosition: 18.2, currentPosition: 13.1, movement: 5.1 },
      { query: "agency seo packages", previousPosition: 5.8, currentPosition: 9.5, movement: -3.7 },
    ],
    devicePerformance: [
      { device: "mobile", clicks: 8340, impressions: 218000 },
      { device: "desktop", clicks: 3910, impressions: 71800 },
      { device: "tablet", clicks: 590, impressions: 12600 },
    ],
    countryPerformance: [
      { country: "United States", clicks: 9140, impressions: 220500 },
      { country: "India", clicks: 1880, impressions: 42600 },
      { country: "United Kingdom", clicks: 1060, impressions: 24100 },
    ],
  };
}

export function mockGa4Data(clientType: ClientType) {
  const ecommerce = clientType === "ECOMMERCE";
  return {
    organicUsers: 19220,
    organicSessions: 23140,
    engagedSessions: 16080,
    engagementRate: 69.49,
    conversions: ecommerce ? 520 : 148,
    revenue: ecommerce ? 146800 : null,
    transactions: ecommerce ? 520 : null,
    topLandingPages: [
      { path: ecommerce ? "/collections/best-sellers" : "/services/seo", sessions: 4210, conversions: ecommerce ? 128 : 44, revenue: ecommerce ? 38200 : undefined },
      { path: ecommerce ? "/products/core-kit" : "/contact", sessions: 2650, conversions: ecommerce ? 76 : 36, revenue: ecommerce ? 24100 : undefined },
      { path: "/blog/guide", sessions: 2210, conversions: ecommerce ? 22 : 12, revenue: ecommerce ? 5200 : undefined },
    ],
    sourceMedium: [
      { source: "google / organic", sessions: 21140 },
      { source: "bing / organic", sessions: 1420 },
      { source: "yahoo / organic", sessions: 580 },
    ],
    ecommerceData: ecommerce
      ? {
          conversionRate: 2.25,
          topRevenueLandingPages: ["/collections/best-sellers", "/products/core-kit"],
          categoryOpportunities: ["/collections/new-arrivals", "/collections/sale"],
        }
      : null,
    leadGenData: ecommerce
      ? null
      : {
          formSubmissions: 82,
          phoneClicks: 46,
          whatsappClicks: 20,
          contactPageVisits: 520,
          servicePageSessions: 4820,
          locationPageSessions: 930,
        },
  };
}
