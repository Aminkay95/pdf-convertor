export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  summary: string;
  expectation: string;
  pageType?: "landing" | "policy";
  ctaLabel?: string;
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
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description:
      "A general privacy policy explaining what information may be collected, how it may be used, and the choices available to users.",
    summary: "General privacy policy.",
    expectation:
      "This boilerplate privacy policy is provided for general information and should be reviewed before public launch.",
    pageType: "policy",
    sections: [
      {
        heading: "Information we collect",
        body:
          "We may collect information you provide directly, information generated when you use the site, and basic technical information such as browser type, device type, IP address, pages visited, referring pages, and approximate usage times."
      },
      {
        heading: "How we use information",
        body:
          "We may use information to provide and maintain the service, respond to requests, improve site performance, monitor security, prevent misuse, understand usage trends, and comply with legal obligations."
      },
      {
        heading: "Files and user content",
        body:
          "If you upload or provide files or other content, that content is used to deliver the requested service. You are responsible for making sure you have the right to submit any content you provide."
      },
      {
        heading: "Cookies and similar technologies",
        body:
          "We may use cookies, local storage, analytics tools, or similar technologies to operate the site, remember preferences, measure usage, and support advertising or affiliate features where enabled."
      },
      {
        heading: "Sharing information",
        body:
          "We do not sell personal information. We may share information with service providers who help operate the site, when required by law, to protect rights and safety, or as part of a business transfer such as a merger or acquisition."
      },
      {
        heading: "Data retention",
        body:
          "We keep information only for as long as reasonably necessary for the purposes described in this policy, unless a longer retention period is required or permitted by law."
      },
      {
        heading: "Your privacy choices",
        body:
          "You may stop using the site, adjust browser cookie settings, avoid submitting sensitive information, and contact us to ask about access, correction, deletion, or other privacy requests available under applicable law."
      },
      {
        heading: "Children's privacy",
        body:
          "The service is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided information, contact us so we can review and respond."
      },
      {
        heading: "Changes to this policy",
        body:
          "We may update this policy from time to time. Changes will be posted on this page with the updated version taking effect when published unless otherwise stated."
      },
      {
        heading: "Contact us",
        body:
          "If you have questions about this privacy policy or how information is handled, contact the site owner using the contact information provided on the site."
      }
    ]
  },
  {
    slug: "terms",
    title: "Terms of Use",
    description:
      "The rules for using this PDF converter, including acceptable use, no financial advice, availability, and user responsibility.",
    summary: "Use rules and service limitations.",
    expectation:
      "These terms are a practical launch baseline, not a substitute for legal advice.",
    pageType: "policy",
    sections: [
      {
        heading: "Use of the service",
        body:
          "You may use the converter to process documents that you own or are authorized to process. You are responsible for reviewing the converted output before relying on it."
      },
      {
        heading: "No financial advice",
        body:
          "The converter is a document utility. It does not provide bookkeeping, tax, investment, legal, or financial advice."
      },
      {
        heading: "Acceptable use",
        body:
          "Do not use the service to process documents unlawfully, attack the service, bypass security controls, overload the infrastructure, or upload malware or harmful content."
      },
      {
        heading: "Accuracy",
        body:
          "PDF extraction and OCR can make mistakes. You should verify all rows, amounts, dates, labels, and formulas before using exported files."
      },
      {
        heading: "Availability",
        body:
          "The service may change, pause, or stop at any time. We are not responsible for losses caused by downtime, conversion errors, or unsupported document formats."
      },
      {
        heading: "Changes",
        body:
          "These terms may be updated as the product, hosting, analytics, advertising, or support processes change."
      }
    ]
  },
  {
    slug: "contact",
    title: "Contact",
    description:
      "Contact the site owner about privacy, support, corrections, advertising review, or document conversion issues.",
    summary: "Support and site-owner contact information.",
    expectation:
      "Use a working support address before applying to AdSense so reviewers and users can reach the site owner.",
    pageType: "policy",
    sections: [
      {
        heading: "Support",
        body:
          "For help with conversion issues, include the type of PDF, whether it was scanned or digital, and what output you expected. Do not email sensitive bank statements unless explicitly requested through a secure support process."
      },
      {
        heading: "Privacy requests",
        body:
          "For privacy questions or data-handling concerns, use the support email shown on this page."
      },
      {
        heading: "Advertising and policy",
        body:
          "For advertising, content, or site policy questions, use the support email shown on this page."
      }
    ]
  },
  {
    slug: "about",
    title: "About",
    description:
      "A focused PDF conversion utility for turning bank and credit card statement PDFs into reviewed Excel or CSV files.",
    summary: "What the converter does and does not do.",
    expectation:
      "This page helps reviewers understand the site purpose before AdSense approval.",
    pageType: "policy",
    sections: [
      {
        heading: "Purpose",
        body:
          "This site helps users convert financial statement PDFs into editable spreadsheets for review, cleanup, and personal workflow use."
      },
      {
        heading: "Scope",
        body:
          "The product focuses on conversion and export. It does not replace accounting software, reconciliation tools, tax preparation, or professional advice."
      },
      {
        heading: "Review-first workflow",
        body:
          "Users are expected to inspect extracted rows and correct mistakes before downloading Excel or CSV files."
      }
    ]
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    description:
      "How cookies and similar technologies may be used for core functionality, analytics, and advertising on public pages.",
    summary: "Cookie and similar technology disclosure.",
    expectation:
      "Update this page when you add a real analytics or advertising provider configuration.",
    pageType: "policy",
    sections: [
      {
        heading: "Essential technologies",
        body:
          "The site may use essential browser storage or request data to keep the converter working, maintain security, and remember basic interface state."
      },
      {
        heading: "Analytics",
        body:
          "Analytics may be used to understand public page performance and product usage patterns. Analytics should not receive uploaded files, passwords, extracted rows, or preview edits."
      },
      {
        heading: "Advertising",
        body:
          "If advertising is enabled, ad providers may use cookies or similar technologies on public pages according to their own policies and user controls."
      },
      {
        heading: "Controls",
        body:
          "You can manage cookies through your browser settings. Blocking some technologies may affect site functionality."
      }
    ]
  }
];

export function getSeoPage(slug: string): SeoPage | undefined {
  return seoPages.find((page) => page.slug === slug);
}
