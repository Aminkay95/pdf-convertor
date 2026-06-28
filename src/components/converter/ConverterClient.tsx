"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { Download, FilePlus, FileSpreadsheet, RotateCcw, ShieldCheck, Trash2, Upload } from "lucide-react";
import { downloadPreview } from "@/adapters/export/download";
import { convertPdfOnServer, downloadServerWorkbook } from "@/adapters/server-converter/client";
import { samplePreview } from "@/domain/conversion";
import type { ConversionSession } from "@/domain/conversion";
import {
  addPreviewRow,
  applyCellEdit,
  attachReceipt,
  createEmptySession,
  deletePreviewRow,
  grantServerConsent,
  renamePreviewColumn,
  startFromExtraction,
  undoPreviewChange
} from "@/domain/conversion/session";

export function ConverterClient() {
  const [session, setSession] = useState<ConversionSession>(() => createEmptySession());
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [safeError, setSafeError] = useState<string | null>(null);
  const [serverReceipt, setServerReceipt] = useState<string | null>(null);
  const [serverWorkbook, setServerWorkbook] = useState<Blob | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeRequestRef = useRef(0);

  const lowConfidenceCount = useMemo(() => {
    return (
      session.preview?.rows.filter((row) =>
        Object.values(row.confidence ?? {}).some((confidence) => confidence.score < 0.75)
      ).length ?? 0
    );
  }, [session.preview]);

  async function processFile(file: File, suppliedPassword?: string) {
    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;
    setBusy(true);
    setSafeError(null);
    setServerReceipt(null);
    setServerWorkbook(null);

    try {
      const workbook = await convertPdfOnServer(file, suppliedPassword ?? password);
      if (requestId !== activeRequestRef.current) {
        return;
      }
      setServerWorkbook(workbook);
      setSession((current) => ({
        ...grantServerConsent(current),
        processingMode: "server",
        cleanupState: "completed",
        receipt: {
          processingMode: "server",
          fileUploadedToServer: true,
          passwordStored: false,
          cleanupState: "completed",
          generatedAt: new Date().toISOString(),
          message:
            "This PDF was uploaded to the self-hosted conversion service, converted to Excel, and temporary server files were deleted after processing."
        }
      }));
      setServerReceipt("Excel file generated. Use Download Excel when you are ready to save it.");
    } catch (error) {
      if (requestId !== activeRequestRef.current) {
        return;
      }
      setSafeError(error instanceof Error ? error.message : "The server-side conversion failed.");
    } finally {
      if (requestId === activeRequestRef.current) {
        setBusy(false);
      }
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await processFile(file);
    event.target.value = "";
  }

  async function handlePasswordSubmit() {
    inputRef.current?.click();
  }

  function loadDemo() {
    setSafeError(null);
    setServerReceipt(null);
    setServerWorkbook(null);
    setSession((current) =>
      startFromExtraction(current, {
        processingMode: "local",
        preview: samplePreview,
        cleanupState: "not-applicable"
      })
    );
  }

  async function exportPreview(format: "csv" | "xlsx") {
    if (!session.preview) {
      return;
    }
    await downloadPreview(session.preview, format);
    setSession((current) => attachReceipt(current));
  }

  function downloadGeneratedWorkbook() {
    if (!serverWorkbook) {
      return;
    }
    downloadServerWorkbook(serverWorkbook);
  }

  return (
    <div className="converter-grid">
      <aside className="converter-panel">
        <div className="dropzone">
          <Upload size={36} aria-hidden="true" />
          <div>
            <h2>Upload one PDF statement</h2>
            <p>PDFs are uploaded to the self-hosted conversion engine and returned as Excel files.</p>
          </div>
          <label htmlFor="server-pdf-password" style={{ width: "100%", textAlign: "left" }}>
            <span style={{ display: "block", fontSize: 13, marginBottom: 6 }}>PDF password, if needed</span>
            <input
              id="server-pdf-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ width: "100%", padding: 10 }}
            />
          </label>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            aria-label="Upload PDF statement"
            hidden
          />
          <button className="button" type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Upload size={18} aria-hidden="true" />
            {busy ? "Converting..." : "Choose PDF"}
          </button>
          <button className="button secondary" type="button" onClick={loadDemo}>
            <FileSpreadsheet size={18} aria-hidden="true" />
            Open sample
          </button>
        </div>

        <div className="status-stack">
          <div className="notice good">
            <ShieldCheck size={18} aria-hidden="true" /> No account required. Files are converted by your self-hosted server and temporary files are deleted after processing.
          </div>
          {(session.processingMode !== "unknown" || serverReceipt) && (
            <div className="notice">
              Processing mode: <strong>Server-side PDF to Excel engine</strong>
            </div>
          )}
          {serverReceipt && <div className="notice good">{serverReceipt}</div>}
          {busy && <div className="notice">Converting the PDF into a structured Excel workbook...</div>}
          {safeError && <div className="notice bad">{safeError}</div>}
        </div>
      </aside>

      <section className="converter-panel" aria-label="Conversion preview">
        <div className="toolbar">
          <div>
            <h2>Review preview</h2>
            <p>
              {session.preview
                ? `${session.preview.rows.length} rows from ${session.preview.isSample ? "sample data" : session.preview.sourceName}`
                : serverWorkbook
                  ? "Your Excel file is ready. Use Download Excel to save it."
                  : "Upload a PDF to generate Excel, or open the sample preview."}
            </p>
          </div>
          <div className="toolbar-actions">
            <button className="icon-button secondary" type="button" disabled={!session.preview} onClick={() => setSession(addPreviewRow)}>
              <FilePlus size={18} aria-hidden="true" />
              Row
            </button>
            <button
              className="icon-button secondary"
              type="button"
              disabled={session.history.length === 0}
              onClick={() => setSession(undoPreviewChange)}
            >
              <RotateCcw size={18} aria-hidden="true" />
              Undo
            </button>
            <button className="icon-button" type="button" disabled={!session.preview} onClick={() => exportPreview("csv")}>
              <Download size={18} aria-hidden="true" />
              CSV
            </button>
            <button className="icon-button" type="button" disabled={!session.preview} onClick={() => exportPreview("xlsx")}>
              <Download size={18} aria-hidden="true" />
              Excel
            </button>
          </div>
        </div>

        {serverWorkbook && !session.preview && (
          <div className="download-focus" aria-live="polite">
            <div>
              <p className="download-kicker">Ready</p>
              <h3>Your Excel file is ready</h3>
              <p>The converted statement is prepared as one workbook sheet.</p>
            </div>
            <button className="button download-primary" type="button" onClick={downloadGeneratedWorkbook}>
              <Download size={22} aria-hidden="true" />
              Download Excel
            </button>
          </div>
        )}

        {lowConfidenceCount > 0 && (
          <div className="notice warn" style={{ marginBottom: 14 }}>
            {lowConfidenceCount} row{lowConfidenceCount === 1 ? "" : "s"} include low-confidence values. Review highlighted cells before export.
          </div>
        )}

        {session.preview ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {session.preview.columns.map((column) => (
                        <th key={column.id}>{column.label}</th>
                  ))}
                  <th aria-label="Row actions" />
                </tr>
              </thead>
              <tbody>
                {session.preview.rows.map((row) => {
                  const lowConfidence = Object.values(row.confidence ?? {}).some((confidence) => confidence.score < 0.75);
                  return (
                    <tr className={lowConfidence ? "low-confidence" : undefined} key={row.id}>
                      {session.preview?.columns.map((column) => (
                        <td key={column.id}>
                          <input
                            aria-label={`${column.label} for row ${row.id}`}
                            value={row.cells[column.id] ?? ""}
                            onChange={(event) =>
                              setSession((current) => applyCellEdit(current, row.id, column.id, event.target.value))
                            }
                          />
                        </td>
                      ))}
                      <td>
                        <button
                          className="icon-button secondary"
                          type="button"
                          aria-label="Delete row"
                          onClick={() => setSession((current) => deletePreviewRow(current, row.id))}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="notice">The server conversion prepares an Excel file first. Download appears when the file is ready.</div>
        )}

        {session.preview && (
          <div className="notice" style={{ marginTop: 14 }}>
            <h3>Column labels</h3>
            <div className="toolbar-actions">
              {session.preview.columns.map((column) => (
                <label key={column.id}>
                  <span style={{ display: "block", fontSize: 12, color: "var(--muted)" }}>{column.sourceLabel}</span>
                  <input
                    value={column.label}
                    onChange={(event) =>
                      setSession((current) => renamePreviewColumn(current, column.id, event.target.value))
                    }
                    aria-label={`Map column ${column.sourceLabel}`}
                    style={{ width: 180, padding: 8 }}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {session.receipt && (
          <div className="receipt" aria-live="polite">
            <h2>Privacy receipt</h2>
            <p>{session.receipt.message}</p>
            <p>
              File uploaded to server: <strong>{session.receipt.fileUploadedToServer ? "Yes" : "No"}</strong>. Password stored:{" "}
              <strong>No</strong>. Cleanup state: <strong>{session.receipt.cleanupState}</strong>.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
