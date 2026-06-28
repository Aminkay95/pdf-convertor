export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  summary: string;
  expectation: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
};

export const seoPages: SeoPage[] = [
  {
    slug: "bank-statement-pdf-to-excel",
    title: "Bank Statement PDF to Excel",
    description:
      "Convert bank statement PDFs into an editable Excel file after reviewing source-derived columns in the shared converter.",
    summary: "Excel export for bank statement transactions.",
    expectation:
      "Use the preview to check deposits, withdrawals, fees, and balances before downloading a generic Excel file.",
    sections: [
      { heading: "Source columns", body: "The preview keeps statement-style columns instead of forcing one universal banking schema." },
      { heading: "Local first", body: "Digital bank statement PDFs are attempted in the browser before any OCR path is considered." },
      { heading: "Review step", body: "Lightweight edits are reflected directly in the Excel output." }
    ]
  },
  {
    slug: "bank-statement-pdf-to-csv",
    title: "Bank Statement PDF to CSV",
    description:
      "Create a CSV from a reviewed bank statement preview for bookkeeping imports and spreadsheet analysis.",
    summary: "CSV export for bank statement workflows.",
    expectation:
      "CSV downloads are generated from the current preview, including any edits made before export.",
    sections: [
      { heading: "Import friendly", body: "CSV output is useful for tools that prefer simple rows and columns." },
      { heading: "Privacy receipt", body: "After export, the receipt explains whether server processing occurred." },
      { heading: "No accounts", body: "The v1 converter does not require sign-up or saved history." }
    ]
  },
  {
    slug: "credit-card-statement-pdf-to-excel",
    title: "Credit Card Statement PDF to Excel",
    description:
      "Turn credit card statement PDFs into editable Excel files while preserving purchase, payment, credit, and fee rows for review.",
    summary: "Excel conversion for credit card statements.",
    expectation:
      "Check payments, credits, purchases, fees, and interest rows in the preview before trusting the spreadsheet.",
    sections: [
      { heading: "Card rows", body: "The converter is designed for purchase and payment rows as well as bank-style statements." },
      { heading: "Editable preview", body: "Correct merchant text or amount issues before creating the final file." },
      { heading: "Bounded claims", body: "The product avoids promising perfect extraction across every card issuer layout." }
    ]
  },
  {
    slug: "credit-card-statement-pdf-to-csv",
    title: "Credit Card Statement PDF to CSV",
    description:
      "Export credit card statement PDF transactions to CSV from a reviewed, editable preview table.",
    summary: "CSV conversion for card statement imports.",
    expectation:
      "The CSV file reflects the reviewed preview and uses a generic filename that avoids statement-derived identifiers.",
    sections: [
      { heading: "Bookkeeping imports", body: "CSV is useful for lightweight categorization and reconciliation workflows." },
      { heading: "Confidence cues", body: "OCR-like uncertain values can be highlighted so they are reviewed before export." },
      { heading: "Shared converter", body: "This page routes into the same converter, avoiding duplicated upload logic." }
    ]
  },
  {
    slug: "scanned-bank-statement-ocr-to-excel",
    title: "Scanned Bank Statement OCR to Excel",
    description:
      "Use OCR for image-based bank statement PDFs only after explicit server-processing consent, then review confidence-highlighted rows.",
    summary: "Consent-based OCR flow for scanned statements.",
    expectation:
      "Scanned PDFs may need server processing. The app asks first and marks the temporary cleanup status in the receipt.",
    sections: [
      { heading: "Consent first", body: "The OCR endpoint is not called until the user approves server processing for the current file." },
      { heading: "Temporary job", body: "The server path uses an opaque job boundary and under-30-minute cleanup messaging." },
      { heading: "Review required", body: "OCR rows may be uncertain, so highlighted values should be checked before export." }
    ]
  },
  {
    slug: "password-protected-bank-statement-converter",
    title: "Password-Protected Bank Statement Converter",
    description:
      "Open password-protected statement PDFs for the current conversion, with clear no-password-storage messaging.",
    summary: "Trust page for locked PDF statements.",
    expectation:
      "The password is used only for this conversion. If OCR is still needed, server use requires explicit consent.",
    sections: [
      { heading: "Current use only", body: "The UI states that passwords are not stored by the application." },
      { heading: "Local attempt", body: "Password-protected digital PDFs are retried locally where possible." },
      { heading: "Server boundary", body: "Passwords are not silently sent to a server path." }
    ]
  },
  {
    slug: "financial-statement-pdf-to-excel",
    title: "Financial Statement PDF to Excel",
    description:
      "Convert bank and credit card financial statement PDFs to Excel through a privacy-first, review-before-export workflow.",
    summary: "Broad financial statement PDF to Excel page.",
    expectation:
      "This is a focused statement converter, not a bookkeeping, tax, budgeting, or financial advice platform.",
    sections: [
      { heading: "Focused utility", body: "The product converts statements, shows what happened, and avoids accounts." },
      { heading: "Excel output", body: "Exports come from the reviewed preview rather than stale extraction output." },
      { heading: "Launch baseline", body: "The v1 launch test focus is US-style bank and credit card statements." }
    ]
  },
  {
    slug: "secure-bank-statement-converter",
    title: "Secure Bank Statement Converter",
    description:
      "A privacy-led bank statement converter with local-first processing, OCR consent, no accounts, and ad boundaries.",
    summary: "Privacy-led converter overview.",
    expectation:
      "Privacy and legal text should be reviewed before launch, but the implementation keeps the trust boundaries enforceable.",
    sections: [
      { heading: "No ad data", body: "Files, passwords, extracted rows, and preview edits are not shared with advertising systems." },
      { heading: "Receipt", body: "The privacy receipt distinguishes local processing from server OCR processing." },
      { heading: "No storage product", body: "The v1 app does not create accounts, saved document history, or long-term storage." }
    ]
  }
];

export function getSeoPage(slug: string): SeoPage | undefined {
  return seoPages.find((page) => page.slug === slug);
}
