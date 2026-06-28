import type { ConversionErrorCode } from "./types";

const safeMessages: Record<ConversionErrorCode, string> = {
  "unsupported-file": "Please choose a PDF statement file.",
  "file-too-large": "This file is above the current technical safeguard. Try a smaller statement PDF.",
  "password-required": "This PDF needs a password for this conversion.",
  "wrong-password": "That password did not open the PDF. Try again.",
  "malformed-pdf": "This PDF could not be read safely.",
  "extraction-failed": "We could not extract a reviewable table from this PDF.",
  "ocr-consent-required": "This statement appears to need OCR. Server processing requires your consent first.",
  "ocr-failed": "OCR processing could not produce a reviewable result."
};

export class ConversionError extends Error {
  readonly code: ConversionErrorCode;

  constructor(code: ConversionErrorCode) {
    super(safeMessages[code]);
    this.name = "ConversionError";
    this.code = code;
  }
}

export function getSafeErrorMessage(code: ConversionErrorCode): string {
  return safeMessages[code];
}
