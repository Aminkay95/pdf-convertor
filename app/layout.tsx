import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
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
            <Logo />
            <div className="nav-links">
              <Link href="/converter">Converter</Link>
              <Link href="/privacy-policy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/scanned-bank-statement-ocr-to-excel">OCR</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            <p>No accounts, no financial advice, and no long-term document storage. Privacy and legal copy should be reviewed before public launch.</p>
            <div className="footer-links" aria-label="Footer navigation">
              <Link href="/about">About</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/cookie-policy">Cookie Policy</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
