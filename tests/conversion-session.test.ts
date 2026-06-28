import { describe, expect, it } from "vitest";
import {
  addPreviewRow,
  applyCellEdit,
  attachReceipt,
  buildPrivacyReceipt,
  createEmptySession,
  grantServerConsent,
  renamePreviewColumn,
  samplePreview,
  startFromExtraction,
  undoPreviewChange
} from "@/domain/conversion";

describe("conversion session", () => {
  it("exports from edited preview state", () => {
    const session = startFromExtraction(createEmptySession(), {
      processingMode: "local",
      preview: samplePreview
    });

    const edited = applyCellEdit(session, "sample-2", "description", "Edited client payment");

    expect(edited.preview?.rows[1]?.cells.description).toBe("Edited client payment");
    expect(undoPreviewChange(edited).preview?.rows[1]?.cells.description).toBe("Client payment");
  });

  it("adds rows without changing source-derived columns", () => {
    const session = startFromExtraction(createEmptySession(), {
      processingMode: "local",
      preview: samplePreview
    });

    const withRow = addPreviewRow(session);

    expect(withRow.preview?.columns.map((column) => column.sourceLabel)).toEqual(["Date", "Description", "Amount", "Balance"]);
    expect(withRow.preview?.rows).toHaveLength(samplePreview.rows.length + 1);
  });

  it("supports lightweight column mapping labels", () => {
    const session = startFromExtraction(createEmptySession(), {
      processingMode: "local",
      preview: samplePreview
    });

    const mapped = renamePreviewColumn(session, "description", "Merchant");

    expect(mapped.preview?.columns.find((column) => column.id === "description")?.label).toBe("Merchant");
    expect(mapped.preview?.columns.find((column) => column.id === "description")?.sourceLabel).toBe("Description");
  });

  it("builds a local privacy receipt without server upload claims", () => {
    const session = startFromExtraction(createEmptySession(), {
      processingMode: "local",
      preview: samplePreview
    });

    const receipt = buildPrivacyReceipt(session);

    expect(receipt.fileUploadedToServer).toBe(false);
    expect(receipt.cleanupState).toBe("not-applicable");
    expect(receipt.message).toContain("browser processing");
  });

  it("marks server OCR receipts as consented temporary work", () => {
    const session = startFromExtraction(grantServerConsent(createEmptySession()), {
      processingMode: "server",
      preview: samplePreview,
      cleanupState: "pending"
    });

    const withReceipt = attachReceipt(session);

    expect(withReceipt.receipt?.fileUploadedToServer).toBe(true);
    expect(withReceipt.receipt?.cleanupState).toBe("pending");
  });
});
