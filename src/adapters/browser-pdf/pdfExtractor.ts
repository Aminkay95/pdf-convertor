import { ConversionError } from "@/domain/conversion/errors";
import type { ConversionPreview, ExtractionResult, PreviewColumn, PreviewRow } from "@/domain/conversion/types";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export type ExtractPdfOptions = {
  password?: string;
};

type PosItem = {
  str: string;
  x: number;
  y: number;
  w: number;
};

type HLine = { y: number; x1: number; x2: number };
type VLine = { x: number; y1: number; y2: number };

function assertPdfFile(file: File): void {
  const looksLikePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!looksLikePdf) {
    throw new ConversionError("unsupported-file");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ConversionError("file-too-large");
  }
}

function slugLabel(label: string, index: number): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || `col-${index + 1}`;
}

/* ───────── positioned-text extraction (shared) ───────── */

async function pageItems(page: any): Promise<PosItem[]> {
  const content = await page.getTextContent();
  return content.items
    .filter((item: any): boolean => typeof item.str === "string")
    .map((item: any) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      w: item.width,
    }));
}

function groupRows(items: PosItem[], tolerance = 4): PosItem[][] {
  const sorted = [...items].sort((a, b) => b.y - a.y);
  const rows: PosItem[][] = [];
  for (const item of sorted) {
    const last = rows[rows.length - 1];
    if (last && Math.abs(last[0].y - item.y) <= tolerance) {
      last.push(item);
    } else {
      rows.push([item]);
    }
  }
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
  }
  return rows;
}

function mergeAdjacent(items: PosItem[], gap = 3): PosItem[] {
  if (items.length === 0) return [];
  const out: PosItem[] = [{ ...items[0] }];
  for (let i = 1; i < items.length; i++) {
    const prev = out[out.length - 1];
    const curr = items[i];
    const endX = prev.x + prev.w;
    if (curr.x - endX <= gap) {
      const gapStr = curr.x - endX > 1 ? " " : "";
      prev.str += gapStr + curr.str;
      prev.w = curr.x + curr.w - prev.x;
    } else {
      out.push({ ...curr });
    }
  }
  return out;
}

/* ───────── strategy 1: line-based table detection ───────── */

async function pageLines(page: any): Promise<{ h: HLine[]; v: VLine[] }> {
  const opList = await page.getOperatorList();
  const { fnArray, argsArray } = opList;
  const h: HLine[] = [];
  const v: VLine[] = [];
  let rectX = 0, rectY = 0, rectW = 0, rectH = 0;
  let inRect = false;

  for (let i = 0; i < fnArray.length; i++) {
    const op = fnArray[i];
    const args = argsArray[i];

    if (op === 19) {
      [rectX, rectY, rectW, rectH] = args;
      inRect = true;
    } else if (op === 20 && inRect) {
      h.push({ y: rectY, x1: rectX, x2: rectX + rectW });
      h.push({ y: rectY + rectH, x1: rectX, x2: rectX + rectW });
      v.push({ x: rectX, y1: rectY, y2: rectY + rectH });
      v.push({ x: rectX + rectW, y1: rectY, y2: rectY + rectH });
      inRect = false;
    } else if (op === 91) {
      const paintOp: number = args[0];
      const pathData: Float32Array | null = args[1];
      if (pathData && (paintOp === 20 || paintOp === 21)) {
        parsePathLines(pathData, h, v);
      }
      inRect = false;
    } else if (op !== 20) {
      inRect = false;
    }
  }
  return { h, v };
}

function parsePathLines(data: Float32Array, h: HLine[], v: VLine[]): void {
  let i = 0, prevX = 0, prevY = 0, firstX = 0, firstY = 0;
  while (i < data.length) {
    const cmd = data[i++];
    if (cmd === 0) {
      prevX = data[i++]; prevY = data[i++];
      firstX = prevX; firstY = prevY;
    } else if (cmd === 1) {
      const x = data[i++], y = data[i++];
      if (Math.abs(y - prevY) < 0.5 && Math.abs(x - prevX) > 1) {
        h.push({ y, x1: Math.min(prevX, x), x2: Math.max(prevX, x) });
      } else if (Math.abs(x - prevX) < 0.5 && Math.abs(y - prevY) > 1) {
        v.push({ x, y1: Math.min(prevY, y), y2: Math.max(prevY, y) });
      }
      prevX = x; prevY = y;
    } else if (cmd === 4) {
      if (Math.abs(firstY - prevY) < 0.5 && Math.abs(firstX - prevX) > 1) {
        h.push({ y: firstY, x1: Math.min(prevX, firstX), x2: Math.max(prevX, firstX) });
      } else if (Math.abs(firstX - prevX) < 0.5 && Math.abs(firstY - prevY) > 1) {
        v.push({ x: firstX, y1: Math.min(prevY, firstY), y2: Math.max(prevY, firstY) });
      }
      prevX = firstX; prevY = firstY;
    } else if (cmd === 2) { i += 6; }
    else if (cmd === 3) { i += 4; }
  }
}

