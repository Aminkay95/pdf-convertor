import type { ExtractionResult } from "@/domain/conversion/types";

export function createStubOcrResult(sourceName: string): ExtractionResult {
  const cleanupAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  return {
    processingMode: "server",
    cleanupState: "pending",
    preview: {
      sourceName,
      isSample: false,
      cleanupAt,
      columns: [
        { id: "date", label: "Date", sourceLabel: "Date" },
        { id: "merchant", label: "Merchant / Description", sourceLabel: "Merchant / Description" },
        { id: "debit", label: "Debit", sourceLabel: "Debit" },
        { id: "credit", label: "Credit", sourceLabel: "Credit" },
        { id: "balance", label: "Balance", sourceLabel: "Balance" }
      ],
      rows: [
        {
          id: "ocr-1",
          cells: {
            date: "2026-05-03",
            merchant: "OCR sample merchant",
            debit: "42.19",
            credit: "",
            balance: "3188.25"
          },
          confidence: {
            merchant: { score: 0.58, reason: "Stub OCR marks this value for review" }
          }
        },
        {
          id: "ocr-2",
          cells: {
            date: "2026-05-05",
            merchant: "Payment received",
            debit: "",
            credit: "950.00",
            balance: "4138.25"
          }
        }
      ]
    }
  };
}
