import type { ConversionPreview } from "./types";

export const samplePreview: ConversionPreview = {
  sourceName: "Sample statement",
  isSample: true,
  columns: [
    { id: "date", label: "Date", sourceLabel: "Date" },
    { id: "description", label: "Description", sourceLabel: "Description" },
    { id: "amount", label: "Amount", sourceLabel: "Amount" },
    { id: "balance", label: "Balance", sourceLabel: "Balance" }
  ],
  rows: [
    {
      id: "sample-1",
      cells: {
        date: "2026-05-02",
        description: "Opening balance",
        amount: "",
        balance: "4250.00"
      }
    },
    {
      id: "sample-2",
      cells: {
        date: "2026-05-04",
        description: "Client payment",
        amount: "1850.00",
        balance: "6100.00"
      }
    },
    {
      id: "sample-3",
      cells: {
        date: "2026-05-07",
        description: "Office supplies",
        amount: "-94.38",
        balance: "6005.62"
      },
      confidence: {
        description: { score: 0.62, reason: "OCR-style low confidence sample" }
      }
    }
  ]
};
