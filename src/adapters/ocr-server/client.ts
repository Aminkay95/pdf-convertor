import { ConversionError } from "@/domain/conversion/errors";
import type { ExtractionResult } from "@/domain/conversion/types";

function isExtractionResult(value: unknown): value is ExtractionResult {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<ExtractionResult>;
  return (
    (candidate.processingMode === "server" || candidate.processingMode === "local") &&
    Boolean(candidate.preview) &&
    Array.isArray(candidate.preview?.columns) &&
    Array.isArray(candidate.preview?.rows)
  );
}

export async function submitOcrJob(file: File): Promise<ExtractionResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("consent", "true");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch("/api/ocr-jobs", {
      method: "POST",
      body: formData,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new ConversionError("ocr-failed");
    }

    const json = (await response.json()) as unknown;
    if (!isExtractionResult(json)) {
      throw new ConversionError("ocr-failed");
    }
    return json;
  } catch {
    throw new ConversionError("ocr-failed");
  } finally {
    window.clearTimeout(timeout);
  }
}
