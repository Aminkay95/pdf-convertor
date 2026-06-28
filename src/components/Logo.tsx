import Link from "next/link";

type LogoProps = {
  href?: string | null;
  compact?: boolean;
};

export function Logo({ href = "/", compact = false }: LogoProps) {
  const mark = (
    <>
      <span className="logo-mark" aria-hidden="true">
        <span className="logo-page" />
        <span className="logo-grid">
          <span />
          <span />
          <span />
          <span />
        </span>
      </span>
      <span className="logo-text">
        <span>Statement</span>
        {!compact && <span>Converter</span>}
      </span>
    </>
  );

  return href !== null ? (
    <Link className="brand" href={href} aria-label="Statement Converter home">
      {mark}
    </Link>
  ) : (
    <div className="brand brand-static">
      {mark}
    </div>
  );
}
