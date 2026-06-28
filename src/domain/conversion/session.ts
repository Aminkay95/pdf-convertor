import type {
  CleanupState,
  ConversionPreview,
  ConversionSession,
  ExtractionResult,
  PrivacyReceipt,
  PreviewRow,
  ProcessingMode
} from "./types";

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptySession(): ConversionSession {
  return {
    id: createId("session"),
    processingMode: "unknown",
    preview: null,
    receipt: null,
    history: [],
    passwordWasUsed: false,
    serverConsentGranted: false,
    cleanupState: "not-applicable"
  };
}

export function startFromExtraction(session: ConversionSession, result: ExtractionResult): ConversionSession {
  return {
    ...session,
    processingMode: result.processingMode,
    preview: result.preview,
    receipt: null,
    history: [],
    passwordWasUsed: Boolean(result.passwordWasUsed),
    cleanupState: result.cleanupState ?? (result.processingMode === "server" ? "pending" : "not-applicable"),
    error: undefined
  };
}

function pushHistory(session: ConversionSession): ConversionSession {
  return session.preview ? { ...session, history: [...session.history, session.preview] } : session;
}

export function applyCellEdit(
  session: ConversionSession,
  rowId: string,
  columnId: string,
  value: string
): ConversionSession {
  if (!session.preview) {
    return session;
  }

  const next = pushHistory(session);
  return {
    ...next,
    preview: {
      ...session.preview,
      rows: session.preview.rows.map((row) =>
        row.id === rowId ? { ...row, cells: { ...row.cells, [columnId]: value } } : row
      )
    },
    receipt: null
  };
}

export function addPreviewRow(session: ConversionSession): ConversionSession {
  if (!session.preview) {
    return session;
  }

  const emptyCells = Object.fromEntries(session.preview.columns.map((column) => [column.id, ""]));
  const row: PreviewRow = {
    id: createId("row"),
    cells: emptyCells
  };

  const next = pushHistory(session);
  return {
    ...next,
    preview: {
      ...session.preview,
      rows: [...session.preview.rows, row]
    },
    receipt: null
  };
}

export function deletePreviewRow(session: ConversionSession, rowId: string): ConversionSession {
  if (!session.preview) {
    return session;
  }

  const next = pushHistory(session);
  return {
    ...next,
    preview: {
      ...session.preview,
      rows: session.preview.rows.filter((row) => row.id !== rowId)
    },
    receipt: null
  };
}

export function renamePreviewColumn(session: ConversionSession, columnId: string, label: string): ConversionSession {
  if (!session.preview) {
    return session;
  }

  const normalized = label.trim();
  if (!normalized) {
    return session;
  }

  const next = pushHistory(session);
  return {
    ...next,
    preview: {
      ...session.preview,
      columns: session.preview.columns.map((column) =>
        column.id === columnId ? { ...column, label: normalized } : column
      )
    },
    receipt: null
  };
}

export function undoPreviewChange(session: ConversionSession): ConversionSession {
  const previous = session.history.at(-1);
  if (!previous) {
    return session;
  }

  return {
    ...session,
    preview: previous,
    history: session.history.slice(0, -1),
    receipt: null
  };
}

export function grantServerConsent(session: ConversionSession): ConversionSession {
  return {
    ...session,
    serverConsentGranted: true,
    processingMode: "server",
    error: undefined
  };
}

export function buildPrivacyReceipt(session: ConversionSession): PrivacyReceipt {
  const processingMode: ProcessingMode = session.processingMode;
  const fileUploadedToServer = processingMode === "server" && session.serverConsentGranted;
  const cleanupState: CleanupState = fileUploadedToServer ? session.cleanupState : "not-applicable";
  const serverMessage =
    cleanupState === "failed"
      ? "Server OCR cleanup could not be confirmed. Do not rely on deletion until the job is investigated."
      : cleanupState === "completed"
      ? "Server OCR artifacts were marked deleted for this job."
      : "Server OCR artifacts are temporary and scheduled for deletion within 30 minutes.";
  const message =
    processingMode === "local"
      ? "This conversion used browser processing. The statement did not need server upload for conversion."
      : fileUploadedToServer
        ? serverMessage
        : "No server processing occurred for this conversion.";

  return {
    processingMode,
    fileUploadedToServer,
    passwordStored: false,
    cleanupState,
    message: session.passwordWasUsed ? `${message} The PDF password was not stored.` : message,
    generatedAt: new Date().toISOString()
  };
}

export function attachReceipt(session: ConversionSession): ConversionSession {
  return {
    ...session,
    receipt: buildPrivacyReceipt(session)
  };
}
