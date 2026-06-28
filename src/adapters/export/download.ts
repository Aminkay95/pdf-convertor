import type { ConversionPreview } from "@/domain/conversion/types";
import { createCsvBlob } from "./csv";
import { createXlsxBlob } from "./xlsx";

export type ExportFormat = "csv" | "xlsx";

export function genericExportFileName(format: ExportFormat): string {
  return `statement-conversion.${format}`;
}

export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function downloadPreview(preview: ConversionPreview, format: ExportFormat): Promise<void> {
  const blob = format === "csv" ? createCsvBlob(preview) : await createXlsxBlob(preview);
  triggerDownload(blob, genericExportFileName(format));
}
