import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Financial Statement PDF to Excel Converter",
    template: "%s | Statement Converter"
  },
  description:
    "Convert bank and credit card statement PDFs into editable Excel or CSV files with local-first processing and explicit OCR consent."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="nav" aria-label="Primary navigation">
            <Link className="brand" href="/">
              Statement Converter
            </Link>
            <div className="nav-links">
              <Link href="/converter">Converter</Link>
              <Link href="/secure-bank-statement-converter">Privacy</Link>
              <Link href="/scanned-bank-statement-ocr-to-excel">OCR</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            No accounts, no financial advice, and no long-term document storage. Privacy and legal copy should be reviewed before public launch.
          </div>
        </footer>
      </body>
    </html>
  );
}
