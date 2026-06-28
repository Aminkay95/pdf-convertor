import { NextResponse } from "next/server";
import { createStubOcrResult } from "@/adapters/ocr-server/stub";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const cleanupJobs = new Map<string, { cleanupAt: string; state: "pending" | "completed" }>();
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function safeJson(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (!Number.isFinite(contentLength) || contentLength <= 0 || contentLength > MAX_UPLOAD_BYTES + 2048) {
      return safeJson(413, "This upload is outside the current technical safeguard.");
    }

    const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const now = Date.now();
    const bucket = rateLimit.get(clientKey);
    if (bucket && bucket.resetAt > now && bucket.count >= 12) {
      return safeJson(429, "Too many OCR requests. Try again later.");
    }
    rateLimit.set(clientKey, {
      count: bucket && bucket.resetAt > now ? bucket.count + 1 : 1,
      resetAt: bucket && bucket.resetAt > now ? bucket.resetAt : now + 60_000
    });

    const formData = await request.formData();
    const consent = formData.get("consent");
    const file = formData.get("file");

    if (consent !== "true") {
      return safeJson(403, "OCR server processing requires explicit consent.");
    }

    if (!(file instanceof File)) {
      return safeJson(400, "A PDF file is required.");
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return safeJson(415, "Only PDF statement files are supported.");
    }

    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return safeJson(413, "This PDF is above the current technical safeguard.");
    }

    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const hasPdfHeader = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46 && header[4] === 0x2d;
    if (!hasPdfHeader) {
      return safeJson(415, "Only valid PDF statement files are supported.");
    }

    const jobId = crypto.randomUUID();
    const cleanupAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    cleanupJobs.set(jobId, { cleanupAt, state: "pending" });
    setTimeout(() => cleanupJobs.delete(jobId), 30 * 60 * 1000);

    const result = createStubOcrResult(file.name);
    return NextResponse.json({
      ...result,
      jobId,
      cleanupAt
    });
  } catch {
    return safeJson(500, "OCR processing could not start safely.");
  }
}
