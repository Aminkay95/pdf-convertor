import { NextResponse } from "next/server";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const CONVERTER_SERVICE_URL = process.env.CONVERTER_SERVICE_URL ?? "http://localhost:8000";

function safeJson(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function isPdfHeader(bytes: Uint8Array): boolean {
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (!Number.isFinite(contentLength) || contentLength <= 0 || contentLength > MAX_UPLOAD_BYTES + 4096) {
      return safeJson(413, "This upload is outside the current technical safeguard.");
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const password = formData.get("password");

    if (!(file instanceof File)) {
      return safeJson(400, "A PDF file is required.");
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf || file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return safeJson(415, "Please choose a valid PDF statement.");
    }

    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (!isPdfHeader(header)) {
      return safeJson(415, "Please choose a valid PDF statement.");
    }

    const upstreamForm = new FormData();
    upstreamForm.append("file", file, file.name);
    upstreamForm.append("password", typeof password === "string" ? password : "");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);
    let upstream: Response;
    try {
      upstream = await fetch(`${CONVERTER_SERVICE_URL}/convert`, {
        method: "POST",
        body: upstreamForm,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      const body = (await upstream.json().catch(() => null)) as { detail?: string } | null;
      return safeJson(upstream.status, body?.detail ?? "The server-side conversion failed.");
    }

    const workbook = await upstream.arrayBuffer();
    return new Response(workbook, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="statement-conversion.xlsx"',
        "X-Processing-Mode": upstream.headers.get("X-Processing-Mode") ?? "server",
        "X-Cleanup-State": upstream.headers.get("X-Cleanup-State") ?? "completed"
      }
    });
  } catch {
    return safeJson(502, "The conversion service is unavailable.");
  }
}
