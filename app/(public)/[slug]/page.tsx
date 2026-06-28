import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicAdSlot } from "@/adapters/ads/PublicAdSlot";
import { getSeoPage, seoPages } from "@/content/seo/pages";
import { getSupportEmail } from "@/content/site";

export function generateStaticParams() {
  return seoPages.map((page) => ({ slug: page.slug }));
}

type SlugParams = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage(slug);
  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${page.slug}`
    }
  };
}

export default async function SeoLandingPage({ params }: SlugParams) {
  const { slug } = await params;
  const page = getSeoPage(slug);
  if (!page) {
    notFound();
  }
  const isPolicyPage = page.pageType === "policy";
  const supportEmail = slug === "contact" ? getSupportEmail() : null;

  return (
    <main className="page content-page">
      <h1>{page.title}</h1>
      <p>{page.description}</p>
      {supportEmail ? (
        <section className="contact-box" aria-label="Support email">
          <h2>Email</h2>
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </section>
      ) : null}
      {!isPolicyPage ? (
        <div className="cta-row">
          <Link className="button" href="/converter">
            {page.ctaLabel ?? "Open shared converter"}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      ) : null}
      <section className="feature-grid" aria-label="Page details">
        {page.sections.map((section) => (
          <article className="tile" key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
      <section className="tile" style={{ marginTop: 24 }}>
        <h2>What to expect</h2>
        <p>{page.expectation}</p>
      </section>
      {!isPolicyPage ? <PublicAdSlot pageType={page.slug} /> : null}
    </main>
  );
}
