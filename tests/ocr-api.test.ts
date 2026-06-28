import { describe, expect, it } from "vitest";
import { createStubOcrResult } from "@/adapters/ocr-server/stub";

describe("OCR job boundary", () => {
  it("returns server processing preview with pending cleanup", () => {
    const result = createStubOcrResult("scan.pdf");

    expect(result.processingMode).toBe("server");
    expect(result.cleanupState).toBe("pending");
    expect(result.preview.cleanupAt).toBeTruthy();
    expect(result.preview.columns.map((column) => column.sourceLabel)).toContain("Debit");
    expect(result.preview.rows.some((row) => row.confidence)).toBe(true);
  });
});
