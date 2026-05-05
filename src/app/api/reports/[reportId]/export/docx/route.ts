import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buildReportDocx } from "@/lib/export/docx";
import { getStorageProvider } from "@/lib/storage/storage";
import { getPreviousReport, getReportWithRelations } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ reportId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { reportId } = await context.params;
  const report = await getReportWithRelations(reportId);
  if (!report) return new NextResponse("Report not found", { status: 404 });

  try {
    const previous = await getPreviousReport(report.clientId, report.month, report.year);
    const docx = await buildReportDocx(report, previous);
    const filename = `reports/${report.id}/${report.client.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${report.month}-${report.year}.docx`;
    const stored = await getStorageProvider().put(docx, filename, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    await prisma.reportExport.create({ data: { reportId: report.id, fileType: "DOCX", fileUrl: stored.url } });
    await prisma.report.update({ where: { id: report.id }, data: { status: "EXPORTED" } });

    return new NextResponse(new Uint8Array(docx), {
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "content-disposition": `attachment; filename="${filename.split("/").at(-1)}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DOCX generation failed. Check report data and export storage settings." }, { status: 500 });
  }
}