function clusterValues(values: number[], tol: number): number[] {
  if (values.length === 0) return [];
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const clusters: number[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - clusters[clusters.length - 1][clusters[clusters.length - 1].length - 1] <= tol) {
      clusters[clusters.length - 1].push(sorted[i]);
    } else {
      clusters.push([sorted[i]]);
    }
  }
  return clusters.map((c) => c[Math.floor(c.length / 2)]);
}

function buildGrid(hLines: HLine[], vLines: VLine[]): { rows: number[]; cols: number[] } | null {
  const rowPos = clusterValues(hLines.map((l) => l.y), 4);
  const colPos = clusterValues(vLines.map((l) => l.x), 4);
  if (rowPos.length < 3 || colPos.length < 2) return null;
  return { rows: rowPos, cols: colPos };
}

function gridPreview(fileName: string, items: PosItem[], rows: number[], cols: number[]): ConversionPreview {
  const colBoundaries: { start: number; end: number }[] = [];
  for (let ci = 0; ci < cols.length; ci++) {
    const start = ci === 0 ? 0 : (cols[ci - 1] + cols[ci]) / 2;
    const end = ci === cols.length - 1 ? Infinity : (cols[ci] + cols[ci + 1]) / 2;
    colBoundaries.push({ start, end });
  }

  const rowBoundaries: { start: number; end: number }[] = [];
  for (let ri = 0; ri < rows.length; ri++) {
    const start = ri === 0 ? -Infinity : (rows[ri - 1] + rows[ri]) / 2;
    const end = ri === rows.length - 1 ? Infinity : (rows[ri] + rows[ri + 1]) / 2;
    rowBoundaries.push({ start, end });
  }

  const cells: string[][] = Array.from({ length: rows.length }, () => cols.map(() => ""));
  for (const item of items) {
    const cx = item.x + item.w / 2;
    let colIdx = -1;
    for (let ci = 0; ci < colBoundaries.length; ci++) {
      if (cx >= colBoundaries[ci].start && cx < colBoundaries[ci].end) {
        colIdx = ci;
        break;
      }
    }
    if (colIdx < 0) continue;

    let rowIdx = -1;
    for (let ri = 0; ri < rowBoundaries.length; ri++) {
      if (item.y >= rowBoundaries[ri].start && item.y < rowBoundaries[ri].end) {
        rowIdx = ri;
        break;
      }
    }
    if (rowIdx < 0) continue;

    cells[rowIdx][colIdx] = (cells[rowIdx][colIdx]
      ? cells[rowIdx][colIdx] + " " + item.str
      : item.str);
  }

  const headerRow = cells[0];
  const previewColumns: PreviewColumn[] = headerRow.map((label, ci) => {
    const clean = label || `Column ${ci + 1}`;
    return { id: slugLabel(clean, ci), label: clean, sourceLabel: clean };
  });

  const previewRows: PreviewRow[] = [];
  for (let ri = 1; ri < cells.length; ri++) {
    const rowCells: Record<string, string> = {};
    for (let ci = 0; ci < previewColumns.length; ci++) {
      rowCells[previewColumns[ci].id] = cells[ri][ci] ?? "";
    }
    if (Object.values(rowCells).some((v) => v.trim())) {
      previewRows.push({ id: `grid-row-${ri}`, cells: rowCells });
    }
  }

  return {
    sourceName: fileName,
    isSample: false,
    columns: previewColumns,
    rows: previewRows,
  };
}

/* ───────── strategy 2: position-cluster extraction ───────── */

function detectColumnCenters(rows: PosItem[][]): number[] {
  const allX: number[] = [];
  for (const row of rows) {
    const merged = mergeAdjacent(row);
    for (const item of merged) {
      allX.push(item.x + item.w / 2);
    }
  }
  if (allX.length === 0) return [];
  return clusterValues(allX, 15);
}

function assignCells(row: PosItem[], centers: number[]): string[] {
  const merged = mergeAdjacent(row);
  const cells = centers.map(() => "");
  for (const item of merged) {
    const cx = item.x + item.w / 2;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < centers.length; i++) {
      const dist = Math.abs(cx - centers[i]);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    cells[best] = (cells[best] || "") + (cells[best] ? " " : "") + item.str;
  }
  return cells;
}

