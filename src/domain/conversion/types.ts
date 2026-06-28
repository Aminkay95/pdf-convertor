export type ProcessingMode = "local" | "server" | "unknown";

export type CleanupState = "not-applicable" | "pending" | "completed" | "failed";

export type ConversionErrorCode =
  | "unsupported-file"
  | "file-too-large"
  | "password-required"
  | "wrong-password"
  | "malformed-pdf"
  | "extraction-failed"
  | "ocr-consent-required"
  | "ocr-failed";

export type PreviewColumn = {
  id: string;
  label: string;
  sourceLabel: string;
};

export type CellConfidence = {
  score: number;
  reason?: string;
};

export type PreviewRow = {
  id: string;
  cells: Record<string, string>;
  confidence?: Record<string, CellConfidence>;
};

export type ConversionPreview = {
  columns: PreviewColumn[];
  rows: PreviewRow[];
  sourceName: string;
  isSample: boolean;
  cleanupAt?: string;
};

export type PrivacyReceipt = {
  processingMode: ProcessingMode;
  fileUploadedToServer: boolean;
  passwordStored: false;
  cleanupState: CleanupState;
  message: string;
  generatedAt: string;
};

export type ConversionSession = {
  id: string;
  processingMode: ProcessingMode;
  preview: ConversionPreview | null;
  receipt: PrivacyReceipt | null;
  history: ConversionPreview[];
  passwordWasUsed: boolean;
  serverConsentGranted: boolean;
  cleanupState: CleanupState;
  error?: ConversionErrorCode;
};

export type ExtractionResult = {
  processingMode: ProcessingMode;
  preview: ConversionPreview;
  passwordWasUsed?: boolean;
  cleanupState?: CleanupState;
};
