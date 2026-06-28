import { afterEach, describe, expect, it, vi } from "vitest";
import { neutralizeSpreadsheetFormula, previewToCsv } from "@/adapters/export/csv";
import { genericExportFileName, triggerDownload } from "@/adapters/export/download";
import { samplePreview } from "@/domain/conversion";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("export adapters", () => {
  it("creates CSV from the current preview columns and rows", () => {
    const csv = previewToCsv({
      ...samplePreview,
      rows: [
        {
          id: "edited",
          cells: {
            date: "2026-06-01",
            description: "Edited, quoted merchant",
            amount: "-10.00",
            balance: "100.00"
          }
        }
      ]
    });

    expect(csv).toContain("Date,Description,Amount,Balance");
    expect(csv).toContain("\"Edited, quoted merchant\"");
  });

  it("uses generic filenames that avoid statement-derived identifiers", () => {
    expect(genericExportFileName("csv")).toBe("statement-conversion.csv");
    expect(genericExportFileName("xlsx")).toBe("statement-conversion.xlsx");
  });

  it("neutralizes spreadsheet formulas before export", () => {
    expect(neutralizeSpreadsheetFormula("=CMD()")).toBe("'=CMD()");
    expect(previewToCsv({
      ...samplePreview,
      rows: [{ id: "formula", cells: { date: "2026-01-01", description: "=HYPERLINK()", amount: "1", balance: "1" } }]
    })).toContain("'=HYPERLINK()");
  });

  it("revokes generated download URLs after the browser starts the save", () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn(() => "blob:test-workbook");
    const revokeObjectURL = vi.fn();
    const link = { href: "", download: "", click: vi.fn() };
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    vi.stubGlobal("document", {
      createElement: vi.fn(() => link),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    });

    triggerDownload(new Blob(["workbook"]), "statement-conversion.xlsx");

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(link.click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1_000);

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-workbook");
  });
});