function columnAlignScore(row: PosItem[], centers: number[]): number {
  const merged = mergeAdjacent(row);
  let score = 0;
  for (let ci = 0; ci < centers.length; ci++) {
    if (merged.some((item) => Math.abs(item.x + item.w / 2 - centers[ci]) < 20)) {
      score += 1;
    }
  }
  for (const item of merged) {
    const cx = item.x + item.w / 2;
    if (!centers.some((c) => Math.abs(cx - c) < 20)) {
      score -= 0.5;
    }
  }
  return score;
}

function findHeaderRow(rows: PosItem[][], centers: number[]): number {
  let bestIdx = 0;
  let bestScore = -Infinity;
  for (let ri = 0; ri < rows.length; ri++) {
    const score = columnAlignScore(rows[ri], centers);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = ri;
    }
  }
  return bestIdx;
}

function positionPreview(fileName: string, rows: PosItem[][]): ConversionPreview {
  const centers = detectColumnCenters(rows);
  if (centers.length < 2) {
    return rawLinePreview(fileName, rows.map((r) => r.map((i) => i.str).join(" ")));
  }

  const headerRowIdx = findHeaderRow(rows, centers);
  const headerValues = assignCells(rows[headerRowIdx], centers);

  const columns: PreviewColumn[] = centers.map((_c, i) => {
    const label = headerValues[i]?.trim() || `Column ${i + 1}`;
    return { id: slugLabel(label, i), label, sourceLabel: label };
  });

  const previewRows: PreviewRow[] = [];
  for (let ri = headerRowIdx + 1; ri < rows.length; ri++) {
    const values = assignCells(rows[ri], centers);
    const cells: Record<string, string> = {};
    for (let ci = 0; ci < columns.length; ci++) {
      cells[columns[ci].id] = values[ci] ?? "";
    }
    previewRows.push({ id: `row-p${ri}`, cells });
  }
  return { sourceName: fileName, isSample: false, columns, rows: previewRows };
}

/* ───────── strategy 3: raw line preview ───────── */

function rawLinePreview(fileName: string, lines: string[]): ConversionPreview {
  return {
    sourceName: fileName,
    isSample: false,
    columns: [{ id: "content", label: "Row Content", sourceLabel: "Raw line" }],
    rows: lines.map((line, i) => ({
      id: `line-${i}`,
      cells: { content: line },
    })),
  };
}

/* ───────── main extraction entry point ───────── */

export async function extractDigitalPdf(file: File, options: ExtractPdfOptions = {}): Promise<ExtractionResult> {
  assertPdfFile(file);

  const pdfjs = await import("pdfjs-dist/webpack.mjs");
  const data = new Uint8Array(await file.arrayBuffer());
  const hasPdfHeader = data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46 && data[4] === 0x2d;
  if (!hasPdfHeader) {
    throw new ConversionError("unsupported-file");
  }

  try {
    const document = await pdfjs.getDocument({
      data,
      password: options.password,
      useWorkerFetch: false,
    }).promise;

    const allItems: PosItem[] = [];
    const allH: HLine[] = [];
    const allV: VLine[] = [];

    for (let p = 1; p <= document.numPages; p++) {
      const page = await document.getPage(p);
      allItems.push(...(await pageItems(page)));
      const lines = await pageLines(page);
      allH.push(...lines.h);
      allV.push(...lines.v);
    }

    const totalText = allItems.map((i) => i.str).join(" ");
    if (totalText.length < 40) {
      throw new ConversionError("ocr-consent-required");
    }

    const rows = groupRows(allItems);

    let preview: ConversionPreview;

    const grid = buildGrid(allH, allV);
    if (grid) {
      preview = gridPreview(file.name, allItems, grid.rows, grid.cols);
      if (preview.rows.length > 0 && preview.columns.length > 0) {
        return {
          processingMode: "local",
          preview,
          passwordWasUsed: Boolean(options.password),
          cleanupState: "not-applicable",
        };
      }
    }

    if (rows.length >= 2) {
      preview = positionPreview(file.name, rows);
      if (preview.rows.length > 0 && preview.columns.length > 0) {
        return {
          processingMode: "local",
          preview,
          passwordWasUsed: Boolean(options.password),
          cleanupState: "not-applicable",
        };
      }
    }

    preview = rawLinePreview(file.name, rows.map((r) => r.map((i) => i.str).join(" ")));
    return {
      processingMode: "local",
      preview,
      passwordWasUsed: Boolean(options.password),
      cleanupState: "not-applicable",
    };
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }

    const name = error && typeof error === "object" && "name" in error ? String(error.name) : "";
    if (name.includes("PasswordException")) {
      throw new ConversionError(options.password ? "wrong-password" : "password-required");
    }

    throw new ConversionError("malformed-pdf");
  }
}
