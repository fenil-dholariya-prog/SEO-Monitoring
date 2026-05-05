import { mockAhrefsData } from "@/lib/ahrefs/mock-data";

type AhrefsOptions = {
  target: string;
  startDate: Date;
  endDate: Date;
  country?: string | null;
  competitors?: string[];
};

type AhrefsRequest = AhrefsOptions & {
  endpoint: string;
  params?: Record<string, string | number | undefined>;
};

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shouldMock() {
  return process.env.NODE_ENV !== "production" && (process.env.AHREFS_API_MOCK_MODE !== "false" || !process.env.AHREFS_API_TOKEN);
}

function normalizeTarget(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  }
}

async function ahrefsGet<T>({ endpoint, target, startDate, endDate, country, params }: AhrefsRequest): Promise<T | null> {
  if (shouldMock()) return null;
  const token = process.env.AHREFS_API_TOKEN;
  if (!token) {
    throw new Error("Ahrefs API token is required when mock mode is disabled.");
  }

  const url = new URL(`${process.env.AHREFS_API_BASE_URL || "https://api.ahrefs.com/v3"}/${endpoint}`);
  url.searchParams.set("target", normalizeTarget(target));
  url.searchParams.set("mode", "domain");
  url.searchParams.set("output", "json");
  void startDate;
  void endDate;
  if (country) url.searchParams.set("country", country);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ahrefs API request failed (${response.status}): ${body.slice(0, 300)}`);
  }

  return (await response.json()) as T;
}

function unwrapRows(value: unknown) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.rows)) return record.rows;
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.backlinks)) return record.backlinks;
    if (Array.isArray(record.refdomains)) return record.refdomains;
    if (Array.isArray(record.anchors)) return record.anchors;
    if (Array.isArray(record.keywords)) return record.keywords;
    if (Array.isArray(record.competitors)) return record.competitors;
  }
  return [];
}

export async function fetchAhrefsDomainOverview(options: AhrefsOptions) {
  const [domainRating, backlinkStats, metrics] = await Promise.all([
    ahrefsGet<Record<string, unknown>>({
      ...options,
      endpoint: "site-explorer/domain-rating",
    }),
    ahrefsGet<Record<string, unknown>>({
      ...options,
      endpoint: "site-explorer/backlinks-stats",
    }),
    ahrefsGet<Record<string, unknown>>({
      ...options,
      endpoint: "site-explorer/metrics",
      params: { select: "org_keywords,org_traffic" },
    }),
  ]);

  if (!domainRating && !backlinkStats && !metrics) return mockAhrefsData().domainOverview;
  return {
    ...(domainRating ?? {}),
    ...(backlinkStats ?? {}),
    ...(metrics ?? {}),
  };
}

export async function fetchAhrefsBacklinks(options: AhrefsOptions) {
  const data = await ahrefsGet<unknown>({
    ...options,
    endpoint: "site-explorer/all-backlinks",
    params: {
      limit: 50,
      history: `since:${dateOnly(options.startDate)}`,
      select: "url_from,url_to,anchor,domain_rating_source,first_seen,link_type,traffic_domain",
      order_by: "domain_rating_source:desc",
    },
  });
  return data
    ? unwrapRows(data)
        .filter((row) => Boolean((row as Record<string, unknown>).last_seen))
        .map((row) => {
        const item = row as Record<string, unknown>;
        return {
          sourceUrl: item.url_from,
          targetUrl: item.url_to,
          anchorText: item.anchor,
          domainRating: item.domain_rating_source,
          firstSeen: item.first_seen,
          linkType: item.link_type,
          traffic: item.traffic_domain,
        };
      })
    : mockAhrefsData().backlinks;
}

export async function fetchAhrefsReferringDomains(options: AhrefsOptions) {
  const data = await ahrefsGet<unknown>({
    ...options,
    endpoint: "site-explorer/refdomains",
    params: {
      limit: 50,
      history: `since:${dateOnly(options.startDate)}`,
      select: "domain,domain_rating,links_to_target,new_links,lost_links,first_seen,traffic_domain,is_spam",
      order_by: "domain_rating:desc",
    },
  });
  return data
    ? unwrapRows(data).map((row) => {
        const item = row as Record<string, unknown>;
        return {
          domain: item.domain,
          domainRating: item.domain_rating,
          backlinks: item.links_to_target,
          newLinks: item.new_links,
          lostLinks: item.lost_links,
          firstSeen: item.first_seen,
          traffic: item.traffic_domain,
          isSpam: item.is_spam,
        };
      })
    : mockAhrefsData().referringDomainsData;
}

export async function fetchAhrefsLostBacklinks(options: AhrefsOptions) {
  const data = await ahrefsGet<unknown>({
    ...options,
    endpoint: "site-explorer/all-backlinks",
    params: {
      limit: 50,
      history: `since:${dateOnly(options.startDate)}`,
      select: "url_from,url_to,anchor,domain_rating_source,last_seen,lost_reason,traffic_domain",
      order_by: "last_seen:desc",
    },
  });
  return data
    ? unwrapRows(data).map((row) => {
        const item = row as Record<string, unknown>;
        return {
          sourceUrl: item.url_from,
          targetUrl: item.url_to,
          anchorText: item.anchor,
          domainRating: item.domain_rating_source,
          lostDate: item.last_seen,
          lostReason: item.lost_reason,
          traffic: item.traffic_domain,
        };
      })
    : mockAhrefsData().lostBacklinksData;
}

export async function fetchAhrefsOrganicKeywords(options: AhrefsOptions) {
  const data = await ahrefsGet<unknown>({
    ...options,
    endpoint: "site-explorer/organic-keywords",
    country: options.country || process.env.AHREFS_DEFAULT_COUNTRY || "us",
    params: {
      limit: 50,
      select: "keyword,best_position,volume,traffic",
      order_by: "traffic:desc",
    },
  });
  return data
    ? unwrapRows(data).map((row) => {
        const item = row as Record<string, unknown>;
        return {
          keyword: item.keyword,
          position: item.best_position,
          volume: item.volume,
          traffic: item.traffic,
        };
      })
    : mockAhrefsData().organicKeywordsData;
}

export async function fetchAhrefsCompetitorBacklinkGap(options: AhrefsOptions) {
  const data = await ahrefsGet<unknown>({
    ...options,
    endpoint: "site-explorer/organic-competitors",
    country: options.country || process.env.AHREFS_DEFAULT_COUNTRY || "us",
    params: { limit: 25, select: "domain,domain_rating,keywords_common,traffic_competitor" },
  });
  return data
    ? unwrapRows(data).map((row) => {
        const item = row as Record<string, unknown>;
        return {
          referringPage: item.domain,
          competitorUrl: item.domain,
          domainRating: item.domain_rating,
          opportunity: "Review this organic competitor's referring domains for outreach opportunities.",
        };
      })
    : mockAhrefsData().competitorBacklinkGap;
}

export async function fetchAhrefsAnchorTextReport(options: AhrefsOptions) {
  const data = await ahrefsGet<unknown>({
    ...options,
    endpoint: "site-explorer/anchors",
    params: {
      limit: 50,
      history: `since:${dateOnly(options.startDate)}`,
      select: "anchor,links_to_target,new_links,lost_links,refdomains,top_domain_rating",
      order_by: "links_to_target:desc",
    },
  });
  return data
    ? unwrapRows(data).map((row) => {
        const item = row as Record<string, unknown>;
        return {
          anchorText: item.anchor,
          backlinks: item.links_to_target,
          newLinks: item.new_links,
          lostLinks: item.lost_links,
          referringDomains: item.refdomains,
          topDomainRating: item.top_domain_rating,
        };
      })
    : mockAhrefsData().anchorTextDistribution;
}

export async function fetchAhrefsSnapshot(options: AhrefsOptions) {
  const [domainOverview, backlinks, referringDomainsData, lostBacklinksData, organicKeywordsData, competitorBacklinkGap, anchorTextDistribution] =
    await Promise.all([
      fetchAhrefsDomainOverview(options),
      fetchAhrefsBacklinks(options),
      fetchAhrefsReferringDomains(options),
      fetchAhrefsLostBacklinks(options),
      fetchAhrefsOrganicKeywords(options),
      fetchAhrefsCompetitorBacklinkGap(options),
      fetchAhrefsAnchorTextReport(options),
    ]);

  const overview = domainOverview as Record<string, unknown>;
  const topReferringPages = [...backlinks]
    .sort((a, b) => Number((b as Record<string, unknown>).domainRating ?? (b as Record<string, unknown>).domain_rating ?? 0) - Number((a as Record<string, unknown>).domainRating ?? (a as Record<string, unknown>).domain_rating ?? 0))
    .slice(0, 10);

  return {
    target: normalizeTarget(options.target),
    mode: "domain",
    domainRating: Number(overview.domainRating ?? overview.domain_rating ?? overview.domain_rating_target ?? 0),
    totalBacklinks: Number(overview.totalBacklinks ?? overview.backlinks ?? overview.live_links ?? backlinks.length),
    newBacklinks: backlinks.length,
    lostBacklinks: lostBacklinksData.length,
    referringDomains: Number(overview.referringDomains ?? overview.refdomains ?? overview.live_refdomains ?? referringDomainsData.length),
    organicKeywords: Number(overview.organicKeywords ?? overview.org_keywords ?? overview.organic_keywords ?? organicKeywordsData.length),
    organicTraffic: Number(overview.organicTraffic ?? overview.org_traffic ?? overview.organic_traffic ?? 0),
    domainOverview,
    backlinks,
    referringDomainsData,
    lostBacklinksData,
    organicKeywordsData,
    competitorBacklinkGap,
    anchorTextDistribution,
    topReferringPages,
    backlinkQualityNotes: mockAhrefsData().backlinkQualityNotes,
  };
}
