import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  const root = process.env.LOCAL_STORAGE_ROOT
    ? path.resolve(/* turbopackIgnore: true */ process.env.LOCAL_STORAGE_ROOT)
    : path.join(process.cwd(), "storage", "uploads");
  const requested = path.resolve(root, ...params.path);
  const isInsideRoot = requested === root || requested.startsWith(`${root}${path.sep}`);
  if (!isInsideRoot) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  try {
    const file = await readFile(requested);
    const extension = path.extname(requested).toLowerCase();
    const contentType =
      extension === ".pdf"
        ? "application/pdf"
        : extension === ".docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : extension === ".svg"
            ? "image/svg+xml"
            : extension === ".png"
              ? "image/png"
              : extension === ".jpg" || extension === ".jpeg"
                ? "image/jpeg"
                : extension === ".webp"
                  ? "image/webp"
                  : "application/octet-stream";
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "content-type": contentType,
        "cache-control": "private, max-age=3600",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
