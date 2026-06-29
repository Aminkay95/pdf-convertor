import { NextResponse } from "next/server";

const CONVERTER_SERVICE_URL = process.env.CONVERTER_SERVICE_URL ?? "http://localhost:8000";

async function checkConverterEngine(): Promise<"ok" | "unavailable"> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_000);

  try {
    const response = await fetch(`${CONVERTER_SERVICE_URL}/health`, {
      cache: "no-store",
      signal: controller.signal
    });
    return response.ok ? "ok" : "unavailable";
  } catch {
    return "unavailable";
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const converterEngine = await checkConverterEngine();
  const status = converterEngine === "ok" ? 200 : 503;

  return NextResponse.json(
    {
      status: converterEngine === "ok" ? "ok" : "degraded",
      services: {
        app: "ok",
        converterEngine
      }
    },
    { status }
  );
}
