import { describe, expect, it } from "vitest";
import { createXlsxBlob } from "@/adapters/export/xlsx";
import type { ConversionPreview } from "@/domain/conversion/types";

function makePreview(rowCount: number): ConversionPreview {
  return {
    sourceName: "test.pdf",
    isSample: false,
    columns: [
      { id: "date", label: "Date", sourceLabel: "Date" },
      { id: "desc", label: "Description", sourceLabel: "Description" },
      { id: "amt", label: "Amount", sourceLabel: "Amount" },
    ],
    rows: Array.from({ length: rowCount }, (_, i) => ({
      id: `row-${i}`,
      cells: {
        date: `2026-01-${String(i + 1).padStart(2, "0")}`,
        desc: `Transaction ${i + 1}`,
        amt: `${(i + 1) * 10}.00`,
      },
    })),
  };
}

async function readXlsxSheetXml(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  function readUint32(pos: number): number {
    return bytes[pos] | (bytes[pos + 1] << 8) | (bytes[pos + 2] << 16) | (bytes[pos + 3] << 24);
  }

  function readUint16(pos: number): number {
    return bytes[pos] | (bytes[pos + 1] << 8);
  }

  function readString(pos: number, len: number): string {
    return new TextDecoder().decode(bytes.slice(pos, pos + len));
  }

  let offset = 0;
  while (offset < bytes.length - 30) {
    const sig = readUint32(offset);
    if (sig !== 0x04034b50) {
      offset += 1;
      continue;
    }

    const nameLen = readUint16(offset + 26);
    const extraLen = readUint16(offset + 28);
    const compSize = readUint32(offset + 18);
    const name = readString(offset + 30, nameLen);
    const dataStart = offset + 30 + nameLen + extraLen;

    if (name === "xl/worksheets/sheet1.xml") {
      return readString(dataStart, compSize);
    }

    offset = dataStart + compSize;
  }

  throw new Error("xl/worksheets/sheet1.xml not found in ZIP");
}

describe("XLSX export", () => {
  it("exports all rows with correct data", async () => {
    const preview = makePreview(50);
    const blob = await createXlsxBlob(preview);
    const xml = await readXlsxSheetXml(blob);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');
    expect(xml).toContain("<sheetData>");

    for (let i = 0; i < 50; i++) {
      expect(xml).toContain(`Transaction ${i + 1}`);
    }

    const rowCount = (xml.match(/<row /g) || []).length;
    expect(rowCount).toBe(51);
  });

  it("exports columns as header row", async () => {
    const preview = makePreview(1);
    const blob = await createXlsxBlob(preview);
    const xml = await readXlsxSheetXml(blob);

    expect(xml).toContain("<t>Date</t>");
    expect(xml).toContain("<t>Description</t>");
    expect(xml).toContain("<t>Amount</t>");
  });

  it("handles large exports without truncation", async () => {
    const preview = makePreview(500);
    const blob = await createXlsxBlob(preview);
    const xml = await readXlsxSheetXml(blob);

    const rowCount = (xml.match(/<row /g) || []).length;
    expect(rowCount).toBe(501);

    expect(xml).toContain("Transaction 500");
    expect(xml).toContain(`2026-01-${String(500).padStart(2, "0")}`);
  });

  it("escapes XML special characters in cell values", async () => {
    const preview: ConversionPreview = {
      sourceName: "test.pdf",
      isSample: false,
      columns: [
        { id: "col1", label: "Column & <Name>", sourceLabel: "Source" },
      ],
      rows: [
        { id: "r1", cells: { col1: 'AT&T <test> "value"' } },
      ],
    };

    const blob = await createXlsxBlob(preview);
    const xml = await readXlsxSheetXml(blob);

    expect(xml).toContain("Column &amp; &lt;Name&gt;");
    expect(xml).toContain("AT&amp;T &lt;test&gt; &quot;value&quot;");
  });
});
