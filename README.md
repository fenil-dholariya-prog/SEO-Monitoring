# SEO Monthly Report Generator

Internal agency tool for managing clients, monthly SEO data, manual work entries, AI search visibility, report previews, and PDF/DOCX exports.

## Built

- Next.js App Router with TypeScript and Tailwind CSS.
- PostgreSQL schema with Prisma ORM for users, clients, reports, GSC snapshots, GA4 snapshots, AI search snapshots, manual on-page work, backlinks, blog plans, app settings, and export records.
- Website-level password gate before Google login. Default password: `Fenil@007`.
- Auth.js/NextAuth Google OAuth with Prisma adapter and encrypted Google token storage table.
- Client management with SEO type, logos, theme colour, GSC property, and GA4 property.
- Step-based monthly report builder with GSC/GA4 fetch, AI search report, manual work forms, insight generation, preview, PDF export, and DOCX export.
- Toggle to include or exclude the AI Search Report from the main client-facing report.
- Recharts preview charts plus export-safe PDF charts/tables.
- Local storage provider abstraction for generated exports and future UploadThing/R2/S3 replacement.
- Development seed data and mock Google fallback modes.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. Enter the site access password first, then sign in with Google.

## Upload To GitHub

Use Git from the terminal instead of GitHub's browser uploader. The browser uploader can fail on required Next.js route folders like `[...nextauth]`, `[reportId]`, and `[...path]`.

See [GITHUB_UPLOAD.md](GITHUB_UPLOAD.md).

## Required Environment Variables

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: secure random Auth.js secret. Also signs the site access cookie.
- `AUTH_URL`: local or deployed app URL.
- `SITE_ACCESS_PASSWORD`: initial site access password. Defaults to `Fenil@007`.
- `GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
- `GOOGLE_OAUTH_SCOPES`: OAuth scopes for profile, Search Console, and GA4 read-only access.
- `TOKEN_ENCRYPTION_KEY`: base64 32-byte key for encrypted Google token storage.
- `GOOGLE_API_MOCK_MODE`: `true` for development mock data, `false` for real Google API calls.
- `LOCAL_STORAGE_ROOT`: local export storage path.
- `NEXT_PUBLIC_APP_URL`: app base URL used by exports.

## Access Password

The whole app is protected by a password gate before Google login. The seeded/default password is:

```text
Fenil@007
```

Admins can change it from Settings. The password is stored as a PBKDF2 hash in the `AppSetting` table, not as plain text.

## AI Search Report

Each monthly report can store:

- Traffic from AI
- Sales from AI
- AI conversions
- AI platforms where the site appears, such as ChatGPT, Perplexity, Gemini, or Google AI Overviews
- Platform-level traffic/sales/conversion breakdown
- Top cited pages
- Notes

Use the "Add AI Search Report to the main report" button in the report builder to include or exclude it from the report preview, PDF export, and DOCX export.

## Google APIs

Create a Google Cloud OAuth app and enable:

- Google Search Console API
- Google Analytics Data API

Add an OAuth redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Use the same Google account that has access to each client's GSC property and GA4 property. Add the client's `gscPropertyUrl` and `ga4PropertyId` in the client profile.

## Mocked Data

When `GOOGLE_API_MOCK_MODE=true`, GSC and GA4 fetches return realistic development data while still saving snapshots to the database.

## Remaining Phase 2+

Add PageSpeed Insights, automated technical SEO audits, client portal, shareable report links, report approvals, scheduled monthly report generation, deeper competitor tracking, rank tracking, and email report delivery.
