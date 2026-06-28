import { ArrowRight, FileSpreadsheet, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PublicAdSlot } from "@/adapters/ads/PublicAdSlot";
import { Logo } from "@/components/Logo";
import { seoPages } from "@/content/seo/pages";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div>
          <div className="hero-brand">
            <Logo href={null} />
          </div>
          <h1>Financial Statement PDF to Excel</h1>
          <p>
            Convert bank and credit card statement PDFs into Excel files with a self-hosted server-side engine. Text PDFs use table extraction, and scanned PDFs fall back to OCR.
          </p>
          <div className="cta-row">
            <Link className="button" href="/converter">
              <FileSpreadsheet size={18} aria-hidden="true" />
              Open converter
            </Link>
            <Link className="button secondary" href="/secure-bank-statement-converter">
              <ShieldCheck size={18} aria-hidden="true" />
              Privacy details
            </Link>
          </div>
          <div className="trust-list">
            <div className="tile">
              <h2>Server engine</h2>
              <p>PDFs are converted by your own backend service instead of a third-party API.</p>
            </div>
            <div className="tile">
              <h2>Review before export</h2>
              <p>Edit rows and columns before downloading Excel or CSV.</p>
            </div>
            <div className="tile">
              <h2>OCR fallback</h2>
              <p>Scanned statements are processed with Tesseract OCR in the converter container.</p>
            </div>
          </div>
        </div>
        <div className="converter-panel">
          <LockKeyhole size={32} aria-hidden="true" />
          <h2>Trust boundary</h2>
          <p>
            Files and passwords are sent only to your self-hosted converter service. Temporary files live in request-scoped directories and are removed when processing finishes.
          </p>
          <Link className="button secondary" href="/converter">
            Try sample statement
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="seo-grid" aria-label="Conversion pages">
        {seoPages.map((page) => (
          <Link className="tile" href={`/${page.slug}`} key={page.slug}>
            <h2>{page.title}</h2>
            <p>{page.summary}</p>
          </Link>
        ))}
      </section>
      <PublicAdSlot pageType="home" />
    </main>
  );
}
