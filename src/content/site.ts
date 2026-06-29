export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getSupportEmail(): string {
  if (process.env.NEXT_PUBLIC_SUPPORT_EMAIL) {
    return process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  }

  const hostname = new URL(getSiteUrl()).hostname.replace(/^www\./, "");
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "support@example.com";
  }

  return `support@${hostname}`;
}

export function getGoogleAdsenseClient(): string | null {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT?.trim();
  return client && /^ca-pub-\d+$/.test(client) ? client : null;
}

export function getGoogleAdsenseSlot(): string | null {
  const slot = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT?.trim();
  return slot && /^\d+$/.test(slot) ? slot : null;
}
