import { triggerDownload } from "@/adapters/export/download";

export async function convertPdfOnServer(file: File, password: string): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);

  const response = await fetch("/api/convert", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "The conversion failed.");
  }

  return response.blob();
}

export function downloadServerWorkbook(blob: Blob): void {
  triggerDownload(blob, "statement-conversion.xlsx");
}
