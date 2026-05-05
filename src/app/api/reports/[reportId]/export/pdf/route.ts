import { NextResponse } from "next/server";
import puppeteer, { type Browser } from "puppeteer";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buildReportHtml } from "@/lib/export/report-html";
import { getStorageProvider } from "@/lib/storage/storage";
import { getPreviousReport, getReportWithRelations } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ reportId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { reportId } = await context.params;
  const report = await getReportWithRelations(reportId);
  if (!report) return new NextResponse("Report not found", { status: 404 });

  let browser: Browser | null = null;
  try {
    const previous = await getPreviousReport(report.clientId, report.month, report.year);
    const html = buildReportHtml(report, previous);
    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    const accessCookie = request.headers
      .get("cookie")
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("site_access="))
      ?.split("=")[1];
    if (accessCookie) {
      const base = new URL(process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000");
      await page.setCookie({
        name: "site_access",
        value: accessCookie,
        domain: base.hostname,
        path: "/",
        httpOnly: true,
        secure: base.protocol === "https:",
      });
    }
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = Buffer.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
      }),
    );
    await browser.close();
    browser = null;

    const filename = `reports/${report.id}/${report.client.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${report.month}-${report.year}.pdf`;
    const stored = await getStorageProvider().put(pdf, filename, "application/pdf");
    await prisma.reportExport.create({ data: { reportId: report.id, fileType: "PDF", fileUrl: stored.url } });
    await prisma.report.update({ where: { id: report.id }, data: { status: "EXPORTED" } });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename.split("/").at(-1)}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "PDF generation failed. Check report data, logo URLs, and Chromium availability." }, { status: 500 });
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
