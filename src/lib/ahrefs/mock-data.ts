export function mockAhrefsData() {
  return {
    target: "example.com",
    mode: "domain",
    domainOverview: {
      domainRating: 58,
      totalBacklinks: 18420,
      referringDomains: 1260,
      organicKeywords: 8420,
      organicTraffic: 68400,
    },
    backlinks: [
      {
        sourceUrl: "https://industry.example.com/best-resources",
        targetUrl: "/services/seo",
        anchorText: "seo agency services",
        domainRating: 72,
        firstSeen: "2026-04-08",
        linkType: "dofollow",
      },
      {
        sourceUrl: "https://partner.example.com/guides/marketing",
        targetUrl: "/blog/technical-seo-checklist",
        anchorText: "technical SEO checklist",
        domainRating: 54,
        firstSeen: "2026-04-18",
        linkType: "dofollow",
      },
    ],
    referringDomainsData: [
      { domain: "industry.example.com", domainRating: 72, backlinks: 8, firstSeen: "2026-04-08" },
      { domain: "partner.example.com", domainRating: 54, backlinks: 4, firstSeen: "2026-04-18" },
      { domain: "localpress.example.com", domainRating: 47, backlinks: 2, firstSeen: "2026-04-23" },
    ],
    lostBacklinksData: [
      {
        sourceUrl: "https://old-directory.example.com/listing",
        targetUrl: "/services/seo",
        anchorText: "SEO company",
        domainRating: 31,
        lostDate: "2026-04-15",
      },
    ],
    organicKeywordsData: [
      { keyword: "seo monthly report", position: 6, volume: 1200, traffic: 260 },
      { keyword: "technical seo checklist", position: 8, volume: 2400, traffic: 380 },
      { keyword: "local seo services", position: 11, volume: 1900, traffic: 180 },
    ],
    competitorBacklinkGap: [
      {
        referringPage: "https://saas-list.example.com/best-seo-tools",
        competitorUrl: "https://competitor.example.com",
        domainRating: 68,
        opportunity: "Relevant list page links to competitors but not this client.",
      },
      {
        referringPage: "https://marketing-roundup.example.com/resources",
        competitorUrl: "https://another-competitor.example.com",
        domainRating: 61,
        opportunity: "Resource roundup is a good outreach candidate.",
      },
    ],
    anchorTextDistribution: [
      { anchorText: "brand", backlinks: 620, share: 42 },
      { anchorText: "seo agency services", backlinks: 180, share: 12 },
      { anchorText: "technical SEO checklist", backlinks: 90, share: 6 },
      { anchorText: "generic", backlinks: 530, share: 36 },
    ],
    topReferringPages: [
      { sourceUrl: "https://industry.example.com/best-resources", domainRating: 72, traffic: 8400 },
      { sourceUrl: "https://saas-list.example.com/best-seo-tools", domainRating: 68, traffic: 6200 },
      { sourceUrl: "https://partner.example.com/guides/marketing", domainRating: 54, traffic: 3100 },
    ],
    backlinkQualityNotes: [
      "Most new links are relevant to the client’s industry and point to priority commercial or educational pages.",
      "One lost directory-style link has low authority and does not require immediate replacement.",
      "Competitor gap opportunities show several relevant resource pages worth outreach next month.",
    ],
  };
}
