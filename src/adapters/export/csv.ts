import type { ConversionPreview } from "@/domain/conversion/types";

export function neutralizeSpreadsheetFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function escapeCsvCell(value: string): string {
  const safeValue = neutralizeSpreadsheetFormula(value);
  if (/[",\n\r]/.test(safeValue)) {
    return `"${safeValue.replace(/"/g, "\"\"")}"`;
  }
  return safeValue;
}

export function previewToCsv(preview: ConversionPreview): string {
  const header = preview.columns.map((column) => escapeCsvCell(column.label)).join(",");
  const rows = preview.rows.map((row) =>
    preview.columns.map((column) => escapeCsvCell(row.cells[column.id] ?? "")).join(",")
  );
  return [header, ...rows].join("\r\n");
}

export function createCsvBlob(preview: ConversionPreview): Blob {
  return new Blob([previewToCsv(preview)], { type: "text/csv;charset=utf-8" });
}
